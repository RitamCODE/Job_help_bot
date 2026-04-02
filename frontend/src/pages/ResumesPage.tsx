import { useEffect, useState } from "react";

import { api } from "../api/client";
import { Resume } from "../types";

export function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);

  useEffect(() => {
    void api.getResumes().then((data) => setResumes(data as Resume[]));
  }, []);

  return (
    <div className="page card">
      <div className="section-title">
        <h2>Resume variants</h2>
        <p className="muted">Store multiple local resume texts and link them to profiles.</p>
      </div>
      {resumes.map((resume) => (
        <article key={resume.id} className="stack-card">
          <strong>{resume.name}</strong>
          <p className="muted">{resume.variant_type || "Generic variant"}</p>
          <p>{resume.text_content}</p>
        </article>
      ))}
    </div>
  );
}
