import React from 'react';
import {
  Building2,
  Cross,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Phone,
  Globe,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { HospitalRecord, OrganizationItem } from '../types.js';

interface OrganizationCardProps {
  item: OrganizationItem;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({
  item,
  isSelected,
  onSelect,
  onViewDetails
}) => {
  const isHospital = item.type === 'hospital';
  const hosp = isHospital ? (item as HospitalRecord) : null;

  const isVerified = item.verification_status === 'VERIFIED';
  const isLikely = item.verification_status === 'LIKELY_VERIFIED';

  const statusBg = isVerified
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
    : isLikely
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : 'bg-slate-100 text-slate-700 border-slate-300';

  const StatusIcon = isVerified ? CheckCircle2 : isLikely ? AlertTriangle : HelpCircle;

  return (
    <div
      id={`org-card-${item.id}`}
      onClick={onSelect}
      className={`bg-white border rounded-xl p-4 transition-all duration-150 cursor-pointer text-left relative group ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-100 shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* Header: Type Badge & Verification Score */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
              isHospital
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >
            {isHospital ? <Cross className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
            {isHospital ? hosp?.hospital_type || 'Hospital' : (item as any).business_type || 'Company'}
          </span>

          <span className="text-[11px] text-slate-400">&bull;</span>
          <span className="text-xs text-slate-500 font-medium">{item.category}</span>
        </div>

        {/* Verification Status Pill */}
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${statusBg}`}>
          <StatusIcon className="w-3 h-3" />
          <span>
            {isVerified ? 'VERIFIED' : isLikely ? 'LIKELY VERIFIED' : 'UNVERIFIED'} ({item.verification_score}%)
          </span>
        </div>
      </div>

      {/* Organization Name */}
      <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition">
        {item.name}
      </h3>

      {/* Hospital Specialities Tag Cloud */}
      {isHospital && hosp?.specialities && hosp.specialities.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {hosp.specialities.slice(0, 3).map((spec) => (
            <span
              key={spec}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
            >
              {spec}
            </span>
          ))}
          {hosp.specialities.length > 3 && (
            <span className="text-[10px] text-slate-400 self-center">
              +{hosp.specialities.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Description Snippet */}
      {item.description && (
        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      )}

      {/* Address & Distance */}
      <div className="flex items-start gap-1.5 text-xs text-slate-600 mt-3">
        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
        <span className="line-clamp-1">{item.address}</span>
        <span className="text-blue-600 font-semibold shrink-0 ml-auto text-[11px]">
          {item.distance_km} km away
        </span>
      </div>

      {/* Contact Row: Phone & Website */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          {/* Phone */}
          {item.normalized_phone !== 'Not available' ? (
            <a
              href={`tel:${item.normalized_phone.replace(/\s+/g, '')}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-600 font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{item.normalized_phone}</span>
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 text-slate-400 italic text-[11px]">
              <Phone className="w-3.5 h-3.5 text-slate-300" />
              Phone not available
            </span>
          )}

          {/* Hospital Emergency Phone */}
          {isHospital && hosp?.emergency_phone && hosp.emergency_phone !== 'Not available' && (
            <span className="inline-flex items-center gap-1 text-red-600 text-[11px] font-semibold">
              <ShieldAlert className="w-3 h-3 text-red-500" />
              ER: {hosp.emergency_phone}
            </span>
          )}
        </div>

        {/* Website Link */}
        {item.website && item.website !== 'Not available' ? (
          <a
            href={item.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="truncate max-w-[120px]">
              {item.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
            </span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-slate-400 italic text-[11px]">Website unlisted</span>
        )}
      </div>

      {/* Bottom Source & Action Bar */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <span>Sources:</span>
          <span className="font-medium text-slate-700 truncate max-w-[140px]">
            {item.source_name}
          </span>
          {item.verification_sources.length > 1 && (
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
              +{item.verification_sources.length - 1}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition"
        >
          <span>View Details & Evidence</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
