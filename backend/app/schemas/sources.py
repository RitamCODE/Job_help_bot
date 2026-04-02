from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMBase


class SourceUpdate(BaseModel):
    display_name: str | None = None
    config: dict | None = None
    is_enabled: bool | None = None
    sync_interval_minutes: int | None = None


class SourceResponse(ORMBase):
    id: int
    name: str
    connector_type: str
    display_name: str
    config: dict = Field(default_factory=dict)
    is_enabled: bool
    sync_interval_minutes: int
    last_status: str | None = None
    last_synced_at: datetime | None = None


class ConnectorRunResponse(ORMBase):
    id: int
    connector_name: str
    status: str
    message: str | None = None
    fetched_count: int
    created_count: int
    deduped_count: int
    started_at: datetime
    completed_at: datetime | None = None
    run_metadata: dict = Field(default_factory=dict)


class SyncRunRequest(BaseModel):
    source_names: list[str] = Field(default_factory=list)
    score_after_sync: bool = True
