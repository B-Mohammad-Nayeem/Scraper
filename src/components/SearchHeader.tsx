import React, { useState } from 'react';
import { Search, MapPin, Building2, Cross, Layers, Sparkles, Loader2, Navigation } from 'lucide-react';
import { OrganizationTypeFilter, SearchJobStatus } from '../types.js';

interface SearchHeaderProps {
  location: string;
  setLocation: (loc: string) => void;
  orgType: OrganizationTypeFilter;
  setOrgType: (type: OrganizationTypeFilter) => void;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  keyword: string;
  setKeyword: (kw: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  jobStatus: SearchJobStatus | null;
}

const PRESET_LOCATIONS = [
  'Madhapur, Hyderabad',
  'Gachibowli, Hyderabad',
  'Kukatpally, Hyderabad',
  'Whitefield, Bangalore',
  'Koramangala, Bangalore',
  'BKC, Mumbai',
  '500032'
];

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  location,
  setLocation,
  orgType,
  setOrgType,
  radiusKm,
  setRadiusKm,
  keyword,
  setKeyword,
  onSearch,
  isSearching,
  jobStatus
}) => {
  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Reverse geocode preview
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const place = data.address?.suburb || data.address?.city || data.display_name.split(',')[0];
            setLocation(place ? `${place}, ${data.address?.city || ''}` : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          } else {
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch {
          setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setDetectingLocation(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;
    onSearch();
  };

  return (
    <div className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            {/* Location Input */}
            <div className="lg:col-span-4 space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Location / Area / PIN Code
                </span>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={detectingLocation}
                  className="text-[11px] text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  {detectingLocation ? 'Locating...' : 'My Location'}
                </button>
              </label>
              <div className="relative">
                <input
                  id="input-search-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Madhapur, Hyderabad or 500032"
                  required
                  className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Organization Type Selector */}
            <div className="lg:col-span-3 space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                Organization Type
              </label>
              <div className="grid grid-cols-3 gap-1 bg-white p-1 border border-slate-300 rounded-lg h-10">
                <button
                  type="button"
                  id="btn-type-all"
                  onClick={() => setOrgType('all')}
                  className={`text-xs font-medium rounded-md transition flex items-center justify-center gap-1 ${
                    orgType === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  id="btn-type-companies"
                  onClick={() => setOrgType('companies')}
                  className={`text-xs font-medium rounded-md transition flex items-center justify-center gap-1 ${
                    orgType === 'companies' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-3 h-3" />
                  Companies
                </button>
                <button
                  type="button"
                  id="btn-type-hospitals"
                  onClick={() => setOrgType('hospitals')}
                  className={`text-xs font-medium rounded-md transition flex items-center justify-center gap-1 ${
                    orgType === 'hospitals' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Cross className="w-3 h-3" />
                  Hospitals
                </button>
              </div>
            </div>

            {/* Radius Selector */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Search Radius</label>
              <select
                id="select-search-radius"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={1}>1 km (Immediate)</option>
                <option value={2}>2 km (Walking/Local)</option>
                <option value={5}>5 km (Locality Hub)</option>
                <option value={10}>10 km (Suburban)</option>
                <option value={25}>25 km (Metropolitan)</option>
              </select>
            </div>

            {/* Keyword / Category Filter */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Keyword / Category</label>
              <input
                id="input-search-keyword"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. IT, Cardiology"
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="lg:col-span-1">
              <button
                type="submit"
                id="btn-submit-search"
                disabled={isSearching}
                className="w-full h-10 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span className="lg:hidden">Search</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Location Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-500 font-medium whitespace-nowrap flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick Presets:
          </span>
          {PRESET_LOCATIONS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setLocation(preset);
                setTimeout(onSearch, 50);
              }}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition whitespace-nowrap"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Pipeline Execution Banner (when searching or polling background job) */}
        {isSearching && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-blue-900 animate-fadeIn">
            <div className="flex items-center justify-between mb-1.5 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>
                  {jobStatus?.status === 'RESOLVING_LOCATION'
                    ? 'Step 1/4: Resolving Geographic Coordinates...'
                    : jobStatus?.status === 'DISCOVERING'
                    ? 'Step 2/4: Querying OpenStreetMap Overpass & Verified Repositories...'
                    : jobStatus?.status === 'VERIFYING'
                    ? 'Step 3/4: Calculating Multi-Signal Verification Confidence...'
                    : 'Discovering organizations in requested area...'}
                </span>
              </div>
              <span className="text-blue-700">{jobStatus?.progress || 45}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${jobStatus?.progress || 45}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-blue-700 mt-1.5">
              {jobStatus?.message || 'Filtering verified physical entities within specified geographic boundary radius...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
