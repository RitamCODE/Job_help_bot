from pydantic import BaseModel, Field


class SettingsResponse(BaseModel):
    app_name: str
    ollama_base_url: str
    ollama_model: str
    scheduler_enabled: bool
    default_sync_interval_minutes: int
    persisted_settings: dict = Field(default_factory=dict)


class SettingsUpdate(BaseModel):
    values: dict = Field(default_factory=dict)
