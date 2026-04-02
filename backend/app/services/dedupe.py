from difflib import SequenceMatcher

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import DedupeLink, Job
from app.utils.text import build_hash_signature, canonicalize_url, normalize_text


def fuzzy_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, normalize_text(a), normalize_text(b)).ratio()


def find_existing_job(session: Session, normalized: dict) -> Job | None:
    canonical_url = canonicalize_url(normalized["url"])
    candidates = session.scalars(select(Job)).all()
    for job in candidates:
        if job.url and canonicalize_url(job.url) == canonical_url:
            return job
        if normalized.get("source_job_id") and job.source == normalized["source"] and job.source_job_id == normalized.get("source_job_id"):
            return job
        location_a = normalized.get("location") or ""
        location_b = job.location or ""
        title_match = fuzzy_similarity(normalized["title"], job.title)
        company_match = fuzzy_similarity(normalized["company"], job.company)
        location_match = fuzzy_similarity(location_a, location_b) if location_a or location_b else 1.0
        if title_match > 0.92 and company_match > 0.96 and location_match > 0.8:
            return job
        if normalized["hash_signature"] == job.hash_signature:
            return job
    return None


def apply_dedupe_link(session: Session, job: Job, normalized: dict, confidence: float = 1.0) -> None:
    session.add(
        DedupeLink(
            job=job,
            duplicate_key=build_hash_signature(normalized["title"], normalized["company"], normalized.get("location"), normalized.get("description")),
            source_name=normalized["source"],
            linked_url=normalized.get("url"),
            confidence=confidence,
        )
    )
