from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.config import get_settings
from app.schemas.settings import SettingsResponse, SettingsUpdate
from app.services.settings import get_settings_map, update_settings_map


router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingsResponse)
def get_app_settings(db: Session = Depends(get_db)) -> SettingsResponse:
    config = get_settings()
    return SettingsResponse(
        app_name=config.app_name,
        ollama_base_url=config.ollama_base_url,
        ollama_model=config.ollama_model,
        scheduler_enabled=config.scheduler_enabled,
        default_sync_interval_minutes=config.default_sync_interval_minutes,
        persisted_settings=get_settings_map(db),
    )


@router.patch("", response_model=SettingsResponse)
def patch_settings(payload: SettingsUpdate, db: Session = Depends(get_db)) -> SettingsResponse:
    persisted = update_settings_map(db, payload.values)
    config = get_settings()
    return SettingsResponse(
        app_name=config.app_name,
        ollama_base_url=config.ollama_base_url,
        ollama_model=config.ollama_model,
        scheduler_enabled=config.scheduler_enabled,
        default_sync_interval_minutes=config.default_sync_interval_minutes,
        persisted_settings=persisted,
    )
