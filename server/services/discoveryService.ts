import {
  OrganizationItem,
  SearchParams,
  SearchResponse
} from '../../src/types.js';
import { deduplicateOrganizations } from './deduplicationService.js';
import { resolveLocation } from './locationService.js';
import { fetchOSMOrganizations } from '../sources/osmOverpass.js';
import { getVerifiedOrganizationsForArea } from '../sources/verifiedDirectory.js';

export async function runDiscovery(params: SearchParams): Promise<SearchResponse> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.page_size || 50));
  const radiusKm = params.radius_km || 5;
  const orgType = params.organization_type || 'all';

  // 1. Resolve Location
  const searchLocation = await resolveLocation(params.location || 'Madhapur, Hyderabad');

  // 2. Discover from external and verified sources in parallel
  const [osmResults, directoryResults] = await Promise.all([
    fetchOSMOrganizations(searchLocation, radiusKm, orgType, params.keyword).catch((err) => {
      console.warn('OSM fetch caught error:', err);
      return [] as OrganizationItem[];
    }),
    Promise.resolve(getVerifiedOrganizationsForArea(searchLocation, radiusKm, orgType, params.keyword))
  ]);

  // Combine raw records
  const combinedRaw: OrganizationItem[] = [...directoryResults, ...osmResults];

  // 3. Deduplicate records across all sources
  let deduplicated = deduplicateOrganizations(combinedRaw);

  // 4. Verification filter if applied
  if (params.verification_filter && params.verification_filter !== 'all') {
    deduplicated = deduplicated.filter((item) => item.verification_status === params.verification_filter);
  }

  // 5. Sorting
  const sortBy = params.sort_by || 'score';
  const sortOrder = params.sort_order || (sortBy === 'distance' ? 'asc' : 'desc');

  deduplicated.sort((a, b) => {
    let diff = 0;
    if (sortBy === 'distance') {
      diff = a.distance_km - b.distance_km;
    } else if (sortBy === 'score') {
      diff = b.verification_score - a.verification_score;
    } else if (sortBy === 'name') {
      diff = a.name.localeCompare(b.name);
    }
    return sortOrder === 'asc' ? diff : -diff;
  });

  // Calculate statistics across all discovered items
  const total = deduplicated.length;
  let companiesCount = 0;
  let hospitalsCount = 0;
  let verifiedCount = 0;
  let likelyVerifiedCount = 0;
  let unverifiedCount = 0;

  for (const item of deduplicated) {
    if (item.type === 'company') companiesCount++;
    if (item.type === 'hospital') hospitalsCount++;
    if (item.verification_status === 'VERIFIED') verifiedCount++;
    else if (item.verification_status === 'LIKELY_VERIFIED') likelyVerifiedCount++;
    else unverifiedCount++;
  }

  // 6. Server-side Pagination
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = deduplicated.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    search_location: searchLocation,
    total,
    companies_count: companiesCount,
    hospitals_count: hospitalsCount,
    verified: verifiedCount,
    likely_verified: likelyVerifiedCount,
    unverified: unverifiedCount,
    results: paginatedItems,
    page,
    page_size: pageSize,
    total_pages: totalPages
  };
}

// In-memory store for quick lookups by ID
const globalItemStore = new Map<string, OrganizationItem>();

export function cacheOrganizations(items: OrganizationItem[]) {
  for (const item of items) {
    globalItemStore.set(item.id, item);
  }
}

export function getOrganizationById(id: string): OrganizationItem | null {
  return globalItemStore.get(id) || null;
}
