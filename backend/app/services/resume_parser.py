from io import BytesIO
from pathlib import Path

from docx import Document
from pypdf import PdfReader


SUPPORTED_RESUME_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}


def parse_resume_file(filename: str, content: bytes) -> tuple[str, str]:
    suffix = Path(filename).suffix.lower()
    if suffix not in SUPPORTED_RESUME_EXTENSIONS:
        raise ValueError("Unsupported resume format. Use PDF, DOCX, TXT, or MD.")

    if suffix == ".pdf":
        return extract_pdf_text(content), "pdf"
    if suffix == ".docx":
        return extract_docx_text(content), "docx"
    return content.decode("utf-8", errors="ignore"), suffix.lstrip(".")


def extract_pdf_text(content: bytes) -> str:
    reader = PdfReader(BytesIO(content))
    parts = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(part.strip() for part in parts if part.strip()).strip()


def extract_docx_text(content: bytes) -> str:
    document = Document(BytesIO(content))
    return "\n".join(paragraph.text.strip() for paragraph in document.paragraphs if paragraph.text.strip()).strip()
