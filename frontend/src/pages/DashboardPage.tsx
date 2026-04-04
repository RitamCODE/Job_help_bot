import { FormEvent, useEffect, useMemo, useState } from "react";

import { api } from "../api/client";
import { JobTable } from "../components/JobTable";
import { AnalyticsSummary, Job } from "../types";

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
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [query, setQuery] = useState("");
  const [importState, setImportState] = useState<ImportState>(initialImportState);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  async function loadDashboard() {
    const jobsResponse = (await api.getJobs()) as { items: Job[] };
    setJobs(jobsResponse.items);
    setAnalytics((await api.getAnalytics()) as AnalyticsSummary);
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
      setMessage("Job imported and scored against active profiles.");
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
      setMessage("Sync completed. Newly created jobs were scored.");
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
          <p className="eyebrow">Local-first workflow</p>
          <h2>Collect, rank, and review jobs end to end</h2>
          <p className="muted">
            Use live connectors where supported, import manual links when needed, and rank each role against active
            profiles with Ollama or fallback scoring.
          </p>
          <div className="action-row">
            <button onClick={() => void handleSync()} disabled={isSyncing}>
              {isSyncing ? "Running sync..." : "Run Sync Now"}
            </button>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat">
            <span>Total jobs</span>
            <strong>{analytics?.total_jobs ?? 0}</strong>
          </div>
          <div className="stat">
            <span>Recent sync runs</span>
            <strong>{analytics?.recent_runs ?? 0}</strong>
          </div>
          <div className="stat">
            <span>Inbox</span>
            <strong>{analytics?.jobs_by_status?.inbox ?? 0}</strong>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-title">
          <h2>Import a job manually</h2>
          <p className="muted">Use this for roles discovered through LinkedIn, Indeed, newsletters, or company sites.</p>
        </div>
        <form className="upload-form two-column-form" onSubmit={(event) => void handleImport(event)}>
          <label>
            Job URL
            <input
              value={importState.url}
              onChange={(event) => setImportState((state) => ({ ...state, url: event.target.value }))}
              placeholder="https://company.com/careers/job"
            />
          </label>
          <label>
            Role title
            <input
              value={importState.title_hint}
              onChange={(event) => setImportState((state) => ({ ...state, title_hint: event.target.value }))}
              placeholder="Backend Engineer"
            />
          </label>
          <label>
            Company
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
            Tags
            <input
              value={importState.tags}
              onChange={(event) => setImportState((state) => ({ ...state, tags: event.target.value }))}
              placeholder="backend, python, remote"
            />
          </label>
          <label className="span-2">
            Description
            <textarea
              value={importState.description_text}
              onChange={(event) => setImportState((state) => ({ ...state, description_text: event.target.value }))}
              placeholder="Paste a job description excerpt if the source page is unstable or restricted."
              rows={6}
            />
          </label>
          <button type="submit" disabled={isImporting}>
            {isImporting ? "Importing..." : "Import and Score"}
          </button>
          {error ? <p className="error-text span-2">{error}</p> : null}
          {message ? <p className="success-text span-2">{message}</p> : null}
        </form>
      </section>

      <section className="card">
        <div className="section-title split-header">
          <div>
            <h2>Jobs</h2>
            <p className="muted">Search across title, company, source, location, and tags.</p>
          </div>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search jobs..." />
        </div>
        <JobTable jobs={filteredJobs} />
      </section>
    </div>
  );
}
