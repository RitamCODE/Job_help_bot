from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Resume, SearchProfile
from app.schemas.profiles import ProfileCreate, ProfileUpdate


def list_profiles(session: Session) -> list[SearchProfile]:
    return session.scalars(select(SearchProfile).options(selectinload(SearchProfile.resumes)).order_by(SearchProfile.name)).all()


def create_profile(session: Session, payload: ProfileCreate) -> SearchProfile:
    profile = SearchProfile(**payload.model_dump(exclude={"resume_ids"}))
    if payload.resume_ids:
        profile.resumes = session.scalars(select(Resume).where(Resume.id.in_(payload.resume_ids))).all()
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile


def update_profile(session: Session, profile: SearchProfile, payload: ProfileUpdate) -> SearchProfile:
    data = payload.model_dump(exclude_unset=True, exclude={"resume_ids"})
    for key, value in data.items():
        setattr(profile, key, value)
    if payload.resume_ids is not None:
        profile.resumes = session.scalars(select(Resume).where(Resume.id.in_(payload.resume_ids))).all()
    session.commit()
    session.refresh(profile)
    return profile
