import json

import httpx

from app.core.config import get_settings


class OllamaClient:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def healthcheck(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(f"{self.settings.ollama_base_url}/api/tags")
                response.raise_for_status()
            return True
        except Exception:
            return False

    async def generate_json(self, prompt: str) -> dict | None:
        payload = {
            "model": self.settings.ollama_model,
            "prompt": prompt,
            "stream": False,
            "format": "json",
        }
        last_error = None
        for _ in range(self.settings.ollama_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.settings.ollama_timeout_seconds) as client:
                    response = await client.post(f"{self.settings.ollama_base_url}/api/generate", json=payload)
                    response.raise_for_status()
                    text = response.json().get("response", "{}")
                    return json.loads(text)
            except Exception as exc:
                last_error = exc
        if last_error:
            return None
        return None
