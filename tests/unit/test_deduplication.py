import pytest
from backend.app.services.deduplication_service import deduplicate_records, normalize_text, string_similarity

def test_name_normalization():
    raw1 = "Infosys Limited Pvt. Ltd."
    raw2 = "INFOSYS Enterprise Corp"
    assert normalize_text(raw1) == "infosys"
    assert normalize_text(raw2) == "infosys"

def test_string_similarity():
    s1 = "medicover hospital madhapur"
    s2 = "medicover hospitals hitech city"
    sim = string_similarity(s1, s2)
    assert sim > 0.3

def test_deduplicate_spatial_and_name_match():
    # Two records within 50 meters with matching normalized name
    records = [
        {
            "id": "1",
            "name": "Apollo Clinic",
            "latitude": 17.4480,
            "longitude": 78.3910,
            "verification_score": 85,
            "verification_status": "LIKELY_VERIFIED",
            "verification_sources": [{"name": "OSM", "url": "https://osm.org/1"}]
        },
        {
            "id": "2",
            "name": "Apollo Clinic Ltd",
            "latitude": 17.4482, # ~25 meters away
            "longitude": 78.3911,
            "verification_score": 95,
            "verification_status": "VERIFIED",
            "verification_sources": [{"name": "Places", "url": "https://places.google.com/1"}]
        }
    ]

    deduped = deduplicate_records(records)
    assert len(deduped) == 1
    # Merged record retains highest score and merged sources
    assert deduped[0]["verification_score"] == 95
    assert len(deduped[0]["verification_sources"]) == 2
