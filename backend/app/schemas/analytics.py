from pydantic import BaseModel, Field


class AnalyticsSummaryResponse(BaseModel):
    total_jobs: int
    jobs_by_status: dict[str, int] = Field(default_factory=dict)
    jobs_by_source: dict[str, int] = Field(default_factory=dict)
    profile_score_averages: dict[str, float] = Field(default_factory=dict)
    recent_runs: int
