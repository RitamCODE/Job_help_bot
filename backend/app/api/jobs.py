from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.llm.ranking import score_job_against_active_profiles, score_job_against_profile
from app.schemas.jobs import ImportUrlRequest, JobNoteCreate, JobResponse, JobsListResponse, JobStatusUpdate
from app.services.jobs import add_job_note, get_job, import_job_url, list_jobs, update_job_status


router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("", response_model=JobsListResponse)
def get_jobs(db: Session = Depends(get_db)) -> JobsListResponse:
    jobs = list_jobs(db)
    return JobsListResponse(items=jobs, total=len(jobs))


@router.get("/{job_id}", response_model=JobResponse)
def get_job_by_id(job_id: int, db: Session = Depends(get_db)) -> JobResponse:
    job = get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return job


@router.post("/import-url", response_model=JobResponse)
async def import_url(payload: ImportUrlRequest, db: Session = Depends(get_db)) -> JobResponse:
    return await import_job_url(db, payload.model_dump())


@router.patch("/{job_id}/status", response_model=JobResponse)
def patch_job_status(job_id: int, payload: JobStatusUpdate, db: Session = Depends(get_db)) -> JobResponse:
    job = get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return update_job_status(db, job, payload.status)


@router.patch("/{job_id}/notes", response_model=JobResponse)
def patch_job_notes(job_id: int, payload: JobNoteCreate, db: Session = Depends(get_db)) -> JobResponse:
    job = get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    add_job_note(db, job, payload.content)
    refreshed = get_job(db, job_id)
    if not refreshed:
        raise HTTPException(status_code=404, detail="Job not found after note update.")
    return refreshed


@router.post("/{job_id}/score", response_model=JobResponse)
async def score_job(job_id: int, db: Session = Depends(get_db)) -> JobResponse:
    job = get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    await score_job_against_active_profiles(db, job_id)
    refreshed = get_job(db, job_id)
    if not refreshed:
        raise HTTPException(status_code=404, detail="Job not found after scoring.")
    return refreshed


@router.post("/{job_id}/score-against-profile/{profile_id}", response_model=JobResponse)
async def score_job_for_profile(job_id: int, profile_id: int, db: Session = Depends(get_db)) -> JobResponse:
    job = get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    await score_job_against_profile(db, job_id, profile_id)
    refreshed = get_job(db, job_id)
    if not refreshed:
        raise HTTPException(status_code=404, detail="Job not found after scoring.")
    return refreshed
