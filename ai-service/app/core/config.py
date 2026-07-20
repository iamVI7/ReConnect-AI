from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Environment-driven settings for the AI service.
    This service is stateless except for the FAISS index files under
    app/index/shards/, and is never publicly reachable — only the
    Node.js backend calls it, using a short-lived signed service JWT.
    """

    service_jwt_secret: str = "change-me-service"
    faiss_index_dir: str = "app/index/shards"
    default_top_k: int = 10
    environment: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
