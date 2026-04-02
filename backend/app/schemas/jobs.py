from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMBase


class JobNoteCreate(BaseModel):
    content: str


class JobStatusUpdate(BaseModel):
    status: str


class JobScoreResponse(ORMBase):
    id: int
    profile_id: int
    fit_score: float
    fit_label: str
    summary: str
    top_matches: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    red_flags: list[str] = Field(default_factory=list)
    recommendation: str
    resume_keywords: list[str] = Field(default_factory=list)
    resume_tailoring_suggestions: list[str] = Field(default_factory=list)
    outreach_message: str | None = None
    raw_model_output: dict = Field(default_factory=dict)
    scored_at: datetime | None = None


class JobNoteResponse(ORMBase):
    id: int
    content: str
    created_at: datetime
    updated_at: datetime


class JobResponse(ORMBase):
    id: int
    source: str
    source_job_id: str | None = None
    title: str
    company: str
    location: str | None = None
    remote_type: str
    employment_type: str | None = None
    experience_level: str | None = None
    description: str
    url: str
    canonical_url: str | None = None
    posted_at: datetime | None = None
    discovered_at: datetime
    salary_text: str | None = None
    tags: list[str] = Field(default_factory=list)
    raw_json: dict = Field(default_factory=dict)
    hash_signature: str
    status: str
    is_archived: bool
    scores: list[JobScoreResponse] = Field(default_factory=list)
    notes: list[JobNoteResponse] = Field(default_factory=list)


class JobsListResponse(BaseModel):
    items: list[JobResponse]
    total: int


class ImportUrlRequest(BaseModel):
    url: str
    source_name: str = "manual-url"
    title_hint: str | None = None
    company_hint: str | None = None
    description_text: str = ""
    location_hint: str | None = None
    tags: list[str] = Field(default_factory=list)
