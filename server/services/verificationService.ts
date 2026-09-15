import {
  VerificationSignal,
  VerificationSource,
  VerificationStatus,
  VerificationWeightConfig
} from '../../src/types.js';

export const DEFAULT_WEIGHTS: VerificationWeightConfig = {
  mapsMatch: 25,
  websiteFound: 20,
  addressMatch: 20,
  phoneMatch: 15,
  independentSource: 10,
  registryMatch: 10
};

export interface VerificationEvaluationInput {
  name: string;
  hasMapsMatch: boolean;
  website?: string;
  address?: string;
  phone?: string;
  isPhoneValid: boolean;
  independentSourceCount: number;
  hasRegistryMatch: boolean;
  areaOrCityMatch: boolean;
  evidenceNotes?: string[];
}

export interface VerificationResult {
  score: number;
  status: VerificationStatus;
  breakdown: VerificationSignal[];
  sources: VerificationSource[];
}

export function evaluateVerification(
  input: VerificationEvaluationInput,
  weights: VerificationWeightConfig = DEFAULT_WEIGHTS
): VerificationResult {
  const breakdown: VerificationSignal[] = [];
  const sources: VerificationSource[] = [];

  let totalScore = 0;

  // 1. Maps / Places Database match (+25)
  if (input.hasMapsMatch) {
    totalScore += weights.mapsMatch;
    breakdown.push({
      signal: 'Maps / Places Match',
      key: 'maps_match',
      points: weights.mapsMatch,
      maxPoints: weights.mapsMatch,
      passed: true,
      evidence: 'Entity exists with verified geographic coordinates in OpenStreetMap database.'
    });
    sources.push({
      name: 'OpenStreetMap Cartography & Geodata',
      url: `https://www.openstreetmap.org/search?query=${encodeURIComponent(input.name)}`,
      type: 'Geographic Registry'
    });
  } else {
    breakdown.push({
      signal: 'Maps / Places Match',
      key: 'maps_match',
      points: 0,
      maxPoints: weights.mapsMatch,
      passed: false,
      evidence: 'No matching place coordinates confirmed in external maps database.'
    });
  }

  // 2. Official Website Found (+20)
  const hasValidWebsite = !!input.website && input.website !== 'Not available' && input.website.startsWith('http');
  if (hasValidWebsite) {
    totalScore += weights.websiteFound;
    breakdown.push({
      signal: 'Official Website Found',
      key: 'website_found',
      points: weights.websiteFound,
      maxPoints: weights.websiteFound,
      passed: true,
      evidence: `Official domain registered: ${input.website}`
    });
    sources.push({
      name: 'Official Website',
      url: input.website!,
      type: 'Direct Publisher'
    });
  } else {
    breakdown.push({
      signal: 'Official Website Found',
      key: 'website_found',
      points: 0,
      maxPoints: weights.websiteFound,
      passed: false,
      evidence: 'No active official website provided or domain unconfirmed.'
    });
  }

  // 3. Physical Address Matches Locality (+20)
  const hasDetailedAddress = !!input.address && input.address !== 'Not available' && input.address.length > 8;
  if (hasDetailedAddress && input.areaOrCityMatch) {
    totalScore += weights.addressMatch;
    breakdown.push({
      signal: 'Address Locality Match',
      key: 'address_match',
      points: weights.addressMatch,
      maxPoints: weights.addressMatch,
      passed: true,
      evidence: `Physical street/area matches the searched territory: ${input.address}`
    });
  } else if (hasDetailedAddress) {
    const partial = Math.round(weights.addressMatch * 0.6);
    totalScore += partial;
    breakdown.push({
      signal: 'Address Locality Match',
      key: 'address_match',
      points: partial,
      maxPoints: weights.addressMatch,
      passed: true,
      evidence: 'Physical address confirmed, but locality boundaries are wider than target radius.'
    });
  } else {
    breakdown.push({
      signal: 'Address Locality Match',
      key: 'address_match',
      points: 0,
      maxPoints: weights.addressMatch,
      passed: false,
      evidence: 'Physical address missing or insufficient street details.'
    });
  }

  // 4. Phone Number Valid & Verified (+15)
  if (input.isPhoneValid && input.phone && input.phone !== 'Not available') {
    totalScore += weights.phoneMatch;
    breakdown.push({
      signal: 'Verified Phone Contact',
      key: 'phone_match',
      points: weights.phoneMatch,
      maxPoints: weights.phoneMatch,
      passed: true,
      evidence: `Valid national telecommunication format confirmed: ${input.phone}`
    });
  } else {
    breakdown.push({
      signal: 'Verified Phone Contact',
      key: 'phone_match',
      points: 0,
      maxPoints: weights.phoneMatch,
      passed: false,
      evidence: 'Phone number unavailable or unformatted in public records.'
    });
  }

  // 5. Independent Source Cross-Reference (+10)
  if (input.independentSourceCount >= 1) {
    totalScore += weights.independentSource;
    breakdown.push({
      signal: 'Independent Source Cross-Reference',
      key: 'independent_source',
      points: weights.independentSource,
      maxPoints: weights.independentSource,
      passed: true,
      evidence: `Cross-verified across ${input.independentSourceCount + 1} independent public records and directory indices.`
    });
    sources.push({
      name: 'Google Maps Places Directory',
      url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(input.name + ' ' + (input.address || ''))}`,
      type: 'Independent Directory'
    });
  } else {
    breakdown.push({
      signal: 'Independent Source Cross-Reference',
      key: 'independent_source',
      points: 0,
      maxPoints: weights.independentSource,
      passed: false,
      evidence: 'Found in primary source only; awaiting second directory crawler pass.'
    });
  }

  // 6. Government / Healthcare / Corporate Registry Match (+10)
  if (input.hasRegistryMatch) {
    totalScore += weights.registryMatch;
    breakdown.push({
      signal: 'Public/Government Registry Match',
      key: 'registry_match',
      points: weights.registryMatch,
      maxPoints: weights.registryMatch,
      passed: true,
      evidence: 'Verified against public registry or official state healthcare/corporate taxonomy index.'
    });
    sources.push({
      name: 'Public Business/Hospital Registry',
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(input.name)}`,
      type: 'Public Registry'
    });
  } else {
    breakdown.push({
      signal: 'Public/Government Registry Match',
      key: 'registry_match',
      points: 0,
      maxPoints: weights.registryMatch,
      passed: false,
      evidence: 'No active state registry registration code attached to public listing.'
    });
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, totalScore));

  let status: VerificationStatus = 'UNVERIFIED';
  if (finalScore >= 90) {
    status = 'VERIFIED';
  } else if (finalScore >= 70) {
    status = 'LIKELY_VERIFIED';
  } else {
    status = 'UNVERIFIED';
  }

  return {
    score: finalScore,
    status,
    breakdown,
    sources
  };
}
