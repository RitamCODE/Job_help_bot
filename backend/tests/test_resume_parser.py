from app.services.resume_parser import parse_resume_file


def test_parse_plain_text_resume() -> None:
    text, detected_format = parse_resume_file("resume.txt", b"Python engineer\nFastAPI\nSQL")
    assert detected_format == "txt"
    assert "Python engineer" in text


def test_rejects_unsupported_resume_format() -> None:
    try:
        parse_resume_file("resume.exe", b"nope")
    except ValueError as exc:
        assert "Unsupported resume format" in str(exc)
    else:
        raise AssertionError("Expected unsupported format to raise ValueError")
