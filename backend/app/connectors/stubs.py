from app.connectors.base import BaseConnector


class UnsupportedConnectorStub(BaseConnector):
    supports_live_fetch = False
    experimental = True

    def validate_config(self, config: dict) -> None:
        return None

    async def fetch_jobs(self, config: dict) -> list[dict]:
        return []

    def normalize(self, raw_job: dict) -> dict:
        return raw_job


class WellfoundConnector(UnsupportedConnectorStub):
    connector_key = "wellfound"


class LinkedInStubConnector(UnsupportedConnectorStub):
    connector_key = "linkedin_stub"


class IndeedStubConnector(UnsupportedConnectorStub):
    connector_key = "indeed_stub"


class TwitterXConnector(UnsupportedConnectorStub):
    connector_key = "twitter_x"
