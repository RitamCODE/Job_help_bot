import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import { JobTable } from "../components/JobTable";
import { AnalyticsSummary, Job, Profile, Resume, Source } from "../types";

type ImportState = {
  url: string;
  title_hint: string;
  company_hint: string;
  location_hint: string;
  description_text: string;
  tags: string;
};

const initialImportState: ImportState = {
  url: "",
  title_hint: "",
  company_hint: "",
  location_hint: "",
  description_text: "",
  tags: "",
};

export function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [query, setQuery] = useState("");
  const [importState, setImportState] = useState<ImportState>(initialImportState);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  async function loadDashboard() {
    const [jobsResponse, analyticsResponse, profilesResponse, resumesResponse, sourcesResponse] = await Promise.all([
      api.getJobs(),
      api.getAnalytics(),
      api.getProfiles(),
      api.getResumes(),
      api.getSources(),
    ]);
    setJobs((jobsResponse as { items: Job[] }).items);
    setAnalytics(analyticsResponse as AnalyticsSummary);
    setProfiles(profilesResponse as Profile[]);
    setResumes(resumesResponse as Resume[]);
    setSources(sourcesResponse as Source[]);
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const filteredJobs = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return jobs;
    return jobs.filter((job) =>
      [job.title, job.company, job.location || "", job.source, job.tags.join(" ")].some((value) =>
        value.toLowerCase().includes(search),
      ),
    );
  }, [jobs, query]);

  const enabledSources = sources.filter((source) => source.is_enabled);
  const setupSteps = [
    {
      label: "Create at least one profile",
      done: profiles.length > 0,
      help: "Profiles tell the app what kinds of jobs to prioritize for you.",
      link: "/profiles",
      cta: profiles.length > 0 ? "Manage profiles" : "Create profile",
    },
    {
      label: "Upload a resume",
      done: resumes.length > 0,
      help: "Upload one or more resume versions so scoring and tailoring suggestions use your real background.",
      link: "/resumes",
      cta: resumes.length > 0 ? "Manage resumes" : "Upload resume",
    },
    {
      label: "Turn on job sources",
      done: enabledSources.length > 0,
      help: "Enable Greenhouse or Lever sources, then add company-specific settings on the Sources page.",
      link: "/sources",
      cta: enabledSources.length > 0 ? "Manage sources" : "Set up sources",
    },
    {
      label: "Bring in jobs",
      done: jobs.length > 1,
      help: "Run sync for configured sources or paste a job URL below to import one manually.",
      link: "/",
      cta: jobs.length > 1 ? "Review jobs" : "Import first job",
    },
  ];

  async function handleImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!importState.url.trim()) {
      setError("Add a job URL to import.");
      return;
    }

    setIsImporting(true);
    setError(null);
    setMessage(null);
    try {
      await api.importUrl({
        ...importState,
        url: importState.url.trim(),
        tags: importState.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      setMessage("Job imported and ranked. Open it from the jobs list below to review the fit details.");
      setImportState(initialImportState);
      await loadDashboard();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Import failed.");
    } finally {
      setIsImporting(false);
    }
  }

  async function handleSync() {
    setIsSyncing(true);
    setError(null);
    setMessage(null);
    try {
      await api.runSync({ source_names: [], score_after_sync: true });
      setMessage("Sync completed. Newly found jobs were added and ranked.");
      await loadDashboard();
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Sync failed.");
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="page">
      <section className="hero card">
        <div>
          <p className="eyebrow">Simple job search workflow</p>
          <h2>Find jobs, see the best matches, and track what you applied to</h2>
          <p className="muted">
            This app is meant to be used step by step: set up your search, bring in jobs, then review them from one
            place.
          </p>
          <div className="action-row wrap">
            <button onClick={() => void handleSync()} disabled={isSyncing || enabledSources.length === 0}>
              {isSyncing ? "Running sync..." : "Run Source Sync"}
            </button>
            <Link className="button-link" to="/profiles">
              Set up profiles
            </Link>
            <Link className="button-link secondary" to="/resumes">
              Upload resume
            </Link>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat">
            <span>Total jobs</span>
            <strong>{analytics?.total_jobs ?? 0}</strong>
          </div>
          <div className="stat">
            <span>Ready sources</span>
            <strong>{enabledSources.length}</strong>
          </div>
          <div className="stat">
            <span>Inbox</span>
            <strong>{analytics?.jobs_by_status?.inbox ?? 0}</strong>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-title">
          <h2>Getting started</h2>
          <p className="muted">Follow these steps once. After that, most of your time will be spent in the jobs list.</p>
        </div>
        <div className="setup-grid">
          {setupSteps.map((step, index) => (
            <article key={step.label} className={step.done ? "setup-card done" : "setup-card"}>
              <p className="step-index">Step {index + 1}</p>
              <strong>{step.label}</strong>
              <p className="muted">{step.help}</p>
              <div className="action-row wrap">
                <span className={step.done ? "pill good" : "pill warn"}>{step.done ? "Done" : "To do"}</span>
                <Link to={step.link}>{step.cta}</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-title">
          <h2>Add a job manually</h2>
          <p className="muted">
            If you see a job on LinkedIn, Indeed, email, or a company site, paste the link here and the app will save
            it locally.
          </p>
        </div>
        <form className="upload-form two-column-form" onSubmit={(event) => void handleImport(event)}>
          <label>
            Job link
            <input
              value={importState.url}
              onChange={(event) => setImportState((state) => ({ ...state, url: event.target.value }))}
              placeholder="https://company.com/careers/job"
            />
          </label>
          <label>
            Job title
            <input
              value={importState.title_hint}
              onChange={(event) => setImportState((state) => ({ ...state, title_hint: event.target.value }))}
              placeholder="Backend Engineer"
            />
          </label>
          <label>
            Company name
            <input
              value={importState.company_hint}
              onChange={(event) => setImportState((state) => ({ ...state, company_hint: event.target.value }))}
              placeholder="Acme"
            />
          </label>
          <label>
            Location
            <input
              value={importState.location_hint}
              onChange={(event) => setImportState((state) => ({ ...state, location_hint: event.target.value }))}
              placeholder="Remote - US"
            />
          </label>
          <label className="span-2">
            Optional tags
            <input
              value={importState.tags}
              onChange={(event) => setImportState((state) => ({ ...state, tags: event.target.value }))}
              placeholder="backend, python, remote"
            />
          </label>
          <label className="span-2">
            Optional description snippet
            <textarea
              value={importState.description_text}
              onChange={(event) => setImportState((state) => ({ ...state, description_text: event.target.value }))}
              placeholder="Paste part of the job description if the page is difficult to revisit later."
              rows={5}
            />
          </label>
          <button type="submit" disabled={isImporting}>
            {isImporting ? "Saving..." : "Save job"}
          </button>
          {error ? <p className="error-text span-2">{error}</p> : null}
          {message ? <p className="success-text span-2">{message}</p> : null}
        </form>
      </section>

      <section className="card">
        <div className="section-title split-header">
          <div>
            <h2>Your jobs</h2>
            <p className="muted">Search by title, company, location, source, or tag.</p>
          </div>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search jobs..." />
        </div>
        {filteredJobs.length === 0 ? (
          <p className="muted">No jobs yet. Run sync or use the manual job form above to add your first one.</p>
        ) : (
          <JobTable jobs={filteredJobs} />
        )}
      </section>
    </div>
  );
}
