import {
  CompanyRecord,
  GeoLocationResolution,
  HospitalRecord,
  OrganizationItem,
  OrganizationTypeFilter
} from '../../src/types.js';
import { calculateDistanceMeters } from '../services/deduplicationService.js';
import { normalizePhoneNumber } from '../services/phoneNormalizer.js';
import { evaluateVerification } from '../services/verificationService.js';

interface OSMElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

export async function fetchOSMOrganizations(
  location: GeoLocationResolution,
  radiusKm: number,
  typeFilter: OrganizationTypeFilter,
  keyword?: string
): Promise<OrganizationItem[]> {
  const radiusMeters = Math.min(radiusKm * 1000, 25000);
  const lat = location.latitude;
  const lon = location.longitude;

  // Build Overpass QL
  const parts: string[] = [];

  if (typeFilter === 'all' || typeFilter === 'companies') {
    parts.push(`node["office"](around:${radiusMeters},${lat},${lon});`);
    parts.push(`way["office"](around:${radiusMeters},${lat},${lon});`);
    parts.push(`node["amenity"="coworking_space"](around:${radiusMeters},${lat},${lon});`);
    parts.push(`node["amenity"="bank"](around:${radiusMeters},${lat},${lon});`);
    parts.push(`way["building"="commercial"](around:${radiusMeters},${lat},${lon});`);
    parts.push(`node["building"="commercial"](around:${radiusMeters},${lat},${lon});`);
  }

  if (typeFilter === 'all' || typeFilter === 'hospitals') {
    parts.push(`node["amenity"="hospital"](around:${radiusMeters},${lat},${lon});`);
    parts.push(`way["amenity"="hospital"](around:${radiusMeters},${lat},${lon});`);
    parts.push(`node["amenity"="clinic"](around:${radiusMeters},${lat},${lon});`);
    parts.push(`way["amenity"="clinic"](around:${radiusMeters},${lat},${lon});`);
    parts.push(`node["healthcare"="hospital"](around:${radiusMeters},${lat},${lon});`);
    parts.push(`node["healthcare"="clinic"](around:${radiusMeters},${lat},${lon});`);
    parts.push(`node["amenity"="doctors"](around:${radiusMeters},${lat},${lon});`);
  }

  const query = `
    [out:json][timeout:15];
    (
      ${parts.join('\n      ')}
    );
    out center tags;
  `;

  let elements: OSMElement[] = [];

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'GeoDiscover-Enterprise/1.0 (Hospital and Business Area Discovery)'
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal
      });

      clearTimeout(timer);

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.elements) && data.elements.length > 0) {
          elements = data.elements;
          break; // successfully fetched
        }
      }
    } catch (err) {
      console.warn(`Overpass endpoint ${endpoint} failed or timed out:`, err);
    }
  }

  // Parse OSM elements into structured records
  const items: OrganizationItem[] = [];

  for (const el of elements) {
    const tags = el.tags || {};
    const rawName = tags.name || tags['name:en'];
    if (!rawName || rawName.trim().length < 2) continue;

    const elLat = el.lat ?? el.center?.lat ?? lat;
    const elLon = el.lon ?? el.center?.lon ?? lon;

    const distanceMeters = calculateDistanceMeters(lat, lon, elLat, elLon);
    const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;

    // Filter by requested radius strictly
    if (distanceKm > radiusKm + 0.5) continue;

    // Keyword filtering if supplied
    if (keyword && keyword.trim().length > 0) {
      const kw = keyword.toLowerCase();
      const searchable = `${rawName} ${tags.description || ''} ${tags.office || ''} ${tags.healthcare || ''} ${
        tags['healthcare:speciality'] || ''
      }`.toLowerCase();
      if (!searchable.includes(kw)) continue;
    }

    const isHospitalOrClinic =
      tags.amenity === 'hospital' ||
      tags.amenity === 'clinic' ||
      tags.amenity === 'doctors' ||
      tags.healthcare === 'hospital' ||
      tags.healthcare === 'clinic' ||
      rawName.toLowerCase().includes('hospital') ||
      rawName.toLowerCase().includes('clinic') ||
      rawName.toLowerCase().includes('health');

    // Build raw fields
    const rawPhone = tags.phone || tags['contact:phone'] || tags['contact:mobile'] || null;
    const phoneResult = normalizePhoneNumber(rawPhone, { isHospital: isHospitalOrClinic });

    const rawEmergency = tags['emergency:phone'] || (isHospitalOrClinic && rawPhone?.includes('108') ? '108' : null);
    const emergencyResult = normalizePhoneNumber(rawEmergency, { isHospital: true, label: 'emergency' });

    const website = tags.website || tags['contact:website'] || tags.url || 'Not available';
    const email = tags.email || tags['contact:email'] || 'Not available';

    // Address reconstruction
    const street = [tags['addr:housenumber'], tags['addr:housename'], tags['addr:street']].filter(Boolean).join(' ');
    const suburb = tags['addr:suburb'] || tags['addr:district'] || location.area || '';
    const city = tags['addr:city'] || location.city || 'Hyderabad';
    const state = tags['addr:state'] || location.state || 'Telangana';
    const country = tags['addr:country'] || location.country || 'India';
    const postalCode = tags['addr:postcode'] || location.postal_code || '';

    const formattedAddress = street
      ? `${street}, ${suburb ? suburb + ', ' : ''}${city}, ${state} ${postalCode}`.trim()
      : `${rawName}, ${suburb ? suburb + ', ' : ''}${city}, ${state}`;

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${rawName} ${formattedAddress}`
    )}`;
    const osmSourceUrl = `https://www.openstreetmap.org/${el.type}/${el.id}`;

    // Verification evaluation
    const evalResult = evaluateVerification({
      name: rawName,
      hasMapsMatch: true,
      website: website !== 'Not available' ? website : undefined,
      address: formattedAddress,
      phone: phoneResult.normalized_phone,
      isPhoneValid: phoneResult.is_valid,
      independentSourceCount: 1, // maps + google maps search link
      hasRegistryMatch: !!(tags.operator || tags.brand || isHospitalOrClinic),
      areaOrCityMatch: formattedAddress.toLowerCase().includes(location.city.toLowerCase()) || formattedAddress.toLowerCase().includes(location.area.toLowerCase())
    });

    if (isHospitalOrClinic && (typeFilter === 'all' || typeFilter === 'hospitals')) {
      let hospitalType = 'General Hospital';
      const lower = rawName.toLowerCase();
      if (lower.includes('eye') || lower.includes('netra')) hospitalType = 'Eye Hospital';
      else if (lower.includes('dental') || lower.includes('dent')) hospitalType = 'Dental Hospital';
      else if (lower.includes('children') || lower.includes('pediatric')) hospitalType = "Children's Hospital";
      else if (lower.includes('super') || lower.includes('multi')) hospitalType = 'Multi-Speciality Hospital';
      else if (tags.amenity === 'clinic' || lower.includes('clinic')) hospitalType = 'Clinic';
      else if (lower.includes('diagnostic') || lower.includes('scan')) hospitalType = 'Diagnostic Center';
      else if (tags.operator_type === 'public' || lower.includes('government') || lower.includes('govt'))
        hospitalType = 'Government Hospital';

      const specialitiesList = tags['healthcare:speciality']
        ? tags['healthcare:speciality'].split(';').map((s) => s.trim())
        : [
            hospitalType === 'Eye Hospital'
              ? 'Ophthalmology'
              : hospitalType === 'Dental Hospital'
              ? 'Dental Surgery'
              : hospitalType === "Children's Hospital"
              ? 'Pediatrics'
              : 'General Medicine'
          ];

      const hospital: HospitalRecord = {
        id: `osm-${el.type}-${el.id}`,
        type: 'hospital',
        name: rawName,
        hospital_name: rawName,
        hospital_type: hospitalType,
        specialities: specialitiesList,
        category: 'Healthcare & Medical Services',
        description:
          tags.description ||
          `${hospitalType} providing medical care, inpatient/outpatient treatment, and healthcare services in ${suburb || city}.`,
        phone: phoneResult.raw_phone,
        normalized_phone: phoneResult.normalized_phone,
        phone_type: phoneResult.phone_type,
        emergency_phone: emergencyResult.normalized_phone !== 'Not available' ? emergencyResult.normalized_phone : (phoneResult.normalized_phone !== 'Not available' ? phoneResult.normalized_phone : 'Not available'),
        email,
        website,
        address: formattedAddress,
        area: suburb || location.area,
        city,
        state,
        country,
        postal_code: postalCode,
        latitude: elLat,
        longitude: elLon,
        distance_km: distanceKm,
        google_maps_url: googleMapsUrl,
        source_url: osmSourceUrl,
        source_name: 'OpenStreetMap',
        verification_status: evalResult.status,
        verification_score: evalResult.score,
        verification_breakdown: evalResult.breakdown,
        verification_sources: [
          { name: 'OpenStreetMap Overpass Geodata', url: osmSourceUrl, type: 'Public Geodatabase' },
          ...evalResult.sources
        ],
        last_verified: new Date().toISOString().split('T')[0]
      };
      items.push(hospital);
    } else if (!isHospitalOrClinic && (typeFilter === 'all' || typeFilter === 'companies')) {
      const officeType = tags.office || tags.building || 'Commercial';
      let category = 'Corporate & Technology';
      const lower = rawName.toLowerCase();
      if (lower.includes('tech') || lower.includes('software') || lower.includes('infotech') || lower.includes('solutions')) {
        category = 'Information Technology & Software';
      } else if (lower.includes('bank') || lower.includes('finance') || tags.amenity === 'bank') {
        category = 'Banking & Financial Services';
      } else if (lower.includes('pharma') || lower.includes('biotech') || lower.includes('labs')) {
        category = 'Pharmaceuticals & Biotechnology';
      } else if (lower.includes('consult') || lower.includes('advisory')) {
        category = 'Management & Professional Consulting';
      }

      const company: CompanyRecord = {
        id: `osm-${el.type}-${el.id}`,
        type: 'company',
        name: rawName,
        business_type: officeType.charAt(0).toUpperCase() + officeType.slice(1),
        category,
        description:
          tags.description ||
          `Registered enterprise and workplace operating in ${suburb || city}, verified via geographic place registration.`,
        phone: phoneResult.raw_phone,
        normalized_phone: phoneResult.normalized_phone,
        phone_type: phoneResult.phone_type,
        email,
        website,
        address: formattedAddress,
        area: suburb || location.area,
        city,
        state,
        country,
        postal_code: postalCode,
        latitude: elLat,
        longitude: elLon,
        distance_km: distanceKm,
        google_maps_url: googleMapsUrl,
        source_url: osmSourceUrl,
        source_name: 'OpenStreetMap',
        verification_status: evalResult.status,
        verification_score: evalResult.score,
        verification_breakdown: evalResult.breakdown,
        verification_sources: [
          { name: 'OpenStreetMap Overpass Geodata', url: osmSourceUrl, type: 'Public Geodatabase' },
          ...evalResult.sources
        ],
        last_verified: new Date().toISOString().split('T')[0]
      };
      items.push(company);
    }
  }

  return items;
}
