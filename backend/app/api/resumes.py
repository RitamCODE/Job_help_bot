from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Resume
from app.schemas.resumes import ResumeCreate, ResumeResponse, ResumeUpdate, ResumeUploadResponse
from app.services.resumes import create_resume, create_resume_from_upload, list_resumes, update_resume


router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.get("", response_model=list[ResumeResponse])
def get_resumes(db: Session = Depends(get_db)) -> list[Resume]:
    return list_resumes(db)


@router.post("", response_model=ResumeResponse)
def post_resume(payload: ResumeCreate, db: Session = Depends(get_db)) -> Resume:
    return create_resume(db, payload)


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    name: str = Form(...),
    variant_type: str | None = Form(default=None),
    tags: str = Form(default=""),
    is_default: bool = Form(default=False),
    db: Session = Depends(get_db),
) -> ResumeUploadResponse:
    filename = file.filename or "resume.txt"
    content = await file.read()
    parsed_tags = [tag.strip() for tag in tags.split(",") if tag.strip()]
    try:
        resume, detected_format, extracted_characters = create_resume_from_upload(
            db,
            name=name,
            variant_type=variant_type,
            tags=parsed_tags,
            is_default=is_default,
            filename=filename,
            content=content,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return ResumeUploadResponse(
        id=resume.id,
        name=resume.name,
        variant_type=resume.variant_type,
        text_content=resume.text_content,
        tags=resume.tags,
        is_default=resume.is_default,
        original_filename=filename,
        detected_format=detected_format,
        extracted_characters=extracted_characters,
    )


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
