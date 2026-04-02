from enum import StrEnum


class RemoteType(StrEnum):
    REMOTE = "remote"
    HYBRID = "hybrid"
    ONSITE = "onsite"
    UNKNOWN = "unknown"


class JobStatus(StrEnum):
    INBOX = "inbox"
    SAVED = "saved"
    HIDDEN = "hidden"
    APPLIED = "applied"
    REJECTED = "rejected"
    INTERVIEW = "interview"
    OFFER = "offer"
    ARCHIVED = "archived"


class ConnectorType(StrEnum):
    GREENHOUSE = "greenhouse"
    LEVER = "lever"
    MANUAL_URL = "manual_url"
    GENERIC_COMPANY = "generic_company"
    WELLFOUND = "wellfound"
    LINKEDIN_STUB = "linkedin_stub"
    INDEED_STUB = "indeed_stub"
    TWITTER_X = "twitter_x"
