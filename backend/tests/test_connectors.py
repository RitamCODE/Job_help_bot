from app.connectors.greenhouse import GreenhouseConnector
from app.connectors.lever import LeverConnector


def test_greenhouse_normalize() -> None:
    connector = GreenhouseConnector()
    normalized = connector.normalize(
        {
            "id": 123,
            "title": "Software Engineer",
            "absolute_url": "https://example.com/job/123",
            "location": {"name": "Remote"},
            "departments": [{"value": "Engineering"}],
        }
    )
    assert normalized["source"] == "greenhouse"
    assert normalized["title"] == "Software Engineer"


def test_lever_normalize() -> None:
    connector = LeverConnector()
    normalized = connector.normalize(
        {
            "id": "abc",
            "text": "ML Engineer",
            "hostedUrl": "https://jobs.lever.co/example/abc",
            "categories": {"location": "Remote", "commitment": "Full-time", "team": "Engineering"},
        }
    )
    assert normalized["source"] == "lever"
    assert normalized["remote_type"] == "remote"
