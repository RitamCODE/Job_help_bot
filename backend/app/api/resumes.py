from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Resume
from app.schemas.resumes import ResumeCreate, ResumeResponse, ResumeUpdate
from app.services.resumes import create_resume, list_resumes, update_resume


router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.get("", response_model=list[ResumeResponse])
def get_resumes(db: Session = Depends(get_db)) -> list[Resume]:
    return list_resumes(db)


@router.post("", response_model=ResumeResponse)
def post_resume(payload: ResumeCreate, db: Session = Depends(get_db)) -> Resume:
    return create_resume(db, payload)


@router.patch("/{resume_id}", response_model=ResumeResponse)
def patch_resume(resume_id: int, payload: ResumeUpdate, db: Session = Depends(get_db)) -> Resume:
    resume = db.get(Resume, resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return update_resume(db, resume, payload)


@router.delete("/{resume_id}", status_code=204)
def delete_resume(resume_id: int, db: Session = Depends(get_db)) -> Response:
    resume = db.get(Resume, resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    db.delete(resume)
    db.commit()
    return Response(status_code=204)
