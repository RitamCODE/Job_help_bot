import { FormEvent, useEffect, useState } from "react";

import { api } from "../api/client";
import { Profile } from "../types";

type ProfileFormState = {
  name: string;
  description: string;
  target_roles: string;
  preferred_locations: string;
  remote_preference: string;
  target_keywords: string;
  avoid_keywords: string;
  skills: string;
  seniority_preferences: string;
  company_preferences: string;
  authorization_notes: string;
};

const starterTemplates = [
  {
    name: "Software Engineer",
    target_roles: "software engineer, backend engineer, full stack engineer",
    skills: "python, javascript, sql, api",
  },
  {
    name: "AI / ML Engineer",
    target_roles: "ai engineer, ml engineer, machine learning engineer",
    skills: "python, pytorch, llm, data pipelines",
  },
  {
    name: "Data Engineer",
    target_roles: "data engineer, analytics engineer, platform engineer",
    skills: "python, sql, airflow, warehousing",
  },
];

const initialProfileState: ProfileFormState = {
  name: "",
  description: "",
  target_roles: "",
  preferred_locations: "Remote",
  remote_preference: "remote_or_hybrid",
  target_keywords: "",
  avoid_keywords: "",
  skills: "",
  seniority_preferences: "mid, senior",
  company_preferences: "",
  authorization_notes: "",
};

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [form, setForm] = useState<ProfileFormState>(initialProfileState);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadProfiles() {
    setProfiles((await api.getProfiles()) as Profile[]);
  }

  useEffect(() => {
    void loadProfiles();
  }, []);

  function applyTemplate(template: (typeof starterTemplates)[number]) {
    setForm((state) => ({
      ...state,
      name: template.name,
      target_roles: template.target_roles,
      skills: template.skills,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Give this profile a simple name, like Software Engineer or Data Engineer.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      await api.createProfile({
        name: form.name.trim(),
        description: form.description.trim() || null,
        target_roles: splitCsv(form.target_roles),
        preferred_locations: splitCsv(form.preferred_locations),
        remote_preference: form.remote_preference || null,
        target_keywords: splitCsv(form.target_keywords),
        avoid_keywords: splitCsv(form.avoid_keywords),
        skills: splitCsv(form.skills),
        seniority_preferences: splitCsv(form.seniority_preferences),
        authorization_notes: form.authorization_notes.trim() || null,
        company_preferences: splitCsv(form.company_preferences),
        scoring_weights: { skills: 0.35, role: 0.25, location: 0.15, preferences: 0.25 },
        resume_ids: [],
        is_active: true,
      });
      setForm(initialProfileState);
      setMessage("Profile created. Jobs can now be ranked against it.");
      await loadProfiles();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not create profile.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <section className="card">
        <div className="section-title">
          <h2>Set up a search profile</h2>
          <p className="muted">
            A profile is one kind of job you want. Create one for each path you care about, like Software Engineer or
            AI Engineer.
          </p>
        </div>
        <div className="template-row">
          {starterTemplates.map((template) => (
            <button key={template.name} type="button" className="secondary-button" onClick={() => applyTemplate(template)}>
              Use {template.name}
            </button>
          ))}
        </div>
        <form className="upload-form two-column-form" onSubmit={(event) => void handleSubmit(event)}>
          <label>
            Profile name
            <input
              value={form.name}
              onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))}
              placeholder="Software Engineer"
            />
          </label>
          <label>
            Remote preference
            <select
              value={form.remote_preference}
              onChange={(event) => setForm((state) => ({ ...state, remote_preference: event.target.value }))}
            >
              <option value="remote_or_hybrid">Remote or hybrid</option>
              <option value="remote">Remote only</option>
              <option value="hybrid">Hybrid only</option>
              <option value="onsite">On-site is okay</option>
            </select>
          </label>
          <label className="span-2">
            Short description
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
              placeholder="Example: Focus on backend and platform roles using Python, APIs, and cloud tooling."
            />
          </label>
          <label>
            Job titles to match
            <input
              value={form.target_roles}
              onChange={(event) => setForm((state) => ({ ...state, target_roles: event.target.value }))}
              placeholder="software engineer, backend engineer"
            />
          </label>
          <label>
            Preferred locations
            <input
              value={form.preferred_locations}
              onChange={(event) => setForm((state) => ({ ...state, preferred_locations: event.target.value }))}
              placeholder="Remote, New York, NY"
            />
          </label>
          <label>
            Main skills
            <input
              value={form.skills}
              onChange={(event) => setForm((state) => ({ ...state, skills: event.target.value }))}
              placeholder="python, fastapi, sql"
            />
          </label>
          <label>
            Helpful keywords
            <input
              value={form.target_keywords}
              onChange={(event) => setForm((state) => ({ ...state, target_keywords: event.target.value }))}
              placeholder="distributed systems, platform, api"
            />
          </label>
          <label>
            Keywords to avoid
            <input
              value={form.avoid_keywords}
              onChange={(event) => setForm((state) => ({ ...state, avoid_keywords: event.target.value }))}
              placeholder="unpaid, commission-only"
            />
          </label>
          <label>
            Seniority
            <input
              value={form.seniority_preferences}
              onChange={(event) => setForm((state) => ({ ...state, seniority_preferences: event.target.value }))}
              placeholder="mid, senior"
            />
          </label>
          <label className="span-2">
            Preferred companies or industries
            <input
              value={form.company_preferences}
              onChange={(event) => setForm((state) => ({ ...state, company_preferences: event.target.value }))}
              placeholder="open source, fintech, infrastructure"
            />
          </label>
          <label className="span-2">
            Optional work authorization notes
            <textarea
              rows={3}
              value={form.authorization_notes}
              onChange={(event) => setForm((state) => ({ ...state, authorization_notes: event.target.value }))}
              placeholder="Example: Prefer roles that clearly state sponsorship or work authorization rules."
            />
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save profile"}
          </button>
          {error ? <p className="error-text span-2">{error}</p> : null}
          {message ? <p className="success-text span-2">{message}</p> : null}
        </form>
      </section>

      <section className="card">
        <div className="section-title">
          <h2>Your profiles</h2>
          <p className="muted">These profiles are used when the app ranks each job.</p>
        </div>
        {profiles.length === 0 ? <p className="muted">No profiles yet. Use the form above to create your first one.</p> : null}
        {profiles.map((profile) => (
          <article key={profile.id} className="stack-card">
            <strong>{profile.name}</strong>
            <p>{profile.description || "No description provided."}</p>
            <p className="muted">Roles: {profile.target_roles.join(", ") || "None"}</p>
            <p className="muted">Skills: {profile.skills.join(", ") || "None"}</p>
            <p className="muted">Locations: {profile.preferred_locations.join(", ") || "None"}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
