from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)


class Settings(BaseSettings):
    app_name: str = "OpenJobs Local"
    app_env: str = "development"
    backend_host: str = "127.0.0.1"
    backend_port: int = 8000
    frontend_origin: str = "http://localhost:5173"
    database_url: str = f"sqlite:///{(DATA_DIR / 'openjobs_local.db').as_posix()}"
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "llama3.1:8b"
    ollama_timeout_seconds: int = 60
    ollama_retries: int = 2
    scheduler_enabled: bool = True
    default_sync_interval_minutes: int = 180
    enable_sample_data: bool = True

    model_config = SettingsConfigDict(
        env_file=ROOT_DIR.parent / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
