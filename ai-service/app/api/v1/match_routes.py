from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from app.core.security import verify_service_token
from app.core.config import settings

router = APIRouter(dependencies=[Depends(verify_service_token)])


class MatchSearchRequest(BaseModel):
    vector_id: str
    vector_type: str  # 'face' | 'text' | 'clothing'
    region: str
    top_k: int = settings.default_top_k


class FactorScores(BaseModel):
    faceSimilarity: float | None = None
    descriptionSimilarity: float | None = None
    clothingSimilarity: float | None = None


class MatchCandidate(BaseModel):
    target_person_id: str
    target_type: str
    factor_scores: FactorScores


class MatchSearchResponse(BaseModel):
    candidates: List[MatchCandidate]
    model_version: str


@router.post("/match/search", response_model=MatchSearchResponse)
async def match_search(payload: MatchSearchRequest):
    """
    Queries the regional FAISS shard for the nearest candidates and returns
    raw per-factor similarity scores. Node.js applies the configurable
    weight table on top of these to produce the final overallConfidence —
    the weighting logic intentionally lives outside the ML layer so it can
    be tuned by admins without a model redeploy.
    """
    # placeholder — wire up to matching_service.search()
    return MatchSearchResponse(candidates=[], model_version="stub-v0")
