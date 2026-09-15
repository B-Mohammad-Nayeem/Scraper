export type OrganizationTypeFilter = 'all' | 'companies' | 'hospitals';

export type VerificationStatus = 'VERIFIED' | 'LIKELY_VERIFIED' | 'UNVERIFIED';

export interface VerificationSignal {
  signal: string;
  key: string;
  points: number;
  maxPoints: number;
  passed: boolean;
  evidence: string;
}

export interface VerificationSource {
  name: string;
  url: string;
  type: string;
  verifiedAt?: string;
}

export interface BaseOrganization {
  id: string;
  type: 'company' | 'hospital';
  name: string;
  category: string;
  description: string;
  phone: string;
  normalized_phone: string;
  phone_type?: 'Primary' | 'Emergency' | 'Reception' | 'Customer Care';
  email: string;
  website: string;
  address: string;
  area: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  google_maps_url: string;
  source_url: string;
  source_name: string;
  verification_status: VerificationStatus;
  verification_score: number;
  verification_breakdown: VerificationSignal[];
  verification_sources: VerificationSource[];
  last_verified: string;
}

export interface CompanyRecord extends BaseOrganization {
  type: 'company';
  business_type: string;
}

export interface HospitalRecord extends BaseOrganization {
  type: 'hospital';
  hospital_name: string;
  hospital_type: string;
  specialities: string[];
  emergency_phone: string;
}

export type OrganizationItem = CompanyRecord | HospitalRecord;

export interface GeoLocationResolution {
  query: string;
  name: string;
  formatted_address: string;
  city: string;
  area: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  boundingbox?: [string, string, string, string];
}

export interface SearchParams {
  location: string;
  organization_type: OrganizationTypeFilter;
  keyword?: string;
  radius_km: number;
  page?: number;
  page_size?: number;
  verification_filter?: 'all' | VerificationStatus;
  sort_by?: 'distance' | 'score' | 'name';
  sort_order?: 'asc' | 'desc';
}

export interface SearchJobStatus {
  job_id: string;
  status: 'QUEUED' | 'RESOLVING_LOCATION' | 'DISCOVERING' | 'VERIFYING' | 'DEDUPLICATING' | 'COMPLETED' | 'FAILED';
  progress: number;
  message: string;
  search_location?: GeoLocationResolution;
  total?: number;
  companies_count?: number;
  hospitals_count?: number;
  verified?: number;
  likely_verified?: number;
  unverified?: number;
  error?: string;
}

export interface SearchResponse {
  search_location: GeoLocationResolution;
  total: number;
  companies_count: number;
  hospitals_count: number;
  verified: number;
  likely_verified: number;
  unverified: number;
  results: OrganizationItem[];
  page: number;
  page_size: number;
  total_pages: number;
}

export interface VerificationWeightConfig {
  mapsMatch: number; // default 25
  websiteFound: number; // default 20
  addressMatch: number; // default 20
  phoneMatch: number; // default 15
  independentSource: number; // default 10
  registryMatch: number; // default 10
}
