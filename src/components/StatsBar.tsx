import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, MapPin, Building2, Cross } from 'lucide-react';
import { GeoLocationResolution, VerificationStatus } from '../types.js';

interface StatsBarProps {
  location: GeoLocationResolution | null;
  total: number;
  companiesCount: number;
  hospitalsCount: number;
  verifiedCount: number;
  likelyVerifiedCount: number;
  unverifiedCount: number;
  activeStatusFilter: 'all' | VerificationStatus;
  onSelectStatusFilter: (status: 'all' | VerificationStatus) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  location,
  total,
  companiesCount,
  hospitalsCount,
  verifiedCount,
  likelyVerifiedCount,
  unverifiedCount,
  activeStatusFilter,
  onSelectStatusFilter
}) => {
  if (!location) return null;

  return (
    <div className="bg-slate-50 border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Location resolved indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold text-slate-800">Target Area:</span>
            <span className="truncate max-w-xl text-slate-700 font-medium">{location.formatted_address}</span>
          </div>
          <div className="text-slate-500 font-mono text-[11px] shrink-0">
            Coordinates: {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {/* Total */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            <div className="text-xs text-slate-500 font-medium">Total Found</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{total}</div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>{companiesCount} Co.</span> &bull; <span>{hospitalsCount} Hosp.</span>
            </div>
          </div>

          {/* Companies */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            <div className="text-xs text-blue-700 font-medium flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              Companies
            </div>
            <div className="text-xl font-bold text-blue-900 mt-0.5">{companiesCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Enterprises & Offices</div>
          </div>

          {/* Hospitals */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            <div className="text-xs text-red-700 font-medium flex items-center gap-1">
              <Cross className="w-3.5 h-3.5" />
              Hospitals
            </div>
            <div className="text-xl font-bold text-red-900 mt-0.5">{hospitalsCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Healthcare Facilities</div>
          </div>

          {/* Verified */}
          <button
            type="button"
            onClick={() => onSelectStatusFilter(activeStatusFilter === 'VERIFIED' ? 'all' : 'VERIFIED')}
            className={`p-3 rounded-xl border text-left transition ${
              activeStatusFilter === 'VERIFIED'
                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200'
                : 'bg-white border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified (90-100)
            </div>
            <div className="text-xl font-bold text-emerald-900 mt-0.5">{verifiedCount}</div>
            <div className="text-[11px] text-emerald-700 mt-0.5">Multi-source confirmed</div>
          </button>

          {/* Likely Verified */}
          <button
            type="button"
            onClick={() => onSelectStatusFilter(activeStatusFilter === 'LIKELY_VERIFIED' ? 'all' : 'LIKELY_VERIFIED')}
            className={`p-3 rounded-xl border text-left transition ${
              activeStatusFilter === 'LIKELY_VERIFIED'
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200'
                : 'bg-white border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="text-xs text-amber-700 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Likely Verified (70-89)
            </div>
            <div className="text-xl font-bold text-amber-900 mt-0.5">{likelyVerifiedCount}</div>
            <div className="text-[11px] text-amber-700 mt-0.5">High confidence</div>
          </button>

          {/* Unverified */}
          <button
            type="button"
            onClick={() => onSelectStatusFilter(activeStatusFilter === 'UNVERIFIED' ? 'all' : 'UNVERIFIED')}
            className={`p-3 rounded-xl border text-left transition ${
              activeStatusFilter === 'UNVERIFIED'
                ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-200'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-xs text-slate-600 font-medium flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              Unverified (&lt;70)
            </div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{unverifiedCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Single source</div>
          </button>
        </div>
      </div>
    </div>
  );
};
