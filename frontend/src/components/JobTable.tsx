import { Link } from "react-router-dom";

import { Job } from "../types";
import { ScoreBadge } from "./ScoreBadge";

function bestScore(job: Job) {
  return job.scores.reduce<number | undefined>((best, score) => {
    if (best === undefined || score.fit_score > best) {
      return score.fit_score;
    }
    return best;
  }, undefined);
}

export function JobTable({ jobs }: { jobs: Job[] }) {
  return (
    <div className="card">
      <div className="section-title">
        <h2>Jobs</h2>
        <p className="muted">Top profile fit, workflow status, and source context in one view.</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Company</th>
              <th>Location</th>
              <th>Source</th>
              <th>Best Fit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>
                  <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                </td>
                <td>{job.company}</td>
                <td>{job.location || "Unknown"}</td>
                <td>{job.source}</td>
                <td>
                  <ScoreBadge score={bestScore(job)} />
                </td>
                <td>{job.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
