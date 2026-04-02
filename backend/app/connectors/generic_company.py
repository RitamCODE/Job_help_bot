from app.connectors.base import BaseConnector


class GenericCompanyConnector(BaseConnector):
    connector_key = "generic_company"
    experimental = True
    supports_live_fetch = False

    def validate_config(self, config: dict) -> None:
        if not config.get("careers_url"):
            raise ValueError("Generic company connector requires 'careers_url'.")

    async def fetch_jobs(self, config: dict) -> list[dict]:
        self.validate_config(config)
        return []

    def normalize(self, raw_job: dict) -> dict:
        return raw_job
