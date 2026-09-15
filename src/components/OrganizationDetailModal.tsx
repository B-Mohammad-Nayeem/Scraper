import React from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Building2,
  Cross,
  Phone,
  Mail,
  Globe,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Share2
} from 'lucide-react';
import { HospitalRecord, OrganizationItem } from '../types.js';

interface OrganizationDetailModalProps {
  item: OrganizationItem | null;
  onClose: () => void;
}

export const OrganizationDetailModal: React.FC<OrganizationDetailModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const isHospital = item.type === 'hospital';
  const hosp = isHospital ? (item as HospitalRecord) : null;

  const isVerified = item.verification_status === 'VERIFIED';
  const isLikely = item.verification_status === 'LIKELY_VERIFIED';

  const statusBg = isVerified
    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
    : isLikely
    ? 'bg-amber-50 text-amber-800 border-amber-300'
    : 'bg-slate-100 text-slate-700 border-slate-300';

  const StatusIcon = isVerified ? CheckCircle2 : isLikely ? AlertTriangle : HelpCircle;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span
              className={`p-2 rounded-xl ${
                isHospital ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
              }`}
            >
              {isHospital ? <Cross className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {isHospital ? 'Healthcare Facility Profile' : 'Corporate Enterprise Profile'}
              </div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{item.name}</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Top Verification Confidence Banner */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${statusBg}`}>
            <div className="flex items-center gap-3">
              <StatusIcon className="w-7 h-7 shrink-0" />
              <div>
                <div className="text-xs uppercase font-bold tracking-wider">
                  Verification Status: {item.verification_status.replace('_', ' ')}
                </div>
                <div className="text-sm font-medium mt-0.5">
                  Verification Confidence Score: <span className="font-bold text-base">{item.verification_score}%</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Validated against multiple independent geographic registers, telecom records, and official domain indices.
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right sm:border-l sm:border-slate-300 sm:pl-4">
              <div className="text-[11px] uppercase font-semibold text-slate-500">Last Verified</div>
              <div className="text-xs font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {item.last_verified || 'Current'}
              </div>
            </div>
          </div>

          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500">Entity Classification</div>
                <div className="text-sm font-semibold text-slate-800 mt-0.5">
                  {isHospital ? hosp?.hospital_type : (item as any).business_type}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500">Industry / Domain Category</div>
                <div className="text-sm font-semibold text-slate-800 mt-0.5">{item.category}</div>
              </div>
            </div>

            {item.description && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <div className="text-[11px] font-semibold text-slate-500 mb-1">Overview Description</div>
                {item.description}
              </div>
            )}

            {/* Specialities if Hospital */}
            {isHospital && hosp?.specialities && hosp.specialities.length > 0 && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="text-xs font-semibold text-slate-600">Clinical Specialities & Services:</div>
                <div className="flex flex-wrap gap-1.5">
                  {hosp.specialities.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Contact Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Primary Phone */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <Phone className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span>Primary Contact</span>
                    {item.phone_type && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-medium">
                        {item.phone_type}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 mt-0.5">
                    {item.normalized_phone !== 'Not available' ? (
                      <a href={`tel:${item.normalized_phone.replace(/\s+/g, '')}`} className="text-blue-600 hover:underline">
                        {item.normalized_phone}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Not available</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Hospital Emergency Phone */}
              {isHospital && (
                <div className="p-3 bg-red-50/70 rounded-xl border border-red-200 flex items-start gap-3">
                  <Phone className="w-4 h-4 text-red-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-red-600 font-semibold">24/7 Emergency Casualty Phone</div>
                    <div className="text-sm font-bold text-red-900 mt-0.5">
                      {hosp?.emergency_phone && hosp.emergency_phone !== 'Not available' ? (
                        <a href={`tel:${hosp.emergency_phone.replace(/\s+/g, '')}`} className="hover:underline">
                          {hosp.emergency_phone}
                        </a>
                      ) : (
                        <span className="text-red-400 italic">Not available</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-500 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500">Official Email</div>
                  <div className="text-sm font-semibold text-slate-900 mt-0.5">
                    {item.email && item.email !== 'Not available' ? (
                      <a href={`mailto:${item.email}`} className="text-blue-600 hover:underline">
                        {item.email}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Not available</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Official Website */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <Globe className="w-4 h-4 text-slate-500 mt-0.5" />
                <div className="overflow-hidden">
                  <div className="text-xs text-slate-500">Official Website</div>
                  <div className="text-sm font-semibold text-slate-900 mt-0.5 truncate">
                    {item.website && item.website !== 'Not available' ? (
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1 truncate max-w-full"
                      >
                        <span className="truncate">{item.website}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Not available</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Geographic Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Physical Location & Map</h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-800 font-medium leading-relaxed">{item.address}</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400">Area:</span> <span className="font-semibold text-slate-700">{item.area}</span>
                </div>
                <div>
                  <span className="text-slate-400">City:</span> <span className="font-semibold text-slate-700">{item.city}</span>
                </div>
                <div>
                  <span className="text-slate-400">PIN Code:</span>{' '}
                  <span className="font-semibold text-slate-700">{item.postal_code || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Distance:</span>{' '}
                  <span className="font-semibold text-blue-600">{item.distance_km} km</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">
                  Lat: {item.latitude.toFixed(5)}, Lon: {item.longitude.toFixed(5)}
                </span>
                <a
                  href={item.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Section 4: Multi-Signal Verification Audit Matrix */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              4. Verification Score Breakdown ({item.verification_score} / 100)
            </h4>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs">
              {item.verification_breakdown?.map((sig) => (
                <div key={sig.key} className="p-3 flex items-start justify-between gap-3 hover:bg-slate-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          sig.passed ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      ></span>
                      <span className="font-semibold text-slate-800">{sig.signal}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] pl-4">{sig.evidence}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`font-bold font-mono px-2 py-0.5 rounded text-xs ${
                        sig.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      +{sig.points} / {sig.maxPoints} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Sources & Traceability */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              5. Provenance & Verification Sources ({item.verification_sources?.length || 0})
            </h4>
            <div className="space-y-2">
              {item.verification_sources?.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between gap-3 text-xs group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition">
                        {src.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-md">{src.url}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white text-slate-600 text-[10px] font-medium border border-slate-200 shrink-0 flex items-center gap-1">
                    <span>{src.type}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          <div className="text-slate-500">ID: {item.id}</div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
