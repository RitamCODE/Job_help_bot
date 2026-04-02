from abc import ABC, abstractmethod
from typing import Any


class BaseConnector(ABC):
    connector_key: str = "base"
    supports_live_fetch: bool = True
    experimental: bool = False

    @classmethod
    def connector_name(cls) -> str:
        return cls.connector_key

    def healthcheck(self) -> dict[str, Any]:
        return {"ok": True, "connector": self.connector_name(), "live_fetch": self.supports_live_fetch}

    @abstractmethod
    def validate_config(self, config: dict[str, Any]) -> None:
        raise NotImplementedError

    @abstractmethod
    async def fetch_jobs(self, config: dict[str, Any]) -> list[dict[str, Any]]:
        raise NotImplementedError

    @abstractmethod
    def normalize(self, raw_job: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError
