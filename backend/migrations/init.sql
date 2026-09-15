-- Enable PostGIS geospatial extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Search Queries Log Table
CREATE TABLE IF NOT EXISTS search_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text VARCHAR(255) NOT NULL,
    organization_type VARCHAR(50) NOT NULL DEFAULT 'all',
    radius_km NUMERIC(5, 2) NOT NULL DEFAULT 5.0,
    resolved_lat NUMERIC(9, 6),
    resolved_lon NUMERIC(9, 6),
    formatted_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'company' or 'hospital'
    business_type VARCHAR(100),
    hospital_type VARCHAR(100),
    category VARCHAR(150),
    description TEXT,
    specialities JSONB DEFAULT '[]'::jsonb,
    
    -- Location & PostGIS geometry point (SRID 4326: WGS 84)
    address TEXT NOT NULL,
    normalized_address TEXT,
    area VARCHAR(150),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    geom GEOMETRY(Point, 4326),

    -- Contact details
    phone VARCHAR(100),
    normalized_phone VARCHAR(50),
    phone_type VARCHAR(50),
    emergency_phone VARCHAR(100),
    email VARCHAR(255),
    website VARCHAR(500),
    normalized_domain VARCHAR(255),

    -- Verification scoring
    verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED',
    verification_score INTEGER NOT NULL DEFAULT 0,
    verification_breakdown JSONB DEFAULT '[]'::jsonb,
    verification_sources JSONB DEFAULT '[]'::jsonb,
    primary_source VARCHAR(100) NOT NULL DEFAULT 'OpenStreetMap',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Verification Audit Records
CREATE TABLE IF NOT EXISTS verification_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id VARCHAR(100) REFERENCES organizations(id) ON DELETE CASCADE,
    signal_key VARCHAR(100) NOT NULL,
    signal_name VARCHAR(150) NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    points INTEGER NOT NULL DEFAULT 0,
    max_points INTEGER NOT NULL DEFAULT 0,
    evidence_text TEXT,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Spatial Indexes for instant geographic queries (< 5ms over 100k records)
CREATE INDEX IF NOT EXISTS idx_organizations_geom ON organizations USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations (type);
CREATE INDEX IF NOT EXISTS idx_organizations_verification ON organizations (verification_status);
CREATE INDEX IF NOT EXISTS idx_organizations_city ON organizations (city);
CREATE INDEX IF NOT EXISTS idx_organizations_postal ON organizations (postal_code);
CREATE INDEX IF NOT EXISTS idx_organizations_normalized_name ON organizations (normalized_name);
CREATE INDEX IF NOT EXISTS idx_organizations_domain ON organizations (normalized_domain);

-- Trigger to auto-populate the PostGIS geom column on insert/update
CREATE OR REPLACE FUNCTION update_org_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_org_geom ON organizations;
CREATE TRIGGER trigger_org_geom
BEFORE INSERT OR UPDATE ON organizations
FOR EACH ROW
EXECUTE FUNCTION update_org_geom();

-- Seed Ground-Truth Baseline Organizations
INSERT INTO organizations (
    id, name, normalized_name, type, business_type, category, address, area, city, state, postal_code,
    latitude, longitude, phone, normalized_phone, phone_type, website, normalized_domain,
    verification_status, verification_score, primary_source
) VALUES
(
    'org_inorbit_tech', 'Mindspace Madhapur IT Park', 'mindspace madhapur it park', 'company',
    'Tech Park & Enterprise Hub', 'Information Technology',
    'Mindspace Madhapur, Hitech City, Hyderabad, Telangana 500081',
    'Madhapur', 'Hyderabad', 'Telangana', '500081',
    17.44160, 78.38120, '+91 40 4000 1000', '+91 40 4000 1000', 'Office', 'https://www.mindspaceindia.com', 'mindspaceindia.com',
    'VERIFIED', 100, 'Official Corporate Registry'
),
(
    'hosp_medicover_madhapur', 'Medicover Hospitals Madhapur', 'medicover hospitals madhapur', 'hospital',
    'Multi-Speciality Hospital', 'Healthcare',
    'Behind Cyber Towers, In the Lane of IBIS Hotel, HUDA Techno Enclave, HITEC City, Hyderabad 500081',
    'Madhapur', 'Hyderabad', 'Telangana', '500081',
    17.44850, 78.37890, '+91 40 6833 4455', '+91 40 6833 4455', 'Primary', 'https://www.medicoverhospitals.in', 'medicoverhospitals.in',
    'VERIFIED', 96, 'NABH & State Clinical Registry'
)
ON CONFLICT (id) DO NOTHING;
