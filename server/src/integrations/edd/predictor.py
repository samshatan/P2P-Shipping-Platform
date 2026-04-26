
import os
import math
import logging
import hashlib
from datetime import datetime, timedelta
from typing import Optional

import numpy as np
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

try:
    import lightgbm as lgb
    LGB_AVAILABLE = True
except ImportError:
    LGB_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SwiftRoute EDD Predictor", version="1.0.0")

COURIER_PERFORMANCE: dict[str, dict] = {
    "delhivery": {
        "avg_days":    2.4,
        "rto_percent": 8.2,
        "avg_delay":   0.3,   
        "reliability": 0.87,
    },
    "dtdc": {
        "avg_days":    3.1,
        "rto_percent": 11.5,
        "avg_delay":   0.6,
        "reliability": 0.81,
    },
    "xpressbees": {
        "avg_days":    2.7,
        "rto_percent": 9.0,
        "avg_delay":   0.4,
        "reliability": 0.84,
    },
    "default": {
        "avg_days":    3.5,
        "rto_percent": 12.0,
        "avg_delay":   0.8,
        "reliability": 0.75,
    },
}

def get_zone(pickup: str, delivery: str) -> int:
    """Estimate zone from pincode prefixes."""
    if pickup[:3] == delivery[:3]:
        return 1   # Same city
    if pickup[:2] == delivery[:2]:
        return 2   # Same state/region
    remote_prefixes = {"79", "19", "17", "74", "73"}
    if delivery[:2] in remote_prefixes:
        return 4
    return 3       # Cross-region (metro to metro etc.)

ZONE_DAY_ADDER = {1: 0, 2: 0.5, 3: 1.0, 4: 2.5}

def weight_adder(weight_grams: int) -> float:
    if weight_grams <= 500:
        return 0.0
    if weight_grams <= 2000:
        return 0.2
    if weight_grams <= 5000:
        return 0.5
    if weight_grams <= 20000:
        return 1.0
    return 2.0

def rule_based_predict(
    pickup_pincode: str,
    delivery_pincode: str,
    courier_slug: str,
    weight_grams: int,
) -> dict:
    perf    = COURIER_PERFORMANCE.get(courier_slug, COURIER_PERFORMANCE["default"])
    zone    = get_zone(pickup_pincode, delivery_pincode)
    days    = perf["avg_days"] + ZONE_DAY_ADDER[zone] + weight_adder(weight_grams) + perf["avg_delay"]
    days    = max(1.0, round(days, 1))

    confidence = perf["reliability"] - (0.05 * (zone - 1))
    confidence = round(max(0.40, min(0.95, confidence)), 2)

    return {
        "predicted_days": math.ceil(days),
        "confidence":      confidence,
        "zone":            zone,
        "method":          "rule_based",
    }

MODEL_PATH = os.path.join(os.path.dirname(__file__), "edd_model.lgb")
lgb_model: Optional[object] = None

def load_model():
    global lgb_model
    if LGB_AVAILABLE and os.path.exists(MODEL_PATH):
        try:
            lgb_model = lgb.Booster(model_file=MODEL_PATH)
            logger.info(f"✅ LightGBM model loaded from {MODEL_PATH}")
        except Exception as e:
            logger.warning(f"⚠️  Failed to load LightGBM model: {e}. Falling back to rule-based.")
    else:
        logger.info("ℹ️  No LightGBM model found — using rule-based predictor.")

def build_feature_vector(
    pickup_pincode: str,
    delivery_pincode: str,
    courier_slug: str,
    weight_grams: int,
) -> np.ndarray:
    """
    Feature vector for LightGBM:
    [zone, weight_grams, weight_adder, avg_days, rto_pct, avg_delay, reliability, pincode_diff]
    """
    perf = COURIER_PERFORMANCE.get(courier_slug, COURIER_PERFORMANCE["default"])
    zone = get_zone(pickup_pincode, delivery_pincode)
    # Numeric pincode distance as a proxy for route length
    try:
        pincode_diff = abs(int(pickup_pincode) - int(delivery_pincode))
    except ValueError:
        pincode_diff = 0

    return np.array([[
        zone,
        weight_grams,
        weight_adder(weight_grams),
        perf["avg_days"],
        perf["rto_percent"],
        perf["avg_delay"],
        perf["reliability"],
        pincode_diff,
    ]], dtype=np.float32)

def lgb_predict(
    pickup_pincode: str,
    delivery_pincode: str,
    courier_slug: str,
    weight_grams: int,
) -> dict:
    if lgb_model is None:
        return rule_based_predict(pickup_pincode, delivery_pincode, courier_slug, weight_grams)

    try:
        features = build_feature_vector(pickup_pincode, delivery_pincode, courier_slug, weight_grams)
        predicted_days_float: float = float(lgb_model.predict(features)[0])  # type: ignore
        predicted_days = max(1, math.ceil(predicted_days_float))

        zone = get_zone(pickup_pincode, delivery_pincode)
        perf = COURIER_PERFORMANCE.get(courier_slug, COURIER_PERFORMANCE["default"])
        confidence = perf["reliability"] - (0.03 * (zone - 1))
        confidence = round(max(0.50, min(0.97, confidence)), 2)

        return {
            "predicted_days": predicted_days,
            "confidence":      confidence,
            "zone":            zone,
            "method":          "lightgbm",
        }
    except Exception as e:
        logger.error(f"LightGBM inference error: {e}. Falling back to rule-based.")
        return rule_based_predict(pickup_pincode, delivery_pincode, courier_slug, weight_grams)

class PredictRequest(BaseModel):
    pickup_pincode:   str
    delivery_pincode: str
    courier_slug:     str = "default"
    weight_grams:     int = 500

class PredictResponse(BaseModel):
    pickup_pincode:         str
    delivery_pincode:       str
    courier_slug:           str
    weight_grams:           int
    predicted_days:         int
    confidence:             float
    predicted_delivery_date: str     # ISO date string (YYYY-MM-DD)
    zone:                   int
    method:                 str      # "rule_based" | "lightgbm"

class BatchPredictRequest(BaseModel):
    shipments: list[PredictRequest]

class BatchPredictResponse(BaseModel):
    predictions: list[PredictResponse]

@app.get("/health")
def health():
    return {
        "status":      "ok",
        "model_ready": lgb_model is not None,
        "method":      "lightgbm" if lgb_model else "rule_based",
        "lightgbm_available": LGB_AVAILABLE,
    }

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    # Validate pincodes
    if not req.pickup_pincode.isdigit() or len(req.pickup_pincode) != 6:
        raise HTTPException(status_code=400, detail="pickup_pincode must be a 6-digit number")
    if not req.delivery_pincode.isdigit() or len(req.delivery_pincode) != 6:
        raise HTTPException(status_code=400, detail="delivery_pincode must be a 6-digit number")
    if req.weight_grams <= 0 or req.weight_grams > 50000:
        raise HTTPException(status_code=400, detail="weight_grams must be between 1 and 50000")

    result = lgb_predict(
        req.pickup_pincode,
        req.delivery_pincode,
        req.courier_slug,
        req.weight_grams,
    )

    delivery_date = datetime.now()
    days_added    = 0
    while days_added < result["predicted_days"]:
        delivery_date += timedelta(days=1)
        if delivery_date.weekday() != 6:  # Skip Sundays
            days_added += 1

    return PredictResponse(
        pickup_pincode=          req.pickup_pincode,
        delivery_pincode=        req.delivery_pincode,
        courier_slug=            req.courier_slug,
        weight_grams=            req.weight_grams,
        predicted_days=          result["predicted_days"],
        confidence=              result["confidence"],
        predicted_delivery_date= delivery_date.strftime("%Y-%m-%d"),
        zone=                    result["zone"],
        method=                  result["method"],
    )

@app.post("/predict/batch", response_model=BatchPredictResponse)
def predict_batch(req: BatchPredictRequest):
    if len(req.shipments) > 50:
        raise HTTPException(status_code=400, detail="Batch size cannot exceed 50")
    predictions = [predict(s) for s in req.shipments]
    return BatchPredictResponse(predictions=predictions)

@app.on_event("startup")
def startup():
    load_model()
    logger.info("🚀 EDD Predictor running on port 5002")

if __name__ == "__main__":
    uvicorn.run("predictor:app", host="0.0.0.0", port=5002, reload=False)
