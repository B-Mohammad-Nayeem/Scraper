from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

class SearchRequestSchema(BaseModel):
    location: str = Field(..., description="Target area, locality, city, or PIN code")
    organization_type: Literal["all", "companies", "hospitals"] = "all"
    keyword: Optional[str] = None
    radius_km: float = Field(5.0, ge=0.5, le=50.0)
    page: int = Field(1, ge=1)
    page_size: int = Field(50, ge=1, le=200)

class VerificationSignalSchema(BaseModel):
    signal: str
    key: str
    passed: bool
    points: int
    maxPoints: int
    evidence: str

class VerificationSourceSchema(BaseModel):
    name: str
    url: str
    type: str

class OrganizationSchema(BaseModel):
    id: str
    name: str
    type: Literal["company", "hospital"]
    business_type: Optional[str] = None
    hospital_type: Optional[str] = None
    category: str
    description: Optional[str] = None
    specialities: Optional[List[str]] = None
    address: str
    area: Optional[str] = None
    city: str
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: str = "India"
    latitude: float
    longitude: float
    distance_km: float
    phone: str
    normalized_phone: str
    phone_type: Optional[str] = None
    emergency_phone: Optional[str] = None
    email: str
    website: str
    google_maps_url: str
    verification_status: Literal["VERIFIED", "LIKELY_VERIFIED", "UNVERIFIED"]
    verification_score: int
    verification_breakdown: List[VerificationSignalSchema]
    verification_sources: List[VerificationSourceSchema]
    source_name: str
    last_verified: Optional[str] = None

class GeoLocationResolutionSchema(BaseModel):
    query: str
    formatted_address: str
    latitude: float
    longitude: float
    bounding_box: List[float]
    name: str

class SearchResponseSchema(BaseModel):
    search_location: GeoLocationResolutionSchema
    radius_km: float
    total: int
    companies_count: int
    hospitals_count: int
    verified: int
    likely_verified: int
    unverified: int
    page: int
    page_size: int
    total_pages: int
    results: List[OrganizationSchema]

class ExportRequestSchema(BaseModel):
    items: List[Dict[str, Any]]
    format: Literal["csv", "excel", "json"] = "csv"
    filename: Optional[str] = "export"
