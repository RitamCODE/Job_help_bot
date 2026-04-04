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

  async function saveConfig(source: Source, rawValue: string) {
    setSavingSource(source.name);
    setError(null);
    setMessage(null);
    try {
      const parsed = JSON.parse(rawValue) as Record<string, unknown>;
      await api.updateSource(source.name, { config: parsed });
      setMessage(`Saved config for ${source.display_name}.`);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save source config.");
    } finally {
      setSavingSource(null);
    }
  }

  return (
    <div className="page">
      <section className="card">
        <div className="section-title">
          <h2>Source management</h2>
          <p className="muted">Enable or disable sources and edit connector config without leaving the app.</p>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}
        {sources.map((source) => (
          <SourceCard
            key={source.id}
            source={source}
            isSaving={savingSource === source.name}
            onToggle={() => void toggleSource(source)}
            onSaveConfig={(rawValue) => void saveConfig(source, rawValue)}
          />
        ))}
      </section>

      <section className="card">
        <div className="section-title">
          <h2>Recent connector runs</h2>
          <p className="muted">This helps confirm whether sync worked and whether jobs were deduplicated or created.</p>
        </div>
        {runs.length === 0 ? <p className="muted">No connector runs yet.</p> : null}
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
  onSaveConfig,
}: {
  source: Source;
  isSaving: boolean;
  onToggle: () => void;
  onSaveConfig: (rawValue: string) => void;
}) {
  const [rawConfig, setRawConfig] = useState(JSON.stringify(source.config, null, 2));

  useEffect(() => {
    setRawConfig(JSON.stringify(source.config, null, 2));
  }, [source.config]);

  return (
    <article className="stack-card">
      <div className="split-header">
        <div>
          <strong>{source.display_name}</strong>
          <p className="muted">
            {source.connector_type} · {source.is_enabled ? "enabled" : "disabled"} · every {source.sync_interval_minutes}
            m
          </p>
        </div>
        <button onClick={onToggle} disabled={isSaving}>
          {isSaving ? "Saving..." : source.is_enabled ? "Disable" : "Enable"}
        </button>
      </div>
      <textarea value={rawConfig} onChange={(event) => setRawConfig(event.target.value)} rows={8} />
      <div className="action-row">
        <button onClick={() => onSaveConfig(rawConfig)} disabled={isSaving}>
          Save Config
        </button>
      </div>
    </article>
  );
}
