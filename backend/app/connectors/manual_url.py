from app.connectors.base import BaseConnector


class ManualUrlConnector(BaseConnector):
    connector_key = "manual_url"
    supports_live_fetch = False

    def validate_config(self, config: dict) -> None:
        if not config.get("url"):
            raise ValueError("Manual URL connector requires 'url'.")

    async def fetch_jobs(self, config: dict) -> list[dict]:
        self.validate_config(config)
        return [config]

    def normalize(self, raw_job: dict) -> dict:
        return {
            "source": self.connector_name(),
            "source_job_id": raw_job.get("source_job_id"),
            "title": raw_job.get("title_hint") or "Imported job",
            "company": raw_job.get("company_hint") or "Unknown company",
            "location": raw_job.get("location_hint"),
            "remote_type": "unknown",
            "employment_type": None,
            "experience_level": None,
            "description": raw_job.get("description_text", ""),
            "url": raw_job["url"],
            "canonical_url": raw_job["url"],
            "posted_at": None,
            "salary_text": None,
            "tags": raw_job.get("tags", []),
            "raw_json": raw_job,
        }
