from pydantic import BaseModel, Field

from app.schemas.common import ORMBase


class ResumeBase(BaseModel):
    name: str
    variant_type: str | None = None
    text_content: str
    tags: list[str] = Field(default_factory=list)
    is_default: bool = False


class ResumeCreate(ResumeBase):
    pass


class ResumeUpdate(BaseModel):
    name: str | None = None
    variant_type: str | None = None
    text_content: str | None = None
    tags: list[str] | None = None
    is_default: bool | None = None


class ResumeResponse(ORMBase, ResumeBase):
    id: int
