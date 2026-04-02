from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.connectors.manual_url import ManualUrlConnector
from app.llm.ranking import score_job_against_active_profiles
from app.models import Job, JobAction, JobNote, RawJobRecord
from app.services.dedupe import apply_dedupe_link, find_existing_job
from app.utils.text import build_hash_signature, canonicalize_url


def list_jobs(session: Session) -> list[Job]:
    return session.scalars(
        select(Job).options(selectinload(Job.scores), selectinload(Job.notes)).order_by(Job.discovered_at.desc())
    ).all()


def get_job(session: Session, job_id: int) -> Job | None:
    return session.scalar(
        select(Job).options(selectinload(Job.scores), selectinload(Job.notes)).where(Job.id == job_id)
    )


def create_or_merge_job(session: Session, normalized: dict, raw_payload: dict) -> tuple[Job, bool]:
    normalized["canonical_url"] = canonicalize_url(normalized["url"])
    normalized["hash_signature"] = build_hash_signature(
        normalized["title"], normalized["company"], normalized.get("location"), normalized.get("description")
    )
    normalized["discovered_at"] = normalized.get("discovered_at") or datetime.now(UTC)
    existing = find_existing_job(session, normalized)
    if existing:
        apply_dedupe_link(session, existing, normalized, confidence=0.95)
        session.add(
            RawJobRecord(
                job=existing,
                source_name=normalized["source"],
                source_job_id=normalized.get("source_job_id"),
                payload=raw_payload,
            )
        )
        session.commit()
        session.refresh(existing)
        return existing, False

    job = Job(**normalized)
    session.add(job)
    session.flush()
    session.add(
        RawJobRecord(
            job=job,
            source_name=normalized["source"],
            source_job_id=normalized.get("source_job_id"),
            payload=raw_payload,
        )
    )
    apply_dedupe_link(session, job, normalized)
    session.commit()
    session.refresh(job)
    return job, True


async def import_job_url(session: Session, payload: dict) -> Job:
    connector = ManualUrlConnector()
    normalized = connector.normalize(payload)
    job, _ = create_or_merge_job(session, normalized, payload)
    await score_job_against_active_profiles(session, job.id)
    session.refresh(job)
    return get_job(session, job.id) or job


def update_job_status(session: Session, job: Job, status: str) -> Job:
    job.status = status
    session.add(JobAction(job=job, action_type=f"status:{status}", action_metadata={"status": status}))
    session.commit()
    session.refresh(job)
    return job


def add_job_note(session: Session, job: Job, content: str) -> JobNote:
    note = JobNote(job=job, content=content)
    session.add(note)
    session.add(JobAction(job=job, action_type="note", action_metadata={"preview": content[:120]}))
    session.commit()
    session.refresh(note)
    return note


def analytics_summary(session: Session) -> dict:
    total_jobs = session.scalar(select(func.count(Job.id))) or 0
    jobs_by_status = {row[0]: row[1] for row in session.execute(select(Job.status, func.count(Job.id)).group_by(Job.status))}
    jobs_by_source = {row[0]: row[1] for row in session.execute(select(Job.source, func.count(Job.id)).group_by(Job.source))}
    return {"total_jobs": total_jobs, "jobs_by_status": jobs_by_status, "jobs_by_source": jobs_by_source}
