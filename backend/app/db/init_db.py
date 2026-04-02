from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.base import Base
from app.db.seed import seed_database
from app.db.session import engine
from app.models import *  # noqa: F401,F403


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    if get_settings().enable_sample_data:
        with Session(engine) as session:
            seed_database(session)
