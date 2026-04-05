# OpenJobs Local

OpenJobs Local is an open-source, local-first job aggregation and prioritization app for multi-track job searches.

It helps users:

- collect jobs from multiple sources
- normalize and deduplicate them into one local database
- score jobs against one or more job search profiles
- use a local Ollama model for fit analysis
- upload and manage multiple resume variants
- track job status from inbox to offer

This project is designed as a reusable GitHub project, not a one-off personal script.

## Product goals

OpenJobs Local is built around a few core ideas:

- open source and reusable
- local-first by default
- no paid API requirement
- configurable for many users and many job targets
- honest about unstable or restricted platforms
- modular connector architecture
- practical MVP first, but organized like a real product

## Who this is for

The app is meant for:

- technical users who want local control
- semi-technical users who want a cleaner workflow without relying on scripts
- people managing more than one job track at the same time

Example profile setup:

- Software Engineer
- Backend Engineer
- Full Stack Engineer
- AI Engineer
- Machine Learning Engineer
- Data Engineer
- Platform Engineer

Each job can be scored against multiple profiles, and the app can show:

- best matching profile
- profile-specific fit scores
- missing skills by profile
- resume emphasis suggestions

## What it does

- Aggregates jobs from reusable source connectors.
- Normalizes jobs into a shared schema with provenance tracking.
- Deduplicates jobs across multiple sources.
- Scores jobs against multiple user-defined search profiles.
- Stores resumes locally and links them to profiles.
- Supports direct resume upload for PDF, DOCX, TXT, and Markdown files.
- Supports manual workflow states like inbox, saved, applied, rejected, interview, and offer.
- Runs scheduled source syncs with APScheduler.
- Works even when Ollama is unavailable by falling back to deterministic scoring.

## What it does not do

- It does not promise brittle or restricted scraping for unstable platforms.
- It does not require paid APIs.
- It does not fabricate resume content or unsupported experience.
- It does not depend on Ollama being available to function.
- It does not currently store original uploaded resume binaries; it stores extracted text.

## Current status

The app is now beyond a bare scaffold. The current build includes:

- FastAPI backend
- SQLite via SQLAlchemy
- Greenhouse connector
- Lever connector
- Manual URL import
- Multi-profile scoring pipeline
- Ollama client with graceful fallback
- Resume upload and parsing
- Deduplication and raw record storage
- React/Vite frontend with user-facing workflow pages
- Scheduler and connector run logging
- Seed data and sample settings

Frontend workflow currently supports:

- guided dashboard setup
- profile creation
- resume upload
- source configuration for Greenhouse and Lever
- manual job import
- source sync triggering
- job status updates
- job notes
- rescoring from the job detail page

Still intentionally limited or deferred:

- Wellfound
- LinkedIn helper ingestion
- Indeed helper ingestion
- Twitter/X discovery
- Generic company careers framework
- richer analytics
- import/export polish

## Architecture overview

- Backend: FastAPI + SQLAlchemy + SQLite
- Frontend: React + Vite
- LLM: Ollama with fallback scorer
- Scheduler: APScheduler
- Connector model: abstract base connector with per-source implementations

More detail: [docs/architecture.md](./docs/architecture.md)

## Project structure

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

## Data model

Core tables/models included in the project:

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

## Supported connectors

Working today:

- Greenhouse-hosted boards
- Lever-hosted boards
- Manual URL import

Experimental or stubbed:

- Wellfound
- LinkedIn helper import
- Indeed helper import
- Twitter/X discovery
- Generic company careers framework

## How a normal user uses the app

The intended user flow is:

1. Start the backend and frontend locally.
2. Open the dashboard.
3. Create one or more search profiles.
4. Upload one or more resume versions.
5. Turn on job sources and enter their settings.
6. Run sync or paste job links manually.
7. Review ranked jobs in the jobs list.
8. Open a job and update its status, add notes, and track progress.

The dashboard now includes a guided setup checklist so users do not need to guess the order.

## User-facing pages

### Dashboard

The dashboard is the main home screen. It provides:

- getting started checklist
- manual job import form
- sync button
- high-level stats
- searchable jobs list

### Profiles

The profiles page is where users define what they are looking for.

Each profile can include:

- name
- description
- target roles
- preferred locations
- remote preference
- helpful keywords
- avoid keywords
- skills
- seniority preferences
- company preferences
- authorization notes

The page includes starter templates such as:

- Software Engineer
- AI / ML Engineer
- Data Engineer

### Resumes

The resumes page supports uploading:

- `.pdf`
- `.docx`
- `.txt`
- `.md`

Uploaded resumes are parsed locally and stored as extracted text in the database.

### Sources

The sources page supports:

- turning sources on and off
- configuring Greenhouse board tokens
- configuring Lever company slugs
- viewing recent sync runs

The goal is to keep common source setup understandable without asking users to edit raw JSON.

### Job detail

The job detail page supports:

- reviewing normalized job information
- viewing all available scores
- rescoring
- changing status
- adding notes
- reviewing missing skills and red flags

## Ranking and Ollama

Each job can be scored against one or more active search profiles.

For each job-profile pair, the system stores:

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

The prompt uses:

- profile data
- linked resume text
- job description
- scoring weights
- avoid rules

Important rule:

- resume suggestions are phrased as emphasis recommendations only
- the app should not fabricate experience

## Default model

Default Ollama model:

- `qwen2.5:3b-instruct`

Why this default:

- better fit for local-first use on common laptops
- better quality-to-hardware tradeoff than `llama3.1:8b` for many users
- strong enough for structured ranking and fit summaries
- more practical for systems with lower VRAM

If a user has stronger hardware, they can swap the model in `.env`.

## Hardware guidance

This project is intentionally aimed at consumer hardware, not only workstation-class setups.

For example:

- users with lower-VRAM laptop GPUs may prefer smaller Ollama models
- `qwen2.5:3b-instruct` is a more practical default than larger 7B or 8B models on modest machines

## Python and Node versions

Preferred Python version:

- Python `3.11`

This is the recommended version for the backend and matches the project requirement in [backend/pyproject.toml](./backend/pyproject.toml).

Recommended frontend runtime:

- current Node LTS is the safest default

The frontend is currently set up with:

- React 18
- Vite 5
- TypeScript 5

## Local setup

### 1. Clone and configure

```bash
git clone <your-fork-or-this-repo>
cd Job_help_bot
cp .env.example .env
```

### 2. Backend setup with Conda

If you use Miniconda or Anaconda, this is the recommended setup:

```powershell
conda create -n openjobs-local python=3.11 -y
conda activate openjobs-local
cd backend
pip install -e .[dev]
```

Then start the backend:

```powershell
uvicorn app.main:app --reload
```

Backend health check:

- [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 3. Frontend setup

Install Node.js first if `npm` is not available.

Then:

```powershell
cd frontend
npm install
npm run dev
```

Frontend dev server:

- [http://localhost:5173](http://localhost:5173)

### 4. Ollama setup

Install Ollama locally and pull the default model:

```bash
ollama pull qwen2.5:3b-instruct
ollama serve
```

If Ollama is not running, the app still works and uses a deterministic fallback scorer.

## Environment configuration

Important environment values are defined in [.env.example](./.env.example):

- `APP_NAME`
- `DATABASE_URL`
- `OLLAMA_BASE_URL`
- `OLLAMA_MODEL`
- `OLLAMA_TIMEOUT_SECONDS`
- `OLLAMA_RETRIES`
- `SCHEDULER_ENABLED`
- `DEFAULT_SYNC_INTERVAL_MINUTES`
- `ENABLE_SAMPLE_DATA`

## API endpoints

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

## Resume upload

The app supports direct resume upload from the frontend and backend API.

Supported file types:

- `.pdf`
- `.docx`
- `.txt`
- `.md`

How it works:

- Uploaded resumes are parsed locally on the backend.
- Extracted text is stored in the `resumes` table.
- The current MVP does not preserve original binary files.
- Parsed text is what gets used for scoring and tailoring suggestions.

## Source configuration tips

### Greenhouse

Enter the board token.

Example:

- for `company-name.greenhouse.io`, use `company-name`

### Lever

Enter the company slug.

Example:

- for `jobs.lever.co/company-name`, use `company-name`

## Seed data and dev mode

- Tables are auto-created on startup.
- Seed profiles, resumes, sources, and one sample job are loaded when `ENABLE_SAMPLE_DATA=true`.
- This helps users see the app immediately before configuring real sources.

## Tests and verification

Backend tests:

```bash
cd backend
pytest
```

Frontend production build:

```bash
cd frontend
npm run build
```

## Known limitations

- SQLite is the only persistence target in this version.
- Profile-to-resume linking is still stronger in the data model/backend than in the frontend UI.
- Bulk import/export is not fully implemented yet.
- Experimental connectors are placeholders with interface hooks only.
- PDF parsing quality depends on how extractable the source PDF is.
- Some advanced source onboarding is still evolving.

## Open-source readiness

This repo already includes:

- root README
- architecture notes
- roadmap
- contribution guide
- example environment file
- sample profile/source config files

Suggested license:

- MIT

## How to extend connectors

Create a new class inheriting from `BaseConnector` and implement:

- `connector_name()`
- `healthcheck()`
- `fetch_jobs(config)`
- `normalize(raw_job)`
- `validate_config(config)`

Then register it in:

- `backend/app/services/sync.py`

## Roadmap

See [docs/roadmap.md](./docs/roadmap.md).
