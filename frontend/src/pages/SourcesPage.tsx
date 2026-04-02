import { useEffect, useState } from "react";

import { api } from "../api/client";
import { Source } from "../types";

export function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);

  useEffect(() => {
    void api.getSources().then((data) => setSources(data as Source[]));
  }, []);

  return (
    <div className="page card">
      <div className="section-title">
        <h2>Sources</h2>
        <p className="muted">Supported connectors are live where stable and stubbed honestly where not.</p>
      </div>
      {sources.map((source) => (
        <article key={source.id} className="stack-card">
          <strong>{source.display_name}</strong>
          <p className="muted">
            {source.connector_type} · {source.is_enabled ? "enabled" : "disabled"} · every {source.sync_interval_minutes}m
          </p>
          <pre>{JSON.stringify(source.config, null, 2)}</pre>
        </article>
      ))}
    </div>
  );
}
