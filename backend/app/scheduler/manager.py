from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import engine
from app.models import JobSource
from app.services.sync import run_sync


scheduler = BackgroundScheduler()


def _scheduled_sync(source_name: str) -> None:
    with Session(engine) as session:
        import asyncio

        asyncio.run(run_sync(session, [source_name], score_after_sync=True))


def configure_scheduler() -> None:
    settings = get_settings()
    if not settings.scheduler_enabled or scheduler.running:
        return
    with Session(engine) as session:
        sources = session.query(JobSource).filter(JobSource.is_enabled.is_(True)).all()
        for source in sources:
            scheduler.add_job(
                _scheduled_sync,
                "interval",
                minutes=source.sync_interval_minutes or settings.default_sync_interval_minutes,
                id=f"sync-{source.name}",
                replace_existing=True,
                args=[source.name],
            )
    scheduler.start()
