import os
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import uvicorn
import logging

# Initialize FastAPI app
app = FastAPI(title="SwiftRoute AI Embedder", version="1.0.0")

# Setup generic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Request Model
class EmbedRequest(BaseModel):
    text: str

# Response Model
class EmbedResponse(BaseModel):
    text: str
    vector: list[float]
    dimensions: int

# Load the ML model (loads on boot)
logger.info("Loading SentenceTransformer model 'all-MiniLM-L6-v2'...")
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    logger.info("Model loaded successfully!")
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    model = None

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/embed", response_model=EmbedResponse)
def get_embedding(req: EmbedRequest):
    if not model:
        raise HTTPException(status_code=503, detail="Model is not loaded")
    
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    try:
        # Generate dense vector
        embeddings = model.encode([req.text])
        vector = embeddings[0].tolist()
        
        return EmbedResponse(
            text=req.text,
            vector=vector,
            dimensions=len(vector)
        )
    except Exception as e:
        logger.error(f"Embedding error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("embedder:app", host="0.0.0.0", port=5001, reload=True)
