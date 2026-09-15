import { OrganizationItem, SearchJobStatus, SearchParams, SearchResponse } from '../../src/types.js';
import { cacheOrganizations, runDiscovery } from './discoveryService.js';

interface JobRecord {
  job: SearchJobStatus;
  response?: SearchResponse;
  createdAt: number;
}

const jobs = new Map<string, JobRecord>();

// Clean up jobs older than 1 hour
setInterval(() => {
  const now = Date.now();
  for (const [id, record] of jobs.entries()) {
    if (now - record.createdAt > 3600000) {
      jobs.delete(id);
    }
  }
}, 600000);

export function createSearchJob(params: SearchParams): string {
  const jobId = 'job_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);

  const initialStatus: SearchJobStatus = {
    job_id: jobId,
    status: 'QUEUED',
    progress: 10,
    message: 'Search task queued in discovery engine...'
  };

  jobs.set(jobId, {
    job: initialStatus,
    createdAt: Date.now()
  });

  // Run in background
  executeJob(jobId, params).catch((err) => {
    console.error(`Job ${jobId} failed:`, err);
    const existing = jobs.get(jobId);
    if (existing) {
      existing.job.status = 'FAILED';
      existing.job.error = err.message || 'Discovery pipeline failed';
    }
  });

  return jobId;
}

async function executeJob(jobId: string, params: SearchParams) {
  const record = jobs.get(jobId);
  if (!record) return;

  // Stage 1: Resolving Location
  record.job.status = 'RESOLVING_LOCATION';
  record.job.progress = 25;
  record.job.message = `Resolving geographic coordinates for '${params.location}'...`;

  await new Promise((r) => setTimeout(r, 400));

  // Stage 2: Discovering Sources
  record.job.status = 'DISCOVERING';
  record.job.progress = 55;
  record.job.message = `Querying OpenStreetMap Overpass and verified directories around ${params.radius_km || 5}km...`;

  const discoveryResult = await runDiscovery(params);

  // Stage 3: Verifying
  record.job.status = 'VERIFYING';
  record.job.progress = 80;
  record.job.message = `Evaluating multi-signal verification scores across ${discoveryResult.total} entities...`;

  await new Promise((r) => setTimeout(r, 300));

  // Stage 4: Completed
  cacheOrganizations(discoveryResult.results);

  record.job.status = 'COMPLETED';
  record.job.progress = 100;
  record.job.message = `Discovered ${discoveryResult.total} verified organizations (${discoveryResult.companies_count} companies, ${discoveryResult.hospitals_count} hospitals).`;
  record.job.search_location = discoveryResult.search_location;
  record.job.total = discoveryResult.total;
  record.job.companies_count = discoveryResult.companies_count;
  record.job.hospitals_count = discoveryResult.hospitals_count;
  record.job.verified = discoveryResult.verified;
  record.job.likely_verified = discoveryResult.likely_verified;
  record.job.unverified = discoveryResult.unverified;
  record.response = discoveryResult;
}

export function getJob(jobId: string): { job: SearchJobStatus; response?: SearchResponse } | null {
  const record = jobs.get(jobId);
  if (!record) return null;
  return {
    job: record.job,
    response: record.response
  };
}
