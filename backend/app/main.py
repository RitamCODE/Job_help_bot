from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.db.init_db import init_db
from app.llm.ollama_client import OllamaClient
from app.scheduler.manager import configure_scheduler


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    configure_scheduler()
    yield


settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router)


@app.get("/health")
async def health() -> dict:
    ollama = OllamaClient()
    return {
        "status": "ok",
        "app": settings.app_name,
        "ollama_available": await ollama.healthcheck(),
        "scheduler_enabled": settings.scheduler_enabled,
    }
