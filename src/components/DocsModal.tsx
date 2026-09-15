import React, { useState } from 'react';
import { X, Code2, Layers, ShieldCheck, Terminal, Cpu, Database } from 'lucide-react';

interface DocsModalProps {
  onClose: () => void;
}

export const DocsModal: React.FC<DocsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'api' | 'docker' | 'verification'>('pipeline');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">GeoDiscover &bull; Architecture & API Documentation</h3>
              <p className="text-xs text-slate-500">Pipeline Flow, Real Data Sources, REST Endpoints & Verification Rules</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'pipeline'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Scraping & Discovery Pipeline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('verification')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'verification'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Multi-Signal Verification
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'api'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            REST API Endpoints
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('docker')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'docker'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            FastAPI / PostgreSQL Architecture
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 text-xs text-slate-700 leading-relaxed space-y-4">
          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] leading-relaxed">
                <pre>{`USER SEARCH (Area / PIN / Locality)
       ↓
LOCATION RESOLUTION (Nominatim OpenStreetMap Geocoder)
       ↓
LATITUDE / LONGITUDE & BOUNDING BOX
       ↓
SOURCE DISCOVERY (OSM Overpass API + Public Registries)
       ↓
DATA EXTRACTION & NORMALIZATION (Phone, Address, Healthcare Tags)
       ↓
CROSS-SOURCE DEDUPLICATION (Levenshtein + Haversine < 150m + Domain/Phone)
       ↓
PHONE NUMBER VALIDATION (E.164 & Indian National STD / Mobile / Emergency)
       ↓
MULTI-SIGNAL VERIFICATION SCORING (6 Distinct Audit Checks)
       ↓
CONFIDENCE CALCULATION (VERIFIED, LIKELY VERIFIED, UNVERIFIED)
       ↓
STRUCTURED STORAGE & CLIENT CONSUMPTION (Interactive Map + Export)`}</pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">100% Non-Hallucinated Data</h4>
                  <p className="text-slate-600">
                    No LLM generation is used for company names, phone numbers, or healthcare facts. All records originate
                    directly from real-world OpenStreetMap nodes/ways and official enterprise registries.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">Strict Radius Geofencing</h4>
                  <p className="text-slate-600">
                    Entities are matched using geodesic Haversine mathematics. Only businesses physically situated within
                    the 1km - 25km radius are admitted to prevent out-of-boundary noise.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                <span className="font-bold">Scoring Thresholds:</span>
                <div className="mt-1 flex gap-4 text-xs font-semibold">
                  <span className="text-emerald-700">&bull; 90 - 100: VERIFIED</span>
                  <span className="text-amber-700">&bull; 70 - 89: LIKELY_VERIFIED</span>
                  <span className="text-slate-600">&bull; &lt; 70: UNVERIFIED</span>
                </div>
              </div>

              <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-2.5">Verification Signal</th>
                    <th className="p-2.5">Points</th>
                    <th className="p-2.5">Evidence Validation Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-medium">Maps / Places Match</td>
                    <td className="p-2.5 font-mono text-blue-600 font-bold">+25 pts</td>
                    <td className="p-2.5 text-slate-600">Entity registered with verified polygon/node coordinates.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Official Website Found</td>
                    <td className="p-2.5 font-mono text-blue-600 font-bold">+20 pts</td>
                    <td className="p-2.5 text-slate-600">Valid HTTP domain registered for organization.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Address Locality Match</td>
                    <td className="p-2.5 font-mono text-blue-600 font-bold">+20 pts</td>
                    <td className="p-2.5 text-slate-600">Physical address text correlates with target postal area.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Verified Phone Contact</td>
                    <td className="p-2.5 font-mono text-blue-600 font-bold">+15 pts</td>
                    <td className="p-2.5 text-slate-600">National telecommunications numbering plan match.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Independent Cross-Reference</td>
                    <td className="p-2.5 font-mono text-blue-600 font-bold">+10 pts</td>
                    <td className="p-2.5 text-slate-600">Confirmed across second external directory or Google Places link.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Registry Match</td>
                    <td className="p-2.5 font-mono text-blue-600 font-bold">+10 pts</td>
                    <td className="p-2.5 text-slate-600">State medical council, NABH, or corporate ROC registration.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-3 font-mono text-[11px]">
              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl space-y-2">
                <div className="text-emerald-400 font-bold"># POST /api/v1/search</div>
                <pre>{`curl -X POST http://localhost:3000/api/v1/search \\
  -H "Content-Type: application/json" \\
  -d '{
    "location": "Madhapur, Hyderabad",
    "organization_type": "all",
    "radius_km": 5,
    "page": 1,
    "page_size": 50
  }'`}</pre>
              </div>

              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl space-y-2">
                <div className="text-emerald-400 font-bold"># GET /api/v1/search/:jobId (Async Polling)</div>
                <pre>{`curl http://localhost:3000/api/v1/search/job_abc123`}</pre>
              </div>

              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl space-y-2">
                <div className="text-emerald-400 font-bold"># POST /api/v1/export (CSV / Excel / JSON)</div>
                <pre>{`curl -X POST http://localhost:3000/api/v1/export \\
  -H "Content-Type: application/json" \\
  -d '{"items": [...], "format": "csv"}'`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'docker' && (
            <div className="space-y-3">
              <p className="text-slate-600">
                The application also provides full Python FastAPI, PostgreSQL with PostGIS extension, and Redis Celery
                worker files in the workspace (<code>docker-compose.yml</code>, <code>backend/app/main.py</code>, etc.).
              </p>
              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px]">
                <pre>{`# Run full stack container cluster:
docker compose up --build

Services:
- frontend: React + Vite on port 3000
- backend: FastAPI (Python 3.11) on port 8000
- postgres: PostgreSQL 15 + PostGIS 3.3
- redis: Redis 7 for cache & job broker
- worker: Celery distributed scraping queue`}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium text-xs"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
