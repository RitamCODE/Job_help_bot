def build_ranking_prompt(job: dict, profile: dict, resume_text: str | None) -> str:
    return f"""
You are evaluating a job for a candidate profile. Score honestly and do not invent experience.

Job:
- Title: {job.get('title')}
- Company: {job.get('company')}
- Location: {job.get('location')}
- Description: {job.get('description')}

Profile:
- Name: {profile.get('name')}
- Target roles: {profile.get('target_roles')}
- Preferred locations: {profile.get('preferred_locations')}
- Remote preference: {profile.get('remote_preference')}
- Skills: {profile.get('skills')}
- Target keywords: {profile.get('target_keywords')}
- Avoid keywords: {profile.get('avoid_keywords')}
- Company preferences: {profile.get('company_preferences')}
- Authorization notes: {profile.get('authorization_notes')}
- Scoring weights: {profile.get('scoring_weights')}

Resume text:
{resume_text or 'No resume linked.'}

Return strict JSON with:
fit_score, fit_label, summary, top_matches, missing_skills, red_flags, recommendation,
resume_keywords, resume_tailoring_suggestions, outreach_message.
"""
