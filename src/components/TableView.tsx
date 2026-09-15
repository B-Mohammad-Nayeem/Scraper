import React from 'react';
import { Building2, Cross, CheckCircle2, AlertTriangle, HelpCircle, ExternalLink } from 'lucide-react';
import { HospitalRecord, OrganizationItem } from '../types.js';

interface TableViewProps {
  items: OrganizationItem[];
  selectedItem: OrganizationItem | null;
  onSelectItem: (item: OrganizationItem) => void;
  onViewDetails: (item: OrganizationItem) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  items,
  selectedItem,
  onSelectItem,
  onViewDetails
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
        No organizations matched the selected filters.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3">Organization Name</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Category / Classification</th>
              <th className="py-3 px-3">Verification</th>
              <th className="py-3 px-3">Phone</th>
              <th className="py-3 px-3">Locality / Area</th>
              <th className="py-3 px-3">Distance</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const isHosp = item.type === 'hospital';
              const hosp = isHosp ? (item as HospitalRecord) : null;
              const isSelected = selectedItem?.id === item.id;
              const isVer = item.verification_status === 'VERIFIED';
              const isLikely = item.verification_status === 'LIKELY_VERIFIED';

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className={`cursor-pointer transition hover:bg-slate-50 ${
                    isSelected ? 'bg-blue-50/60 font-medium' : ''
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900 max-w-xs truncate">{item.name}</div>
                    {item.website && item.website !== 'Not available' && (
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 truncate max-w-[180px]"
                      >
                        <span className="truncate">{item.website.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    )}
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        isHosp ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {isHosp ? <Cross className="w-2.5 h-2.5" /> : <Building2 className="w-2.5 h-2.5" />}
                      {isHosp ? 'Hospital' : 'Company'}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 max-w-[180px] truncate text-slate-600">
                    <div className="truncate font-medium">
                      {isHosp ? hosp?.hospital_type : (item as any).business_type}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{item.category}</div>
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        isVer
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isLikely
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      {isVer ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : isLikely ? (
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      ) : (
                        <HelpCircle className="w-3 h-3 text-slate-400" />
                      )}
                      <span>{item.verification_score}%</span>
                    </span>
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 font-mono text-[11px]">
                    {item.normalized_phone !== 'Not available' ? (
                      item.normalized_phone
                    ) : (
                      <span className="text-slate-400 italic">Not available</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 max-w-[140px] truncate text-slate-600">
                    {item.area || item.city}
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap font-medium text-blue-600">
                    {item.distance_km} km
                  </td>

                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(item);
                      }}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition"
                    >
                      Audit Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
