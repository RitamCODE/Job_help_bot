from datetime import UTC, datetime

import httpx

from app.connectors.base import BaseConnector


class LeverConnector(BaseConnector):
    connector_key = "lever"

    def validate_config(self, config: dict) -> None:
        if not config.get("company"):
            raise ValueError("Lever connector requires 'company'.")

    async def fetch_jobs(self, config: dict) -> list[dict]:
        self.validate_config(config)
        company = config["company"]
        url = f"https://api.lever.co/v0/postings/{company}?mode=json"
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()

    def normalize(self, raw_job: dict) -> dict:
        categories = raw_job.get("categories", {})
        return {
            "source": self.connector_name(),
            "source_job_id": raw_job.get("id"),
            "title": raw_job.get("text") or "Untitled role",
            "company": raw_job.get("hostedUrl", "").split("//")[-1].split(".")[0].replace("-", " ").title() or "Unknown company",
            "location": categories.get("location"),
            "remote_type": "remote" if "remote" in str(categories.get("location", "")).lower() else "unknown",
            "employment_type": categories.get("commitment"),
            "experience_level": categories.get("team"),
            "description": raw_job.get("descriptionPlain", "") or raw_job.get("description", ""),
            "url": raw_job.get("hostedUrl"),
            "canonical_url": raw_job.get("hostedUrl"),
            "posted_at": datetime.fromtimestamp(raw_job["createdAt"] / 1000, tz=UTC) if raw_job.get("createdAt") else None,
            "salary_text": None,
            "tags": [value for value in categories.values() if value],
            "raw_json": raw_job,
        }
