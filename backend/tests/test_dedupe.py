from app.services.dedupe import fuzzy_similarity


def test_fuzzy_similarity_is_high_for_related_titles() -> None:
    assert fuzzy_similarity("Backend Engineer", "Backend Software Engineer") > 0.7
