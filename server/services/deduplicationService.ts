import { OrganizationItem } from '../../src/types.js';

/**
 * Calculates Haversine distance in meters between two lat/lon points
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function normalizeOrgName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\b(pvt|private|ltd|limited|llp|inc|corporation|corp|co|hospitals?|technologies|tech|solutions|services)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Levenshtein distance ratio (0.0 to 1.0)
 */
export function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.trim();
  const s2 = str2.trim();
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;

  const matrix: number[][] = [];
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      if (s1.charAt(i - 1) === s2.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  const distance = matrix[s1.length][s2.length];
  const maxLen = Math.max(s1.length, s2.length);
  return 1 - distance / maxLen;
}

/**
 * Checks if two organizations are duplicates using geographic distance,
 * normalized name similarity, phone match, or website match.
 */
export function areDuplicates(orgA: OrganizationItem, orgB: OrganizationItem): boolean {
  if (orgA.id === orgB.id) return true;
  if (orgA.type !== orgB.type) return false;

  const distanceMeters = calculateDistanceMeters(
    orgA.latitude,
    orgA.longitude,
    orgB.latitude,
    orgB.longitude
  );

  const normA = normalizeOrgName(orgA.name);
  const normB = normalizeOrgName(orgB.name);
  const nameSim = stringSimilarity(normA, normB);

  // Phone match check
  const phoneMatch =
    orgA.normalized_phone !== 'Not available' &&
    orgB.normalized_phone !== 'Not available' &&
    orgA.normalized_phone.replace(/\D/g, '') === orgB.normalized_phone.replace(/\D/g, '');

  // Website domain match check
  let domainMatch = false;
  try {
    if (orgA.website && orgB.website && orgA.website.startsWith('http') && orgB.website.startsWith('http')) {
      const domA = new URL(orgA.website).hostname.replace('www.', '');
      const domB = new URL(orgB.website).hostname.replace('www.', '');
      if (domA === domB) domainMatch = true;
    }
  } catch {
    // Ignore URL parse errors
  }

  // 1. Same phone number and within 500m -> duplicate
  if (phoneMatch && distanceMeters < 500) {
    return true;
  }

  // 2. High name similarity (> 0.85) and within 150m -> duplicate
  if (nameSim >= 0.82 && distanceMeters < 150) {
    return true;
  }

  // 3. Exactly identical domain and within 300m -> duplicate
  if (domainMatch && distanceMeters < 300) {
    return true;
  }

  // 4. Exact normalized name match and within 250m -> duplicate
  if (normA.length > 3 && normA === normB && distanceMeters < 250) {
    return true;
  }

  return false;
}

/**
 * Deduplicates a list of organization items, merging source links,
 * keeping the highest verification score, and retaining best address/phone.
 */
export function deduplicateOrganizations(items: OrganizationItem[]): OrganizationItem[] {
  const result: OrganizationItem[] = [];

  for (const item of items) {
    const existingIndex = result.findIndex((existing) => areDuplicates(existing, item));

    if (existingIndex === -1) {
      result.push({ ...item });
    } else {
      const target = result[existingIndex];
      // Merge sources without duplicates
      const mergedSources = [...target.verification_sources];
      for (const s of item.verification_sources) {
        if (!mergedSources.some((ms) => ms.url === s.url)) {
          mergedSources.push(s);
        }
      }
      target.verification_sources = mergedSources;

      // Keep better phone if missing
      if (target.phone === 'Not available' && item.phone !== 'Not available') {
        target.phone = item.phone;
        target.normalized_phone = item.normalized_phone;
        target.phone_type = item.phone_type;
      }

      // Keep better website if missing
      if ((!target.website || target.website === 'Not available') && item.website && item.website !== 'Not available') {
        target.website = item.website;
      }

      // Keep longer/better address
      if ((!target.address || target.address === 'Not available') && item.address && item.address !== 'Not available') {
        target.address = item.address;
      }

      // Keep higher verification score
      if (item.verification_score > target.verification_score) {
        target.verification_score = item.verification_score;
        target.verification_status = item.verification_status;
        target.verification_breakdown = item.verification_breakdown;
      }
    }
  }

  return result;
}
