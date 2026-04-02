from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import ConnectorRun
from app.schemas.sources import ConnectorRunResponse, SyncRunRequest
from app.services.sync import run_sync


router = APIRouter(prefix="/sync", tags=["sync"])


@router.post("/run", response_model=list[ConnectorRunResponse])
async def post_sync_run(payload: SyncRunRequest, db: Session = Depends(get_db)) -> list[ConnectorRun]:
    return await run_sync(db, payload.source_names or None, payload.score_after_sync)


@router.get("/runs", response_model=list[ConnectorRunResponse])
def get_sync_runs(db: Session = Depends(get_db)) -> list[ConnectorRun]:
    return db.scalars(select(ConnectorRun).order_by(ConnectorRun.started_at.desc()).limit(50)).all()
