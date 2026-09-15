import os
from pydantic import BaseModel

class Settings(BaseModel):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/geodiscover")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    PLACES_API_KEY: str = os.getenv("PLACES_API_KEY", "")
    MAPS_API_KEY: str = os.getenv("MAPS_API_KEY", "")
    DEFAULT_RADIUS_KM: float = 5.0
    OVERPASS_TIMEOUT_SEC: int = 25

settings = Settings()
