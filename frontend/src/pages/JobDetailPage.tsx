import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { api } from "../api/client";
import { Job } from "../types";

export function JobDetailPage() {
  const params = useParams();
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    if (!params.id) return;
    void api.getJob(Number(params.id)).then((data) => setJob(data as Job));
  }, [params.id]);

  if (!job) {
    return <div className="card">Loading job details...</div>;
  }

  return (
    <div className="page detail-grid">
      <section className="card">
        <p className="eyebrow">{job.source}</p>
        <h2>{job.title}</h2>
        <p>{job.company}</p>
        <p className="muted">{job.location || "Unknown location"}</p>
        <p>{job.description}</p>
        <a href={job.url} target="_blank" rel="noreferrer">
          Open source posting
        </a>
      </section>
      <section className="card">
        <h3>Profile scores</h3>
        {job.scores.length === 0 ? (
          <p className="muted">No scores yet. Trigger scoring from the API or sync flow.</p>
        ) : (
          job.scores.map((score) => (
            <article key={score.id} className="score-card">
              <strong>
                {score.fit_label} ({Math.round(score.fit_score)})
              </strong>
              <p>{score.summary}</p>
              <p className="muted">Top matches: {score.top_matches.join(", ") || "None yet"}</p>
              <p className="muted">Missing skills: {score.missing_skills.join(", ") || "None flagged"}</p>
            </article>
          ))
        )}
      </section>
      <section className="card">
        <h3>Notes</h3>
        {job.notes.map((note) => (
          <article key={note.id} className="note-card">
            <p>{note.content}</p>
            <small>{new Date(note.updated_at).toLocaleString()}</small>
          </article>
        ))}
      </section>
    </div>
  );
}
