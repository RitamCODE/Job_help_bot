from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AppSetting, Job, JobSource, Resume, SearchProfile
from app.models.enums import ConnectorType, JobStatus, RemoteType


def seed_database(session: Session) -> None:
    if session.scalar(select(SearchProfile.id).limit(1)):
        return

    profile = SearchProfile(
        name="Software Engineer",
        description="General software engineering profile for backend and platform roles.",
        target_roles=["software engineer", "backend engineer", "platform engineer"],
        preferred_locations=["New York, NY", "Remote"],
        remote_preference="remote_or_hybrid",
        target_keywords=["python", "fastapi", "distributed systems", "api"],
        avoid_keywords=["unpaid", "commission-only"],
        skills=["python", "sql", "cloud", "rest apis"],
        seniority_preferences=["mid", "senior"],
        authorization_notes="Requires employer support transparency.",
        company_preferences=["open source", "developer tools", "infrastructure"],
        scoring_weights={"skills": 0.35, "role": 0.2, "location": 0.15, "experience": 0.15, "preferences": 0.15},
        is_active=True,
    )
    resume = Resume(
        name="General SWE Resume",
        variant_type="software-engineering",
        text_content="Experienced engineer focused on Python, APIs, and backend systems.",
        tags=["general", "swe"],
        is_default=True,
    )
    source_greenhouse = JobSource(
        name="greenhouse-default",
        connector_type=ConnectorType.GREENHOUSE,
        display_name="Greenhouse Board",
        config={"board_token": "example-company"},
        is_enabled=True,
        sync_interval_minutes=180,
    )
    source_lever = JobSource(
        name="lever-default",
        connector_type=ConnectorType.LEVER,
        display_name="Lever Board",
        config={"company": "example-company"},
        is_enabled=True,
        sync_interval_minutes=180,
    )
    session.add_all([profile, resume, source_greenhouse, source_lever])
    session.flush()
    profile.resumes.append(resume)

    session.add(
        Job(
            source="seed",
            source_job_id="seed-1",
            title="Backend Engineer",
            company="Open Source Systems",
            location="Remote - US",
            remote_type=RemoteType.REMOTE,
            employment_type="full-time",
            experience_level="mid",
            description="Build APIs, services, and data pipelines using Python and SQL.",
            url="https://example.com/jobs/backend-engineer",
            posted_at=datetime.now(UTC),
            discovered_at=datetime.now(UTC),
            salary_text="$140k-$170k",
            tags=["python", "backend", "fastapi"],
            raw_json={"seed": True},
            hash_signature="seed-backend-engineer",
            status=JobStatus.INBOX,
        )
    )
    session.add(
        AppSetting(
            key="ui_preferences",
            value={"default_profile_id": 1, "show_experimental_connectors": True},
            description="Simple seed settings for the dashboard.",
        )
    )
    session.commit()
