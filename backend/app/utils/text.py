import hashlib
import re
from urllib.parse import urlparse, urlunparse


def normalize_text(value: str | None) -> str:
    return re.sub(r"\s+", " ", (value or "").strip().lower())


def canonicalize_url(url: str) -> str:
    parsed = urlparse(url.strip())
    cleaned = parsed._replace(query="", fragment="")
    return urlunparse(cleaned).rstrip("/")


def build_hash_signature(title: str, company: str, location: str | None, description: str | None = None) -> str:
    basis = " | ".join(
        [
            normalize_text(title),
            normalize_text(company),
            normalize_text(location),
            normalize_text(description)[:500],
        ]
    )
    return hashlib.sha256(basis.encode("utf-8")).hexdigest()[:24]
