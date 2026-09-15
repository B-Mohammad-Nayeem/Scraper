import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_search_endpoint_contract():
    payload = {
        "location": "Madhapur, Hyderabad",
        "organization_type": "all",
        "radius_km": 5.0,
        "page": 1,
        "page_size": 20
    }
    response = client.post("/api/v1/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "search_location" in data
    assert "results" in data
    assert "total" in data

def test_export_endpoint_contract():
    payload = {
        "items": [{"name": "Apollo Hospitals", "type": "hospital"}],
        "format": "csv"
    }
    response = client.post("/api/v1/export", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
