import React from 'react';
import {
  SlidersHorizontal,
  ArrowUpDown,
  Download,
  Map as MapIcon,
  LayoutList,
  Columns2,
  Table,
  Check,
  FileSpreadsheet,
  FileText,
  FileCode
} from 'lucide-react';
import { OrganizationItem } from '../types.js';

export type ViewLayout = 'split' | 'cards' | 'map' | 'table';

interface FilterBarProps {
  layout: ViewLayout;
  setLayout: (layout: ViewLayout) => void;
  sortBy: 'distance' | 'score' | 'name';
  setSortBy: (sort: 'distance' | 'score' | 'name') => void;
  filterHasWebsite: boolean;
  setFilterHasWebsite: (val: boolean) => void;
  filterHasPhone: boolean;
  setFilterHasPhone: (val: boolean) => void;
  filterHasEmail: boolean;
  setFilterHasEmail: (val: boolean) => void;
  items: OrganizationItem[];
  totalFiltered: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  layout,
  setLayout,
  sortBy,
  setSortBy,
  filterHasWebsite,
  setFilterHasWebsite,
  filterHasPhone,
  setFilterHasPhone,
  filterHasEmail,
  setFilterHasEmail,
  items,
  totalFiltered
}) => {
  const [exportOpen, setExportOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    try {
      setIsExporting(true);
      setExportOpen(false);

      const response = await fetch('/api/v1/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          format,
          filename: `geodiscover_${format}_${new Date().toISOString().split('T')[0]}`
        })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `geodiscover_export.${format === 'excel' ? 'xls' : format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export download error:', err);
      alert('Failed to export file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Quick Checkbox Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Quick Filters:
          </span>

          <button
            type="button"
            onClick={() => setFilterHasPhone(!filterHasPhone)}
            className={`px-2.5 py-1.5 rounded-lg border transition inline-flex items-center gap-1.5 ${
              filterHasPhone
                ? 'bg-blue-50 border-blue-300 text-blue-800 font-medium'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filterHasPhone && <Check className="w-3 h-3 text-blue-600" />}
            Has Phone
          </button>

          <button
            type="button"
            onClick={() => setFilterHasWebsite(!filterHasWebsite)}
            className={`px-2.5 py-1.5 rounded-lg border transition inline-flex items-center gap-1.5 ${
              filterHasWebsite
                ? 'bg-blue-50 border-blue-300 text-blue-800 font-medium'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filterHasWebsite && <Check className="w-3 h-3 text-blue-600" />}
            Has Website
          </button>

          <button
            type="button"
            onClick={() => setFilterHasEmail(!filterHasEmail)}
            className={`px-2.5 py-1.5 rounded-lg border transition inline-flex items-center gap-1.5 ${
              filterHasEmail
                ? 'bg-blue-50 border-blue-300 text-blue-800 font-medium'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filterHasEmail && <Check className="w-3 h-3 text-blue-600" />}
            Has Email
          </button>

          {(filterHasPhone || filterHasWebsite || filterHasEmail) && (
            <button
              type="button"
              onClick={() => {
                setFilterHasPhone(false);
                setFilterHasWebsite(false);
                setFilterHasEmail(false);
              }}
              className="text-slate-400 hover:text-slate-700 underline text-xs ml-1"
            >
              Reset
            </button>
          )}
        </div>

        {/* Right: Sort, Layout View Toggle, and Export */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Sorting */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="select-sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="score">Sort: Verification Score</option>
              <option value="distance">Sort: Distance (Nearest)</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setLayout('split')}
              className={`px-2 py-1 rounded-md transition flex items-center gap-1 ${
                layout === 'split' ? 'bg-white text-slate-900 shadow-xs font-medium' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Split View (Map + List)"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setLayout('cards')}
              className={`px-2 py-1 rounded-md transition flex items-center gap-1 ${
                layout === 'cards' ? 'bg-white text-slate-900 shadow-xs font-medium' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Cards List"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden md:inline">List</span>
            </button>
            <button
              type="button"
              onClick={() => setLayout('table')}
              className={`px-2 py-1 rounded-md transition flex items-center gap-1 ${
                layout === 'table' ? 'bg-white text-slate-900 shadow-xs font-medium' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Dense Data Table"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => setLayout('map')}
              className={`px-2 py-1 rounded-md transition flex items-center gap-1 ${
                layout === 'map' ? 'bg-white text-slate-900 shadow-xs font-medium' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Map Only"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Map</span>
            </button>
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              id="btn-export-dropdown"
              onClick={() => setExportOpen(!exportOpen)}
              disabled={isExporting || items.length === 0}
              className="h-8 px-3 text-xs font-medium bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-lg transition inline-flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export ({totalFiltered})</span>
            </button>

            {exportOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-50 animate-fadeIn text-xs">
                <button
                  type="button"
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700 transition"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-medium">Export as CSV</div>
                    <div className="text-[10px] text-slate-400">Standard spreadsheet</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('excel')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700 transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <div>
                    <div className="font-medium">Export as Excel (XLS)</div>
                    <div className="text-[10px] text-slate-400">Formatted workbook</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('json')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700 transition"
                >
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Export as JSON</div>
                    <div className="text-[10px] text-slate-400">Raw machine structure</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
