from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.security import verify_service_token

router = APIRouter(dependencies=[Depends(verify_service_token)])


class EmbedFaceRequest(BaseModel):
    image_url: str
    region: str
    record_id: str


class EmbedResponse(BaseModel):
    vector_id: str


@router.post("/embed/face", response_model=EmbedResponse)
async def embed_face(payload: EmbedFaceRequest):
    """
    Generates a face embedding (ArcFace/FaceNet) from the given Cloudinary
    URL and upserts it into the regional FAISS shard immediately, per the
    approved incremental-indexing design.

    NOTE: model loading and FAISS upsert logic to be implemented in
    app/services/face_service.py and app/index/faiss_manager.py.
    """
    # placeholder — wire up to face_service.embed() + faiss_manager.upsert()
    return EmbedResponse(vector_id=f"stub-{payload.record_id}")


class EmbedTextRequest(BaseModel):
    text: str
    region: str
    record_id: str


@router.post("/embed/text", response_model=EmbedResponse)
async def embed_text(payload: EmbedTextRequest):
    """Generates a Sentence Transformers embedding for free-form descriptions."""
    return EmbedResponse(vector_id=f"stub-{payload.record_id}")
