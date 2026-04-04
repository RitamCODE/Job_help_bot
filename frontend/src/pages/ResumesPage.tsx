import { FormEvent, useEffect, useState } from "react";

import { api } from "../api/client";
import { Resume } from "../types";

export function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [variantType, setVariantType] = useState("");
  const [tags, setTags] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadResumes() {
    const data = (await api.getResumes()) as Resume[];
    setResumes(data);
  }

  useEffect(() => {
    void loadResumes();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !name.trim()) {
      setError("Choose a resume file and provide a resume name.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name.trim());
    formData.append("variant_type", variantType.trim());
    formData.append("tags", tags);
    formData.append("is_default", String(isDefault));

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = (await api.uploadResume(formData)) as {
        original_filename?: string;
        extracted_characters?: number;
      };
      setSuccess(
        `Uploaded ${response.original_filename ?? file.name} and extracted ${response.extracted_characters ?? 0} characters.`,
      );
      setFile(null);
      setName("");
      setVariantType("");
      setTags("");
      setIsDefault(false);
      const fileInput = document.getElementById("resume-file") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      await loadResumes();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <section className="card">
        <div className="section-title">
          <h2>Resume variants</h2>
          <p className="muted">Upload PDF, DOCX, TXT, or Markdown resumes and store the extracted text locally.</p>
        </div>
        <form className="upload-form" onSubmit={(event) => void handleSubmit(event)}>
          <label>
            Resume name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Backend Resume" />
          </label>
          <label>
            Variant type
            <input value={variantType} onChange={(event) => setVariantType(event.target.value)} placeholder="backend" />
          </label>
          <label>
            Tags
            <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="backend, python, api" />
          </label>
          <label>
            Resume file
            <input
              id="resume-file"
              type="file"
              accept=".pdf,.docx,.txt,.md"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} />
            Set as default resume
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Upload Resume"}
          </button>
          {error ? <p className="error-text">{error}</p> : null}
          {success ? <p className="success-text">{success}</p> : null}
        </form>
      </section>

      <section className="card">
        {resumes.map((resume) => (
          <article key={resume.id} className="stack-card">
            <strong>{resume.name}</strong>
            <p className="muted">{resume.variant_type || "Generic variant"}</p>
            <p className="muted">Tags: {resume.tags.join(", ") || "None"}</p>
            <p>{resume.text_content}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
