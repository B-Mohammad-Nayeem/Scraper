import React from 'react';
import { Compass, ShieldCheck, SlidersHorizontal, BookOpen, Database } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings, onOpenDocs }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <Compass className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">GeoDiscover</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Only
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Area-Based Company & Hospital Discovery Engine &bull; Non-Hallucinated Live Data
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              id="btn-verification-weights"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              title="Configure Verification Scoring Weights"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Scoring Weights</span>
            </button>

            <button
              id="btn-api-architecture-docs"
              onClick={onOpenDocs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              title="View Architecture, Backend & API Specs"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Architecture & API Docs</span>
            </button>

            <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-slate-200 text-xs text-slate-500">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>OSM Overpass + Nominatim</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
