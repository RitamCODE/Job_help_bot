from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import SearchProfile
from app.schemas.profiles import ProfileCreate, ProfileResponse, ProfileUpdate
from app.services.profiles import create_profile, list_profiles, update_profile


router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("", response_model=list[ProfileResponse])
def get_profiles(db: Session = Depends(get_db)) -> list[SearchProfile]:
    return list_profiles(db)


@router.post("", response_model=ProfileResponse)
def post_profile(payload: ProfileCreate, db: Session = Depends(get_db)) -> SearchProfile:
    return create_profile(db, payload)


@router.get("/{profile_id}", response_model=ProfileResponse)
def get_profile(profile_id: int, db: Session = Depends(get_db)) -> SearchProfile:
    profile = db.get(SearchProfile, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return profile


@router.patch("/{profile_id}", response_model=ProfileResponse)
def patch_profile(profile_id: int, payload: ProfileUpdate, db: Session = Depends(get_db)) -> SearchProfile:
    profile = db.get(SearchProfile, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return update_profile(db, profile, payload)


@router.delete("/{profile_id}", status_code=204)
def delete_profile(profile_id: int, db: Session = Depends(get_db)) -> Response:
    profile = db.get(SearchProfile, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    db.delete(profile)
    db.commit()
    return Response(status_code=204)
