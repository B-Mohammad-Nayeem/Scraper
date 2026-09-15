import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { resolveLocation } from './server/services/locationService.js';
import { runDiscovery, getOrganizationById } from './server/services/discoveryService.js';
import { createSearchJob, getJob } from './server/services/jobManager.js';
import { exportToCSV, exportToExcelXML, exportToJSON } from './server/services/exportService.js';
import { SearchParams } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logger
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      if (req.path.startsWith('/api')) {
        console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${Date.now() - start}ms)`);
      }
    });
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'GeoDiscover Area Discovery Engine',
      timestamp: new Date().toISOString()
    });
  });

  // Geocode location preview
  app.get('/api/v1/geocode', async (req, res) => {
    try {
      const q = (req.query.q as string) || 'Madhapur, Hyderabad';
      const resolved = await resolveLocation(q);
      res.json(resolved);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Geocoding failed' });
    }
  });

  // Search API (Supports both async job creation and direct execution)
  app.post('/api/v1/search', async (req, res) => {
    try {
      const body: SearchParams = req.body;
      const isAsync = req.query.async === 'true';

      if (isAsync) {
        const jobId = createSearchJob(body);
        return res.status(202).json({
          job_id: jobId,
          status: 'QUEUED',
          poll_url: `/api/v1/search/${jobId}`
        });
      }

      // Direct synchronous execution
      const result = await runDiscovery(body);
      res.json(result);
    } catch (err: any) {
      console.error('Search endpoint error:', err);
      res.status(500).json({ error: err.message || 'Search failed' });
    }
  });

  // Poll Search Job
  app.get('/api/v1/search/:jobId', (req, res) => {
    const jobId = req.params.jobId;
    const record = getJob(jobId);

    if (!record) {
      return res.status(404).json({ error: 'Search job not found or expired' });
    }

    if (record.job.status === 'COMPLETED' && record.response) {
      return res.json({
        ...record.job,
        data: record.response
      });
    }

    res.json(record.job);
  });

  // Single Organization Details
  app.get('/api/v1/organizations/:id', (req, res) => {
    const item = getOrganizationById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.json(item);
  });

  // Single Hospital Details
  app.get('/api/v1/hospitals/:id', (req, res) => {
    const item = getOrganizationById(req.params.id);
    if (!item || item.type !== 'hospital') {
      return res.status(404).json({ error: 'Hospital record not found' });
    }
    res.json(item);
  });

  // Sources for Organization
  app.get('/api/v1/organizations/:id/sources', (req, res) => {
    const item = getOrganizationById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.json({
      id: item.id,
      name: item.name,
      primary_source: item.source_name,
      primary_source_url: item.source_url,
      verification_sources: item.verification_sources,
      breakdown: item.verification_breakdown
    });
  });

  // Export Results
  app.post('/api/v1/export', (req, res) => {
    try {
      const { items, format = 'csv', filename = 'discovered_organizations' } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'No items provided for export' });
      }

      if (format === 'csv') {
        const csv = exportToCSV(items);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        return res.send(csv);
      } else if (format === 'excel' || format === 'xlsx') {
        const xml = exportToExcelXML(items);
        res.setHeader('Content-Type', 'application/vnd.ms-excel');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.xls"`);
        return res.send(xml);
      } else if (format === 'json') {
        const json = exportToJSON(items);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        return res.send(json);
      }

      res.status(400).json({ error: 'Unsupported format. Choose csv, excel, or json.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Export failed' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GeoDiscover] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
