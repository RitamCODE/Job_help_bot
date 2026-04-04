# OpenJobs Local

OpenJobs Local is an open-source, local-first job aggregation and prioritization platform for multi-track job searches. Users can collect jobs from multiple sources, normalize and deduplicate them, score them against one or more search profiles with a local Ollama model, and manage application workflow from a simple dashboard.

## What it does

- Aggregates jobs from reusable source connectors.
- Normalizes jobs into a shared schema with provenance tracking.
- Deduplicates jobs across multiple sources.
- Scores jobs against multiple user-defined search profiles.
- Stores resumes locally and links them to profiles.
- Supports direct resume upload for PDF, DOCX, TXT, and Markdown files.
- Supports manual workflow states like inbox, saved, applied, rejected, interview, and offer.
- Runs scheduled source syncs with APScheduler.

## What it does not do

- It does not promise brittle or restricted scraping for unstable platforms.
- It does not require paid APIs.
- It does not fabricate resume content or unsupported experience.
- It does not depend on Ollama being available to function.

## MVP Status

Implemented now:

- FastAPI backend
- SQLite via SQLAlchemy
- Greenhouse connector
- Lever connector
- Manual URL import
- Multi-profile scoring pipeline
- Ollama client with graceful fallback
- Deduplication and raw record storage
- Basic React/Vite dashboard
- Scheduler and connector run logging
- Seed data and sample settings

Scaffolded honestly for later:

- Wellfound
- LinkedIn helper ingestion
- Indeed helper ingestion
- Twitter/X discovery
- Generic company careers framework

## Project Structure

```text
backend/
  app/
    api/
    connectors/
    core/
    db/
    llm/
    models/
    schemas/
    scheduler/
    services/
    utils/
  sample_data/
  tests/
frontend/
  src/
    api/
    components/
    layouts/
    pages/
    types/
docs/
```

## Architecture Overview

- Backend: FastAPI + SQLAlchemy + SQLite
- Frontend: React + Vite
- LLM: Ollama with fallback scorer
- Scheduler: APScheduler
- Connector model: abstract base connector with per-source implementations

More detail: [docs/architecture.md](./docs/architecture.md)

## Data Model

Core tables/models included in the MVP:

- `jobs`
- `raw_job_records`
- `job_sources`
- `job_scores`
- `job_actions`
- `search_profiles`
- `resumes`
- `connector_runs`
- `app_settings`
- `job_notes`
- `dedupe_links`

## Supported Connectors

Working:

- Greenhouse-hosted boards
- Lever-hosted boards
- Manual URL import

Experimental or stubbed:

- Wellfound
- LinkedIn helper import
- Indeed helper import
- Twitter/X discovery
- Generic company careers framework

## Local Setup

### 1. Clone and configure

```bash
git clone <your-fork-or-this-repo>
cd Job_help_bot
cp .env.example .env
```

### 2. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -e .[dev]
uvicorn app.main:app --reload
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Ollama

Install Ollama locally and pull the default model:

```bash
ollama pull qwen2.5:3b-instruct
ollama serve
```

If Ollama is not running, the app still works and uses a deterministic fallback scorer.

Default recommendation:

- `qwen2.5:3b-instruct` is the default Ollama model for this project.
- It is a better fit for local-first use on lower-VRAM machines than `llama3.1:8b`.
- This app mainly needs structured ranking, fit summaries, missing-skill extraction, and truthful resume emphasis suggestions, so a smaller instruct model is a practical default.
- Users with stronger hardware can still switch models through `.env`.

## API Endpoints

- `GET /health`
- `GET /jobs`
- `GET /jobs/{id}`
- `POST /jobs/import-url`
- `PATCH /jobs/{id}/status`
- `PATCH /jobs/{id}/notes`
- `POST /jobs/{id}/score`
- `POST /jobs/{id}/score-against-profile/{profile_id}`
- `GET /profiles`
- `POST /profiles`
- `GET /profiles/{id}`
- `PATCH /profiles/{id}`
- `DELETE /profiles/{id}`
- `GET /resumes`
- `POST /resumes`
- `POST /resumes/upload`
- `PATCH /resumes/{id}`
- `DELETE /resumes/{id}`
- `GET /sources`
- `PATCH /sources/{name}`
- `POST /sync/run`
- `GET /sync/runs`
- `GET /settings`
- `PATCH /settings`
- `GET /analytics/summary`

## How scoring works

Each job can be scored against one or more active search profiles. For each job-profile pair, the system stores:

- fit score
- fit label
- summary
- top matches
- missing skills
- red flags
- recommendation
- resume keywords
- resume tailoring suggestions
- outreach message
- raw model output

The prompt uses profile data, linked resume text, job description, scoring weights, and avoid rules. Suggestions are phrased as resume emphasis guidance rather than fabricated claims.

Current default model:

- `qwen2.5:3b-instruct`

Why this default:

- Better local usability on common consumer laptops
- Strong enough for structured job-to-profile comparison
- Lower hardware burden than `llama3.1:8b`

## How to extend connectors

Create a new class inheriting from `BaseConnector` and implement:

- `connector_name()`
- `healthcheck()`
- `fetch_jobs(config)`
- `normalize(raw_job)`
- `validate_config(config)`

Then register it in `backend/app/services/sync.py`.

## Resume upload

The MVP now supports resume upload from the frontend and backend API.

Supported file types:

- `.pdf`
- `.docx`
- `.txt`
- `.md`

How it works:

- Uploaded resumes are parsed locally on the backend.
- Extracted text is stored in the existing `resumes` table.
- The current MVP does not preserve original binary files; it stores extracted text for scoring and profile linking.

## Seed data and dev mode

- Tables are auto-created on startup.
- Seed profiles, resumes, sources, and one sample job are loaded when `ENABLE_SAMPLE_DATA=true`.
- This makes the MVP easier to demo before connecting live boards.

## Known limitations

- SQLite is the only persistence target in this MVP.
- UI filters and editing flows are still minimal.
- Bulk export/import is not implemented yet.
- Experimental connectors are placeholders with interface hooks only.

## Suggested license

MIT is a practical default for a reusable open-source utility app.

## Commands

Backend tests:

```bash
cd backend
pytest
```

Frontend build:

```bash
cd frontend
npm run build
```

## Roadmap

See [docs/roadmap.md](./docs/roadmap.md).
