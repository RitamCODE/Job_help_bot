# Architecture Overview

OpenJobs Local is a local-first job aggregation platform with a FastAPI backend, SQLite persistence, a React/Vite dashboard, and optional Ollama-based scoring.

## Backend

- FastAPI exposes CRUD, sync, scoring, analytics, and settings endpoints.
- SQLAlchemy models keep normalized jobs separate from raw source payloads and profile-specific scores.
- Connector classes isolate job source logic so new integrations can be added without changing storage or ranking code.
- APScheduler provides optional periodic sync per configured source.

## Ranking

- Jobs are stored once and scored many times across active search profiles.
- Ollama is used when available.
- A deterministic fallback scorer keeps the application usable when Ollama is offline.
- Resume tailoring suggestions are phrased as emphasis recommendations only.

## Frontend

- React + Vite provides a lightweight product shell for dashboard, job detail, sources, resumes, profiles, and settings views.
- The UI emphasizes workflow visibility and profile-aware prioritization without assuming one user persona.

## Connector Support Boundaries

- Greenhouse and Lever: implemented.
- Manual URL import: implemented.
- Wellfound, LinkedIn, Indeed, Twitter/X, generic company pages: scaffolded honestly as experimental or helper stubs.
