import { useEffect, useState } from "react";

import { api } from "../api/client";

export function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    void api.getSettings().then((data) => setSettings(data as Record<string, unknown>));
  }, []);

  return (
    <div className="page card">
      <div className="section-title">
        <h2>Settings</h2>
        <p className="muted">Local backend, Ollama, scheduler, and persisted app settings.</p>
      </div>
      <pre>{JSON.stringify(settings, null, 2)}</pre>
    </div>
  );
}
