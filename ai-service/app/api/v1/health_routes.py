from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()


@router.get("/health")
async def health():
    return {
        "success": True,
        "data": {
            "status": "ok",
            "service": "reconnect-ai-service",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
        "error": None,
    }
