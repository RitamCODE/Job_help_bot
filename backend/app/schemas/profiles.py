from pydantic import BaseModel, Field

from app.schemas.common import ORMBase


class ProfileBase(BaseModel):
    name: str
    description: str | None = None
    target_roles: list[str] = Field(default_factory=list)
    preferred_locations: list[str] = Field(default_factory=list)
    remote_preference: str | None = None
    target_keywords: list[str] = Field(default_factory=list)
    avoid_keywords: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    seniority_preferences: list[str] = Field(default_factory=list)
    authorization_notes: str | None = None
    company_preferences: list[str] = Field(default_factory=list)
    scoring_weights: dict = Field(default_factory=dict)
    resume_ids: list[int] = Field(default_factory=list)
    is_active: bool = True


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    target_roles: list[str] | None = None
    preferred_locations: list[str] | None = None
    remote_preference: str | None = None
    target_keywords: list[str] | None = None
    avoid_keywords: list[str] | None = None
    skills: list[str] | None = None
    seniority_preferences: list[str] | None = None
    authorization_notes: str | None = None
    company_preferences: list[str] | None = None
    scoring_weights: dict | None = None
    resume_ids: list[int] | None = None
    is_active: bool | None = None


class ProfileResponse(ORMBase):
    id: int
    name: str
    description: str | None = None
    target_roles: list[str] = Field(default_factory=list)
    preferred_locations: list[str] = Field(default_factory=list)
    remote_preference: str | None = None
    target_keywords: list[str] = Field(default_factory=list)
    avoid_keywords: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    seniority_preferences: list[str] = Field(default_factory=list)
    authorization_notes: str | None = None
    company_preferences: list[str] = Field(default_factory=list)
    scoring_weights: dict = Field(default_factory=dict)
    is_active: bool
