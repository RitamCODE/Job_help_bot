from datetime import UTC, datetime

import httpx

from app.connectors.base import BaseConnector


class GreenhouseConnector(BaseConnector):
    connector_key = "greenhouse"

    def validate_config(self, config: dict) -> None:
        if not config.get("board_token"):
            raise ValueError("Greenhouse connector requires 'board_token'.")

    async def fetch_jobs(self, config: dict) -> list[dict]:
        self.validate_config(config)
        board = config["board_token"]
        url = f"https://boards-api.greenhouse.io/v1/boards/{board}/jobs"
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(url)
            response.raise_for_status()
            payload = response.json()
        return payload.get("jobs", [])

    def normalize(self, raw_job: dict) -> dict:
        return {
            "source": self.connector_name(),
            "source_job_id": str(raw_job.get("id")),
            "title": raw_job.get("title") or "Untitled role",
            "company": raw_job.get("company_name") or raw_job.get("metadata", {}).get("company") or "Unknown company",
            "location": (raw_job.get("location") or {}).get("name"),
            "remote_type": "remote" if "remote" in (raw_job.get("title", "") + str(raw_job.get("location", ""))).lower() else "unknown",
            "employment_type": None,
            "experience_level": None,
            "description": raw_job.get("content", "") or raw_job.get("absolute_url", ""),
            "url": raw_job.get("absolute_url"),
            "canonical_url": raw_job.get("absolute_url"),
            "posted_at": datetime.fromtimestamp(raw_job["updated_at"], tz=UTC) if raw_job.get("updated_at") else None,
            "salary_text": None,
            "tags": [d.get("value") for d in raw_job.get("departments", []) if d.get("value")],
            "raw_json": raw_job,
        }
