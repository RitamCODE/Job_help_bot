import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { api } from "../api/client";
import { Job } from "../types";

const JOB_STATUSES = ["inbox", "saved", "hidden", "applied", "rejected", "interview", "offer", "archived"];

export function JobDetailPage() {
  const params = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function loadJob() {
    if (!params.id) return;
    setJob((await api.getJob(Number(params.id))) as Job);
  }

  useEffect(() => {
    void loadJob();
  }, [params.id]);

  async function handleStatusChange(status: string) {
    if (!job) return;
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      setJob((await api.updateJobStatus(job.id, status)) as Job);
      setMessage(`Job moved to ${status}.`);
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Could not update job status.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleScore() {
    if (!job) return;
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      setJob((await api.scoreJob(job.id)) as Job);
      setMessage("Job rescored against active profiles.");
    } catch (scoreError) {
      setError(scoreError instanceof Error ? scoreError.message : "Could not score job.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!job || !note.trim()) return;
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      setJob((await api.addJobNote(job.id, note.trim())) as Job);
      setNote("");
      setMessage("Note added.");
    } catch (noteError) {
      setError(noteError instanceof Error ? noteError.message : "Could not add note.");
    } finally {
      setIsSaving(false);
    }
  }

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
        <p className="muted">Status: {job.status}</p>
        <div className="action-row wrap">
          {JOB_STATUSES.map((status) => (
            <button key={status} onClick={() => void handleStatusChange(status)} disabled={isSaving || status === job.status}>
              {status}
            </button>
          ))}
          <button onClick={() => void handleScore()} disabled={isSaving}>
            Rescore
          </button>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}
        <p>{job.description}</p>
        <a href={job.url} target="_blank" rel="noreferrer">
          Open source posting
        </a>
      </section>
      <section className="card">
        <h3>Profile scores</h3>
        {job.scores.length === 0 ? (
          <p className="muted">No scores yet. Use the rescore button to evaluate this job.</p>
        ) : (
          job.scores.map((score) => (
            <article key={score.id} className="score-card">
              <strong>
                {score.fit_label} ({Math.round(score.fit_score)})
              </strong>
              <p>{score.summary}</p>
              <p className="muted">Top matches: {score.top_matches.join(", ") || "None yet"}</p>
              <p className="muted">Missing skills: {score.missing_skills.join(", ") || "None flagged"}</p>
              <p className="muted">Red flags: {score.red_flags.join(", ") || "None flagged"}</p>
              <p className="muted">
                Tailoring: {score.resume_tailoring_suggestions.join(" ") || "No tailoring suggestions yet."}
              </p>
            </article>
          ))
        )}
      </section>
      <section className="card">
        <h3>Notes</h3>
        <form className="upload-form" onSubmit={(event) => void handleAddNote(event)}>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="Add a note..." />
          <button type="submit" disabled={isSaving}>
            Add Note
          </button>
        </form>
        {job.notes.map((noteItem) => (
          <article key={noteItem.id} className="note-card">
            <p>{noteItem.content}</p>
            <small>{new Date(noteItem.updated_at).toLocaleString()}</small>
          </article>
        ))}
      </section>
    </div>
  );
}
