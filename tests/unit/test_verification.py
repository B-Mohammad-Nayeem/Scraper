import pytest
from backend.app.services.verification_service import evaluate_verification

def test_full_verified_score():
    """Verify that an entity passing all signals gets 100% and 'VERIFIED' status."""
    score, status, breakdown = evaluate_verification(
        maps_match=True,
        website_found=True,
        address_match=True,
        phone_match=True,
        independent_source_match=True,
        registry_match=True
    )
    assert score == 100
    assert status == "VERIFIED"
    assert len(breakdown) == 6
    assert all(item["passed"] for item in breakdown)

def test_likely_verified_score():
    """Verify that an entity with maps + website + address (65 + 10) lands in LIKELY_VERIFIED."""
    score, status, breakdown = evaluate_verification(
        maps_match=True,          # 25
        website_found=True,       # 20
        address_match=True,       # 20
        phone_match=False,        # 0
        independent_source_match=True, # 10
        registry_match=False      # 0
    )
    assert score == 75
    assert status == "LIKELY_VERIFIED"

def test_unverified_score():
    """Verify that an entity with only map match (25 pts) is UNVERIFIED."""
    score, status, breakdown = evaluate_verification(
        maps_match=True,
        website_found=False,
        address_match=False,
        phone_match=False,
        independent_source_match=False,
        registry_match=False
    )
    assert score == 25
    assert status == "UNVERIFIED"
