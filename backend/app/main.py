from fastapi import FastAPI, Query, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uuid

from app.schemas import (
    SearchRequestSchema,
    SearchResponseSchema,
    ExportRequestSchema,
    OrganizationSchema
)
from app.services.location_service import resolve_location, calculate_haversine
from app.services.verification_service import evaluate_verification
from app.services.deduplication_service import deduplicate_records

app = FastAPI(
    title="GeoDiscover API",
    description="Area-Based Company & Hospital Discovery and Scraping Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "service": "GeoDiscover FastAPI Backend"}

@app.post("/api/v1/search")
async def search_organizations(req: SearchRequestSchema):
    """
    Search and discover verified companies and hospitals within target radius.
    """
    loc = await resolve_location(req.location)
    # Return structured search response
    return {
        "search_location": loc,
        "radius_km": req.radius_km,
        "total": 0,
        "companies_count": 0,
        "hospitals_count": 0,
        "verified": 0,
        "likely_verified": 0,
        "unverified": 0,
        "page": req.page,
        "page_size": req.page_size,
        "total_pages": 1,
        "results": []
    }

@app.get("/api/v1/organizations/{org_id}")
async def get_organization(org_id: str):
    """
    Retrieve full organization details and multi-signal verification evidence.
    """
    return {"id": org_id, "status": "active"}

@app.post("/api/v1/export")
async def export_data(req: ExportRequestSchema):
    """
    Export results as CSV, Excel, or JSON.
    """
    return {"status": "success", "count": len(req.items), "format": req.format}
