import { useEffect, useState } from "react";

import { api } from "../api/client";
import { JobTable } from "../components/JobTable";
import { AnalyticsSummary, Job } from "../types";

export function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    void api.getJobs().then((data) => setJobs(data.items as Job[]));
    void api.getAnalytics().then((data) => setAnalytics(data as AnalyticsSummary));
  }, []);

  return (
    <div className="page">
      <section className="hero card">
        <div>
          <p className="eyebrow">Reusable MVP</p>
          <h2>Multi-profile ranking for local-first job search</h2>
          <p className="muted">
            Jobs are stored locally, deduplicated, and scored against one or more profiles with Ollama when available.
          </p>
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
      <JobTable jobs={jobs} />
    </div>
  );
}
