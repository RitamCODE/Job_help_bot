from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Resume
from app.schemas.resumes import ResumeCreate, ResumeUpdate
from app.services.resume_parser import parse_resume_file


def list_resumes(session: Session) -> list[Resume]:
    return session.scalars(select(Resume).order_by(Resume.name)).all()


def create_resume(session: Session, payload: ResumeCreate) -> Resume:
    resume = Resume(**payload.model_dump())
    session.add(resume)
    session.commit()
    session.refresh(resume)
    return resume


def update_resume(session: Session, resume: Resume, payload: ResumeUpdate) -> Resume:
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(resume, key, value)
    session.commit()
    session.refresh(resume)
    return resume


def create_resume_from_upload(
    session: Session,
    *,
    name: str,
    variant_type: str | None,
    tags: list[str],
    is_default: bool,
    filename: str,
    content: bytes,
) -> tuple[Resume, str, int]:
    extracted_text, detected_format = parse_resume_file(filename, content)
    if not extracted_text.strip():
        raise ValueError("Could not extract text from the uploaded resume.")

    resume = Resume(
        name=name,
        variant_type=variant_type,
        text_content=extracted_text.strip(),
        tags=tags,
        is_default=is_default,
    )
    session.add(resume)
    session.commit()
    session.refresh(resume)
    return resume, detected_format, len(extracted_text)
