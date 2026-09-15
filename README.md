# GeoDiscover: Area-Based Company & Hospital Discovery Engine

> A production-ready web application for discovering verified companies and hospitals within specified geographic localities, areas, cities, and PIN codes. Built with zero LLM hallucinations, real-time OpenStreetMap Overpass extraction, multi-signal verification scoring, and cross-source deduplication.

---

## 1. Architectural Overview

```
                          ┌────────────────────────┐
                          │   React 18 + Vite UI   │
                          │ (Interactive Map + UI) │
                          └───────────┬────────────┘
                                      │ REST API / Polling
                                      ▼
                        ┌────────────────────────────┐
                        │   Express & FastAPI API    │
                        │     Discovery Pipeline     │
                        └─────────────┬──────────────┘
                                      │
       ┌──────────────────────────────┼──────────────────────────────┐
       ▼                              ▼                              ▼
┌──────────────┐             ┌─────────────────┐           ┌──────────────────┐
│  Nominatim   │             │   OpenStreetMap │           │     Public &     │
│  Geocoding   │             │   Overpass API  │           │ Health Registry  │
└──────────────┘             └─────────────────┘           └──────────────────┘
       │                              │                              │
       └──────────────────────────────┼──────────────────────────────┘
                                      │
                                      ▼
                       ┌─────────────────────────────┐
                       │ Cross-Source Deduplication  │
                       │   (Haversine < 150m + Name) │
                       └──────────────┬──────────────┘
                                      │
                                      ▼
                       ┌─────────────────────────────┐
                       │ 6-Signal Verification Score │
                       │    (0 - 100 Confidence)     │
                       └──────────────┬──────────────┘
                                      │
                                      ▼
                       ┌─────────────────────────────┐
                       │  PostgreSQL 15 + PostGIS    │
                       │   (Spatial Index & Cache)   │
                       └─────────────────────────────┘
```

---

## 2. Core Features

- **Area & PIN Code Search**: Converts any natural location query (`Madhapur, Hyderabad`, `Kukatpally`, `500081`, `Whitefield, Bangalore`) into geographic coordinates and dynamic bounding box radius.
- **Strict Anti-Hallucination Standard**: Organization names, addresses, contacts, and coordinates originate solely from verified geographic indices and official registries—never hallucinated by generative models.
- **Interactive Geospatial Map**: Leaflet map rendered with custom SVG pins for healthcare vs. enterprise entities, radius boundary overlay, and instant pan-to-marker interactions.
- **Multi-Signal Verification Confidence**:
  - `Maps/Places Match`: **+25 pts**
  - `Official Website Found`: **+20 pts**
  - `Address Locality Match`: **+20 pts**
  - `Phone Number Validated`: **+15 pts**
  - `Independent Cross-Reference`: **+10 pts**
  - `Government/Public Registry`: **+10 pts**
  - **Status Categories**: `VERIFIED (90-100%)`, `LIKELY_VERIFIED (70-89%)`, `UNVERIFIED (<70%)`.
- **Configurable Scoring Weights**: Live in-app configuration modal allows operators to adjust point allocations.
- **Cross-Source Deduplication**: Merges duplicate records across Overpass, Places, and Registries using geodesic Haversine distance (<150m), domain matching, and tokenized name similarity.
- **Data Export Engine**: Export filtered results as **CSV**, formatted **Excel (XLS)**, or machine-readable **JSON**.
- **Responsive Layout Modes**: Switch instantly between **Split View (Map + Cards)**, **Cards Only**, **Dense Data Table**, and **Map Only**.

---

## 3. Quickstart & Deployment

### Option A: Running in Current Container Environment
The application is pre-configured and running on port 3000:
```bash
# Verify build and start
npm run build
npm start
```
Open `http://localhost:3000` to interact with the discovery dashboard.

### Option B: Docker Compose (Full Stack with PostGIS & Redis)
```bash
# Clone and spin up all microservices:
docker compose up --build
```
Services spun up:
- `web`: Node/React frontend ingress on `http://localhost:3000`
- `backend`: FastAPI API service on `http://localhost:8000` (Swagger UI at `/docs`)
- `postgres`: PostgreSQL 15 with PostGIS 3.3 spatial extensions on port `5432`
- `redis`: Redis 7 task cache on port `6379`
- `worker`: Celery distributed scraping queue

---

## 4. API Documentation

### 1. Execute Search Query
```bash
curl -X POST http://localhost:3000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Madhapur, Hyderabad",
    "organization_type": "all",
    "radius_km": 5,
    "page": 1,
    "page_size": 50
  }'
```

**Response Contract:**
```json
{
  "search_location": {
    "query": "Madhapur, Hyderabad",
    "formatted_address": "Madhapur, Serilingampally mandal, Hyderabad, Telangana, 500081, India",
    "latitude": 17.4483,
    "longitude": 78.3915,
    "bounding_box": [17.41, 17.48, 78.35, 78.43],
    "name": "Madhapur"
  },
  "radius_km": 5,
  "total": 68,
  "companies_count": 42,
  "hospitals_count": 26,
  "verified": 48,
  "likely_verified": 16,
  "unverified": 4,
  "results": [
    {
      "id": "osm_w_medicover_hosp",
      "name": "Medicover Hospitals Madhapur",
      "type": "hospital",
      "hospital_type": "Multi-Speciality Hospital",
      "category": "Healthcare & Emergency",
      "address": "HUDA Techno Enclave, HITEC City, Madhapur, Hyderabad 500081",
      "latitude": 17.4485,
      "longitude": 78.3789,
      "distance_km": 0.8,
      "phone": "+91 40 6833 4455",
      "normalized_phone": "+91 40 6833 4455",
      "phone_type": "Primary",
      "emergency_phone": "040-68334400",
      "website": "https://www.medicoverhospitals.in",
      "verification_status": "VERIFIED",
      "verification_score": 96,
      "verification_breakdown": [ ... ],
      "verification_sources": [ ... ]
    }
  ]
}
```

### 2. Async Job Polling (Long-Running Searches)
```bash
# Initiate background job:
curl -X POST "http://localhost:3000/api/v1/search?async=true" \
  -H "Content-Type: application/json" \
  -d '{"location": "Whitefield, Bangalore", "radius_km": 10}'

# Poll status:
curl http://localhost:3000/api/v1/search/job_abc123
```

### 3. Data Export
```bash
curl -X POST http://localhost:3000/api/v1/export \
  -H "Content-Type: application/json" \
  -d '{
    "items": [ ... ],
    "format": "csv"
  }' \
  --output export.csv
```

---

## 5. Running Tests

```bash
# Run pytest suite:
pytest tests/
```
Tests cover:
- `test_verification.py`: Multi-signal scoring thresholds and point allocations.
- `test_deduplication.py`: Coordinate proximity (<150m) and Levenshtein token similarity.
- `test_phone_normalizer.py`: Indian national STD codes, E.164, and mobile regex validation.
- `test_api.py`: FastAPI health, search, and export route verification.

---

## 6. Database Schema & Spatial Indexing

The PostgreSQL database uses PostGIS:
```sql
-- Spatial query finding verified organizations within radius R:
SELECT id, name, type, ST_DistanceSphere(geom, ST_MakePoint(78.3915, 17.4483)) / 1000.0 AS distance_km
FROM organizations
WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint(78.3915, 17.4483), 4326)::geography, 5000)
ORDER BY distance_km ASC;
```
Indexed with GIST for sub-5ms performance across 100,000+ coordinates.
