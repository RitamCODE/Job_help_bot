from datetime import UTC, datetime

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import JobStatus, RemoteType


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    source: Mapped[str] = mapped_column(String(80), index=True)
    source_job_id: Mapped[str | None] = mapped_column(String(255), index=True)
    title: Mapped[str] = mapped_column(String(255), index=True)
    company: Mapped[str] = mapped_column(String(255), index=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    remote_type: Mapped[str] = mapped_column(String(40), default=RemoteType.UNKNOWN)
    employment_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    experience_level: Mapped[str | None] = mapped_column(String(80), nullable=True)
    description: Mapped[str] = mapped_column(Text)
    url: Mapped[str] = mapped_column(String(1024), unique=True)
    canonical_url: Mapped[str | None] = mapped_column(String(1024), nullable=True, index=True)
    posted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    discovered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    salary_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    raw_json: Mapped[dict] = mapped_column(JSON, default=dict)
    hash_signature: Mapped[str] = mapped_column(String(255), index=True)
    status: Mapped[str] = mapped_column(String(40), default=JobStatus.INBOX, index=True)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)

    scores: Mapped[list["JobScore"]] = relationship(back_populates="job", cascade="all, delete-orphan")
    notes: Mapped[list["JobNote"]] = relationship(back_populates="job", cascade="all, delete-orphan")
    actions: Mapped[list["JobAction"]] = relationship(back_populates="job", cascade="all, delete-orphan")
    dedupe_links: Mapped[list["DedupeLink"]] = relationship(back_populates="job", cascade="all, delete-orphan")
    raw_records: Mapped[list["RawJobRecord"]] = relationship(back_populates="job", cascade="all, delete-orphan")


class RawJobRecord(Base):
    __tablename__ = "raw_job_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_id: Mapped[int | None] = mapped_column(ForeignKey("jobs.id"), nullable=True, index=True)
    source_name: Mapped[str] = mapped_column(String(80), index=True)
    source_job_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    job: Mapped["Job | None"] = relationship(back_populates="raw_records")


class JobScore(Base):
    __tablename__ = "job_scores"
    __table_args__ = (UniqueConstraint("job_id", "profile_id", name="uq_job_profile_score"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"), index=True)
    profile_id: Mapped[int] = mapped_column(ForeignKey("search_profiles.id"), index=True)
    fit_score: Mapped[float] = mapped_column(Float, default=0.0)
    fit_label: Mapped[str] = mapped_column(String(40))
    summary: Mapped[str] = mapped_column(Text)
    top_matches: Mapped[list] = mapped_column(JSON, default=list)
    missing_skills: Mapped[list] = mapped_column(JSON, default=list)
    red_flags: Mapped[list] = mapped_column(JSON, default=list)
    recommendation: Mapped[str] = mapped_column(Text)
    resume_keywords: Mapped[list] = mapped_column(JSON, default=list)
    resume_tailoring_suggestions: Mapped[list] = mapped_column(JSON, default=list)
    outreach_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_model_output: Mapped[dict] = mapped_column(JSON, default=dict)
    scored_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    job: Mapped["Job"] = relationship(back_populates="scores")
    profile: Mapped["SearchProfile"] = relationship(back_populates="scores")


class JobAction(Base):
    __tablename__ = "job_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"), index=True)
    action_type: Mapped[str] = mapped_column(String(80))
    action_metadata: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    job: Mapped["Job"] = relationship(back_populates="actions")


class JobNote(Base):
    __tablename__ = "job_notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"), index=True)
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    job: Mapped["Job"] = relationship(back_populates="notes")


class DedupeLink(Base):
    __tablename__ = "dedupe_links"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"), index=True)
    duplicate_key: Mapped[str] = mapped_column(String(255), index=True)
    source_name: Mapped[str] = mapped_column(String(80))
    linked_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=1.0)

    job: Mapped["Job"] = relationship(back_populates="dedupe_links")
