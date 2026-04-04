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
      setError("Choose a resume file and give it a name.");
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
        `Uploaded ${response.original_filename ?? file.name}. Extracted ${response.extracted_characters ?? 0} characters.`,
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
          <h2>Upload your resume</h2>
          <p className="muted">
            You can upload PDF, DOCX, TXT, or Markdown files. The app stores extracted text locally so it can compare
            your background against job descriptions.
          </p>
        </div>
        <form className="upload-form two-column-form" onSubmit={(event) => void handleSubmit(event)}>
          <label>
            Resume name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="General Resume" />
          </label>
          <label>
            Resume type
            <input value={variantType} onChange={(event) => setVariantType(event.target.value)} placeholder="backend, ml, general" />
          </label>
          <label className="span-2">
            Tags
            <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="backend, python, api" />
          </label>
          <label className="span-2">
            Choose file
            <input
              id="resume-file"
              type="file"
              accept=".pdf,.docx,.txt,.md"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <label className="checkbox-row span-2">
            <input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} />
            Use this as my default resume
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Upload resume"}
          </button>
          {error ? <p className="error-text span-2">{error}</p> : null}
          {success ? <p className="success-text span-2">{success}</p> : null}
        </form>
      </section>

      <section className="card">
        <div className="section-title">
          <h2>Your resumes</h2>
          <p className="muted">You can keep more than one version, for example a general resume and an AI-focused one.</p>
        </div>
        {resumes.length === 0 ? <p className="muted">No resumes yet. Upload one above to get started.</p> : null}
        {resumes.map((resume) => (
          <article key={resume.id} className="stack-card">
            <strong>{resume.name}</strong>
            <p className="muted">
              {resume.variant_type || "General"} {resume.is_default ? "· Default" : ""}
            </p>
            <p className="muted">Tags: {resume.tags.join(", ") || "None"}</p>
            <details>
              <summary>Preview extracted text</summary>
              <p>{resume.text_content}</p>
            </details>
          </article>
        ))}
      </section>
    </div>
  );
}
