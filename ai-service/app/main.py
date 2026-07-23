from fastapi import FastAPI
from app.api.v1 import health_routes, embed_routes, match_routes

app = FastAPI(
    title="ReConnect AI — AI Service",
    description="Internal-only inference service. Never exposed publicly — "
                "only the Node.js backend may call it, using a signed service JWT.",
    version="0.1.0",
)

# Health is unauthenticated (used for infra liveness/readiness probes only)
app.include_router(health_routes.router, prefix="/internal/v1", tags=["health"])

# Everything else requires a valid service JWT (see app/core/security.py)
app.include_router(embed_routes.router, prefix="/internal/v1", tags=["embeddings"])
app.include_router(match_routes.router, prefix="/internal/v1", tags=["matching"])
