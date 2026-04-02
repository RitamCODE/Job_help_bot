from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Resume
from app.schemas.resumes import ResumeCreate, ResumeUpdate


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
