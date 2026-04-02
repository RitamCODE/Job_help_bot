from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.connectors.generic_company import GenericCompanyConnector
from app.connectors.greenhouse import GreenhouseConnector
from app.connectors.lever import LeverConnector
from app.connectors.stubs import IndeedStubConnector, LinkedInStubConnector, TwitterXConnector, WellfoundConnector
from app.llm.ranking import score_job_against_active_profiles
from app.models import ConnectorRun, JobSource
from app.services.jobs import create_or_merge_job


CONNECTOR_REGISTRY = {
    "greenhouse": GreenhouseConnector(),
    "lever": LeverConnector(),
    "manual_url": None,
    "generic_company": GenericCompanyConnector(),
    "wellfound": WellfoundConnector(),
    "linkedin_stub": LinkedInStubConnector(),
    "indeed_stub": IndeedStubConnector(),
    "twitter_x": TwitterXConnector(),
}


async def run_sync(session: Session, source_names: list[str] | None = None, score_after_sync: bool = True) -> list[ConnectorRun]:
    query = select(JobSource)
    if source_names:
        query = query.where(JobSource.name.in_(source_names))
    sources = session.scalars(query.order_by(JobSource.name)).all()
    results: list[ConnectorRun] = []

    for source in sources:
        run = ConnectorRun(connector_name=source.name, status="running", started_at=datetime.now(UTC))
        session.add(run)
        session.commit()
        connector = CONNECTOR_REGISTRY.get(source.connector_type)
        if connector is None:
            run.status = "skipped"
            run.message = "Manual URL sources do not support bulk sync."
            run.completed_at = datetime.now(UTC)
            session.commit()
            results.append(run)
            continue
        try:
            raw_jobs = await connector.fetch_jobs(source.config)
            run.fetched_count = len(raw_jobs)
            created_count = 0
            deduped_count = 0
            for raw_job in raw_jobs:
                normalized = connector.normalize(raw_job)
                job, created = create_or_merge_job(session, normalized, raw_job)
                if created:
                    created_count += 1
                    if score_after_sync:
                        await score_job_against_active_profiles(session, job.id)
                else:
                    deduped_count += 1
            run.created_count = created_count
            run.deduped_count = deduped_count
            run.status = "success"
            run.message = f"Fetched {len(raw_jobs)} jobs from {source.display_name}."
            run.completed_at = datetime.now(UTC)
            source.last_status = run.status
            source.last_synced_at = run.completed_at
            session.commit()
        except Exception as exc:
            run.status = "failed"
            run.message = str(exc)
            run.completed_at = datetime.now(UTC)
            source.last_status = run.status
            session.commit()
        results.append(run)
    return results
