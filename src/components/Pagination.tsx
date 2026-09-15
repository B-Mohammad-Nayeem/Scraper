import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange
}) => {
  if (totalItems === 0) return null;

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="bg-white border-t border-slate-200 py-3 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
      <div className="flex items-center gap-2">
        <span>
          Showing <span className="font-semibold text-slate-900">{startIdx}</span> to{' '}
          <span className="font-semibold text-slate-900">{endIdx}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalItems}</span> results
        </span>

        <span className="text-slate-300">|</span>

        <div className="flex items-center gap-1.5">
          <label htmlFor="select-page-size" className="text-slate-500">Per page:</label>
          <select
            id="select-page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-7 px-1.5 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs focus:outline-none"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 font-medium text-slate-800">
          Page {currentPage} of {Math.max(1, totalPages)}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
