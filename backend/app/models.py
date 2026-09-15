import datetime
from sqlalchemy import Column, String, Numeric, Text, DateTime, Boolean, Integer, JSON
from sqlalchemy.orm import declarative_base
from geoalchemy2 import Geometry

Base = declarative_base()

class OrganizationModel(Base):
    __tablename__ = "organizations"

    id = Column(String(100), primary_key=True)
    name = Column(String(255), nullable=False)
    normalized_name = Column(String(255), nullable=False, index=True)
    type = Column(String(50), nullable=False, index=True) # 'company' or 'hospital'
    business_type = Column(String(100))
    hospital_type = Column(String(100))
    category = Column(String(150))
    description = Column(Text)
    specialities = Column(JSON, default=list)

    # Location & PostGIS geometry
    address = Column(Text, nullable=False)
    normalized_address = Column(Text)
    area = Column(String(150))
    city = Column(String(100), index=True)
    state = Column(String(100))
    postal_code = Column(String(20), index=True)
    country = Column(String(100), default="India")
    latitude = Column(Numeric(9, 6), nullable=False)
    longitude = Column(Numeric(9, 6), nullable=False)
    geom = Column(Geometry(geometry_type='POINT', srid=4326))

    # Contact details
    phone = Column(String(100))
    normalized_phone = Column(String(50))
    phone_type = Column(String(50))
    emergency_phone = Column(String(100))
    email = Column(String(255))
    website = Column(String(500))
    normalized_domain = Column(String(255), index=True)

    # Verification scoring
    verification_status = Column(String(50), nullable=False, default="UNVERIFIED", index=True)
    verification_score = Column(Integer, nullable=False, default=0)
    verification_breakdown = Column(JSON, default=list)
    verification_sources = Column(JSON, default=list)
    primary_source = Column(String(100), nullable=False, default="OpenStreetMap")

    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
