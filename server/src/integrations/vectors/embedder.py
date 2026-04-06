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

# Request Models
class EmbedRequest(BaseModel):
    text: str

class EmbedBatchRequest(BaseModel):
    texts: list[str]

# Response Models
class EmbedResponse(BaseModel):
    text: str
    vector: list[float]
    dimensions: int

class EmbedBatchResponse(BaseModel):
    vectors: list[list[float]]
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

@app.post("/embed-batch", response_model=EmbedBatchResponse)
def get_embedding_batch(req: EmbedBatchRequest):
    if not model:
        raise HTTPException(status_code=503, detail="Model is not loaded")

    if not req.texts or any(not text.strip() for text in req.texts):
        raise HTTPException(status_code=400, detail="Texts list cannot be empty and elements cannot be empty strings")

    try:
        # Generate dense vectors for a batch
        embeddings = model.encode(req.texts)
        vectors = embeddings.tolist()

        return EmbedBatchResponse(
            vectors=vectors,
            dimensions=len(vectors[0]) if vectors else 0
        )
    except Exception as e:
        logger.error(f"Batch Embedding error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("embedder:app", host="0.0.0.0", port=5001)
