from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.llm.ollama_client import OllamaClient
from app.llm.prompts import build_ranking_prompt
from app.models import Job, JobScore, Resume, SearchProfile


def _fallback_score(job: Job, profile: SearchProfile, resume: Resume | None) -> dict:
    title = (job.title or "").lower()
    description = (job.description or "").lower()
    score = 35
    top_matches = []
    missing = []
    red_flags = []

    for role in profile.target_roles:
        if role.lower() in title:
            score += 20
            top_matches.append(f"Title aligns with target role '{role}'.")
            break
    for skill in profile.skills:
        if skill.lower() in description:
            score += 5
            if len(top_matches) < 4:
                top_matches.append(f"Job mentions skill '{skill}'.")
        else:
            if len(missing) < 5:
                missing.append(skill)
    for avoid in profile.avoid_keywords:
        if avoid.lower() in description:
            score -= 15
            red_flags.append(f"Contains avoid keyword '{avoid}'.")

    if resume and resume.text_content:
        score += 5

    fit_score = max(0, min(100, score))
    fit_label = "high" if fit_score >= 75 else "medium" if fit_score >= 50 else "low"
    return {
        "fit_score": fit_score,
        "fit_label": fit_label,
        "summary": f"{job.title} at {job.company} is a {fit_label} fit for {profile.name} based on keyword overlap.",
        "top_matches": top_matches[:5],
        "missing_skills": missing[:5],
        "red_flags": red_flags[:5],
        "recommendation": "Review manually before applying." if fit_label != "high" else "Strong candidate for deeper review.",
        "resume_keywords": profile.skills[:8],
        "resume_tailoring_suggestions": [
            "Emphasize relevant projects already present on the resume.",
            "Mirror role terminology only where it is truthful.",
            "Do not add experience you do not have.",
        ],
        "outreach_message": f"Hi, I'm interested in the {job.title} role and would love to learn more about the team.",
    }


async def score_job_against_profile(session: Session, job_id: int, profile_id: int) -> JobScore:
    job = session.scalar(select(Job).where(Job.id == job_id))
    profile = session.scalar(
        select(SearchProfile).options(selectinload(SearchProfile.resumes)).where(SearchProfile.id == profile_id)
    )
    if not job or not profile:
        raise ValueError("Job or profile not found.")

    resume = profile.resumes[0] if profile.resumes else None
    prompt = build_ranking_prompt(
        {"title": job.title, "company": job.company, "location": job.location, "description": job.description},
        {
            "name": profile.name,
            "target_roles": profile.target_roles,
            "preferred_locations": profile.preferred_locations,
            "remote_preference": profile.remote_preference,
            "skills": profile.skills,
            "target_keywords": profile.target_keywords,
            "avoid_keywords": profile.avoid_keywords,
            "company_preferences": profile.company_preferences,
            "authorization_notes": profile.authorization_notes,
            "scoring_weights": profile.scoring_weights,
        },
        resume.text_content if resume else None,
    )

    client = OllamaClient()
    result = await client.generate_json(prompt)
    if not result:
        result = _fallback_score(job, profile, resume)

    score = session.scalar(select(JobScore).where(JobScore.job_id == job_id, JobScore.profile_id == profile_id))
    if not score:
        score = JobScore(job_id=job_id, profile_id=profile_id)
        session.add(score)

    score.fit_score = float(result.get("fit_score", 0))
    score.fit_label = result.get("fit_label", "low")
    score.summary = result.get("summary", "")
    score.top_matches = result.get("top_matches", [])
    score.missing_skills = result.get("missing_skills", [])
    score.red_flags = result.get("red_flags", [])
    score.recommendation = result.get("recommendation", "")
    score.resume_keywords = result.get("resume_keywords", [])
    score.resume_tailoring_suggestions = result.get("resume_tailoring_suggestions", [])
    score.outreach_message = result.get("outreach_message")
    score.raw_model_output = result
    session.commit()
    session.refresh(score)
    return score


async def score_job_against_active_profiles(session: Session, job_id: int) -> list[JobScore]:
    profiles = session.scalars(select(SearchProfile).where(SearchProfile.is_active.is_(True))).all()
    scores = []
    for profile in profiles:
        scores.append(await score_job_against_profile(session, job_id, profile.id))
    return scores
