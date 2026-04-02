from sqlalchemy import func, select
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import ConnectorRun, JobScore, SearchProfile
from app.schemas.analytics import AnalyticsSummaryResponse
from app.services.jobs import analytics_summary


router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(db: Session = Depends(get_db)) -> AnalyticsSummaryResponse:
    summary = analytics_summary(db)
    profile_averages = {
        row[0]: round(row[1], 2)
        for row in db.execute(
            select(SearchProfile.name, func.avg(JobScore.fit_score)).join(JobScore, isouter=True).group_by(SearchProfile.name)
        )
    }
    recent_runs = db.scalar(select(func.count(ConnectorRun.id))) or 0
    return AnalyticsSummaryResponse(
        **summary,
        profile_score_averages=profile_averages,
        recent_runs=recent_runs,
    )
