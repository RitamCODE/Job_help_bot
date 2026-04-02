from app.llm.ranking import _fallback_score
from app.models import Job, SearchProfile


def test_fallback_score_returns_reasonable_shape() -> None:
    job = Job(title="Backend Engineer", company="Acme", description="Python SQL APIs")
    profile = SearchProfile(name="Backend", target_roles=["backend engineer"], skills=["python", "sql"], avoid_keywords=[])
    result = _fallback_score(job, profile, None)
    assert "fit_score" in result
    assert result["fit_label"] in {"high", "medium", "low"}
