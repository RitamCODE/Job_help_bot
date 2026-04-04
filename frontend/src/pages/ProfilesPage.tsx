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

const initialProfileState: ProfileFormState = {
  name: "",
  description: "",
  target_roles: "",
  preferred_locations: "",
  remote_preference: "remote_or_hybrid",
  target_keywords: "",
  avoid_keywords: "",
  skills: "",
  seniority_preferences: "",
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Profile name is required.");
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
      setMessage("Profile created successfully.");
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
          <h2>Create a search profile</h2>
          <p className="muted">Define one role track at a time, then score the same job against multiple profiles.</p>
        </div>
        <form className="upload-form two-column-form" onSubmit={(event) => void handleSubmit(event)}>
          <label>
            Profile name
            <input value={form.name} onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))} />
          </label>
          <label>
            Remote preference
            <input
              value={form.remote_preference}
              onChange={(event) => setForm((state) => ({ ...state, remote_preference: event.target.value }))}
            />
          </label>
          <label className="span-2">
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
            />
          </label>
          <label>
            Target roles
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
            Skills
            <input
              value={form.skills}
              onChange={(event) => setForm((state) => ({ ...state, skills: event.target.value }))}
              placeholder="python, fastapi, sql"
            />
          </label>
          <label>
            Target keywords
            <input
              value={form.target_keywords}
              onChange={(event) => setForm((state) => ({ ...state, target_keywords: event.target.value }))}
              placeholder="distributed systems, platform, api"
            />
          </label>
          <label>
            Avoid keywords
            <input
              value={form.avoid_keywords}
              onChange={(event) => setForm((state) => ({ ...state, avoid_keywords: event.target.value }))}
              placeholder="unpaid, commission-only"
            />
          </label>
          <label>
            Seniority preferences
            <input
              value={form.seniority_preferences}
              onChange={(event) => setForm((state) => ({ ...state, seniority_preferences: event.target.value }))}
              placeholder="mid, senior"
            />
          </label>
          <label className="span-2">
            Company preferences
            <input
              value={form.company_preferences}
              onChange={(event) => setForm((state) => ({ ...state, company_preferences: event.target.value }))}
              placeholder="open source, infrastructure, developer tools"
            />
          </label>
          <label className="span-2">
            Authorization notes
            <textarea
              rows={3}
              value={form.authorization_notes}
              onChange={(event) => setForm((state) => ({ ...state, authorization_notes: event.target.value }))}
              placeholder="Any work authorization or visa-related notes you want the scorer to consider."
            />
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Profile"}
          </button>
          {error ? <p className="error-text span-2">{error}</p> : null}
          {message ? <p className="success-text span-2">{message}</p> : null}
        </form>
      </section>

      <section className="card">
        <div className="section-title">
          <h2>Active profiles</h2>
          <p className="muted">These are the tracks jobs will be scored against during import and sync.</p>
        </div>
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
