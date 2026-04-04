import { useEffect, useState } from "react";

import { api } from "../api/client";
import { ConnectorRun, Source } from "../types";

export function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [runs, setRuns] = useState<ConnectorRun[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [savingSource, setSavingSource] = useState<string | null>(null);

  async function loadData() {
    setSources((await api.getSources()) as Source[]);
    setRuns((await api.getRuns()) as ConnectorRun[]);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function toggleSource(source: Source) {
    setSavingSource(source.name);
    setError(null);
    setMessage(null);
    try {
      await api.updateSource(source.name, { is_enabled: !source.is_enabled });
      setMessage(`Updated ${source.display_name}.`);
      await loadData();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Could not update source.");
    } finally {
      setSavingSource(null);
    }
  }

  async function saveSource(source: Source, nextConfig: Record<string, unknown>) {
    setSavingSource(source.name);
    setError(null);
    setMessage(null);
    try {
      await api.updateSource(source.name, { config: nextConfig });
      setMessage(`Saved settings for ${source.display_name}.`);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save source settings.");
    } finally {
      setSavingSource(null);
    }
  }

  return (
    <div className="page">
      <section className="card">
        <div className="section-title">
          <h2>Connect job sources</h2>
          <p className="muted">
            Start with Greenhouse and Lever. Turn a source on, then add the company-specific identifier it needs.
          </p>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}
        {sources.map((source) => (
          <SourceCard
            key={source.id}
            source={source}
            isSaving={savingSource === source.name}
            onToggle={() => void toggleSource(source)}
            onSave={(nextConfig) => void saveSource(source, nextConfig)}
          />
        ))}
      </section>

      <section className="card">
        <div className="section-title">
          <h2>Recent sync activity</h2>
          <p className="muted">This helps you confirm whether a sync worked and how many jobs were added.</p>
        </div>
        {runs.length === 0 ? <p className="muted">No sync history yet. Run sync from the dashboard after setting up a source.</p> : null}
        {runs.map((run) => (
          <article key={run.id} className="stack-card">
            <strong>{run.connector_name}</strong>
            <p className="muted">
              {run.status} · fetched {run.fetched_count} · created {run.created_count} · deduped {run.deduped_count}
            </p>
            <p>{run.message || "No message."}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function SourceCard({
  source,
  isSaving,
  onToggle,
  onSave,
}: {
  source: Source;
  isSaving: boolean;
  onToggle: () => void;
  onSave: (nextConfig: Record<string, unknown>) => void;
}) {
  const [boardToken, setBoardToken] = useState(String(source.config.board_token ?? ""));
  const [company, setCompany] = useState(String(source.config.company ?? ""));
  const [careersUrl, setCareersUrl] = useState(String(source.config.careers_url ?? ""));

  useEffect(() => {
    setBoardToken(String(source.config.board_token ?? ""));
    setCompany(String(source.config.company ?? ""));
    setCareersUrl(String(source.config.careers_url ?? ""));
  }, [source.config]);

  function saveFriendlyConfig() {
    if (source.connector_type === "greenhouse") {
      onSave({ board_token: boardToken.trim() });
      return;
    }
    if (source.connector_type === "lever") {
      onSave({ company: company.trim() });
      return;
    }
    if (source.connector_type === "generic_company") {
      onSave({ careers_url: careersUrl.trim() });
      return;
    }
    onSave(source.config);
  }

  return (
    <article className="stack-card">
      <div className="split-header">
        <div>
          <strong>{source.display_name}</strong>
          <p className="muted">
            {source.connector_type} · {source.is_enabled ? "enabled" : "disabled"} · checks every {source.sync_interval_minutes} minutes
          </p>
        </div>
        <button onClick={onToggle} disabled={isSaving}>
          {isSaving ? "Saving..." : source.is_enabled ? "Turn off" : "Turn on"}
        </button>
      </div>

      {source.connector_type === "greenhouse" ? (
        <div className="friendly-form">
          <label>
            Greenhouse board token
            <input value={boardToken} onChange={(event) => setBoardToken(event.target.value)} placeholder="company-name" />
          </label>
          <p className="muted">Example: for `company-name.greenhouse.io`, enter `company-name`.</p>
        </div>
      ) : null}

      {source.connector_type === "lever" ? (
        <div className="friendly-form">
          <label>
            Lever company slug
            <input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="company-name" />
          </label>
          <p className="muted">Example: for `jobs.lever.co/company-name`, enter `company-name`.</p>
        </div>
      ) : null}

      {source.connector_type === "generic_company" ? (
        <div className="friendly-form">
          <label>
            Careers page URL
            <input
              value={careersUrl}
              onChange={(event) => setCareersUrl(event.target.value)}
              placeholder="https://company.com/careers"
            />
          </label>
        </div>
      ) : null}

      {!["greenhouse", "lever", "generic_company"].includes(source.connector_type) ? (
        <p className="muted">
          This source is still experimental. You can leave it off for now unless you are testing custom behavior.
        </p>
      ) : null}

      {["greenhouse", "lever", "generic_company"].includes(source.connector_type) ? (
        <div className="action-row">
          <button onClick={saveFriendlyConfig} disabled={isSaving}>
            Save settings
          </button>
        </div>
      ) : null}
    </article>
  );
}
