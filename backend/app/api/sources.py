from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import JobSource
from app.schemas.sources import SourceResponse, SourceUpdate


router = APIRouter(prefix="/sources", tags=["sources"])


@router.get("", response_model=list[SourceResponse])
def get_sources(db: Session = Depends(get_db)) -> list[JobSource]:
    return db.scalars(select(JobSource).order_by(JobSource.name)).all()


@router.patch("/{name}", response_model=SourceResponse)
def patch_source(name: str, payload: SourceUpdate, db: Session = Depends(get_db)) -> JobSource:
    source = db.scalar(select(JobSource).where(JobSource.name == name))
    if not source:
        raise HTTPException(status_code=404, detail="Source not found.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(source, key, value)
    db.commit()
    db.refresh(source)
    return source
