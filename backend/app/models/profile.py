from sqlalchemy import JSON, Boolean, Column, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


profile_resume_links = Table(
    "profile_resume_links",
    Base.metadata,
    Column("profile_id", ForeignKey("search_profiles.id"), primary_key=True),
    Column("resume_id", ForeignKey("resumes.id"), primary_key=True),
)


class SearchProfile(Base):
    __tablename__ = "search_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_roles: Mapped[list] = mapped_column(JSON, default=list)
    preferred_locations: Mapped[list] = mapped_column(JSON, default=list)
    remote_preference: Mapped[str | None] = mapped_column(String(80), nullable=True)
    target_keywords: Mapped[list] = mapped_column(JSON, default=list)
    avoid_keywords: Mapped[list] = mapped_column(JSON, default=list)
    skills: Mapped[list] = mapped_column(JSON, default=list)
    seniority_preferences: Mapped[list] = mapped_column(JSON, default=list)
    authorization_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    company_preferences: Mapped[list] = mapped_column(JSON, default=list)
    scoring_weights: Mapped[dict] = mapped_column(JSON, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    resumes: Mapped[list["Resume"]] = relationship(secondary=profile_resume_links, back_populates="profiles")
    scores: Mapped[list["JobScore"]] = relationship(back_populates="profile", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    variant_type: Mapped[str | None] = mapped_column(String(120), nullable=True)
    text_content: Mapped[str] = mapped_column(Text)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)

    profiles: Mapped[list[SearchProfile]] = relationship(secondary=profile_resume_links, back_populates="resumes")
