import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { GeoLocationResolution, OrganizationItem } from '../types.js';

interface MapViewProps {
  location: GeoLocationResolution | null;
  radiusKm: number;
  items: OrganizationItem[];
  selectedItem: OrganizationItem | null;
  onSelectItem: (item: OrganizationItem) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  location,
  radiusKm,
  items,
  selectedItem,
  onSelectItem
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = location?.latitude || 17.4483;
    const initialLon = location?.longitude || 78.3915;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 13,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap Carto tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center, radius circle, and markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !location) return;

    const centerLat = location.latitude;
    const centerLon = location.longitude;

    map.setView([centerLat, centerLon], radiusKm <= 2 ? 14 : radiusKm <= 5 ? 13 : radiusKm <= 10 ? 12 : 11);

    // Draw radius boundary circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
    }

    const circle = L.circle([centerLat, centerLon], {
      radius: radiusKm * 1000,
      color: '#2563eb',
      fillColor: '#3b82f6',
      fillOpacity: 0.08,
      weight: 2,
      dashArray: '5, 5'
    }).addTo(map);

    radiusCircleRef.current = circle;

    // Clear old markers
    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
    }

    // Add search center pin
    const centerIcon = L.divIcon({
      className: 'custom-center-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-60"></span>
          <div class="relative w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white font-bold text-xs">
            📍
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([centerLat, centerLon], { icon: centerIcon })
      .bindTooltip(`<b>Search Center</b><br/>${location.name}`, { direction: 'top' })
      .addTo(markersGroupRef.current!);

    // Add markers for each organization
    items.forEach((item) => {
      const isHosp = item.type === 'hospital';
      const isSelected = selectedItem?.id === item.id;
      const isVerified = item.verification_status === 'VERIFIED';
      const isLikely = item.verification_status === 'LIKELY_VERIFIED';

      const statusColor = isVerified ? '#16a34a' : isLikely ? '#d97706' : '#64748b';
      const bgColor = isHosp ? '#dc2626' : '#2563eb';
      const iconSymbol = isHosp ? '🏥' : '🏢';

      const customIcon = L.divIcon({
        className: 'custom-org-marker',
        html: `
          <div class="transition-transform duration-200 cursor-pointer ${
            isSelected ? 'scale-125 z-50' : 'hover:scale-110'
          }">
            <div style="background-color: ${bgColor}; border-color: ${statusColor};" 
                 class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md border-2 text-xs relative">
              <span>${iconSymbol}</span>
              <span style="background-color: ${statusColor};" class="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white"></span>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([item.latitude, item.longitude], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-slate-900 min-w-[180px]';
      popupContent.innerHTML = `
        <div class="font-semibold text-sm line-clamp-1">${item.name}</div>
        <div class="text-xs text-slate-500 mb-1 flex items-center gap-1">
          <span>${isHosp ? 'Hospital' : 'Company'}</span> &bull; 
          <span class="font-medium" style="color: ${statusColor}">${item.verification_status.replace('_', ' ')} (${item.verification_score}%)</span>
        </div>
        <div class="text-xs text-slate-600 mb-1">📍 ${item.address}</div>
        <div class="text-xs text-slate-600 mb-2">☎ ${item.normalized_phone || item.phone}</div>
        <button id="btn-view-${item.id}" class="w-full text-xs py-1 px-2 rounded bg-slate-900 text-white font-medium hover:bg-slate-800 transition">
          View Full Details
        </button>
      `;

      popupContent.querySelector(`#btn-view-${item.id}`)?.addEventListener('click', () => {
        onSelectItem(item);
      });

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        onSelectItem(item);
      });

      markersGroupRef.current?.addLayer(marker);
    });
  }, [location, radiusKm, items, selectedItem, onSelectItem]);

  // Center on selected item when clicked from list
  useEffect(() => {
    if (selectedItem && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedItem.latitude, selectedItem.longitude], 15, {
        duration: 0.8
      });
    }
  }, [selectedItem]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" id="interactive-area-map" />

      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-2.5 shadow-sm text-xs space-y-1.5 pointer-events-auto">
        <div className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider mb-1">Map Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
          <span className="text-slate-600">Company / Enterprise</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span>
          <span className="text-slate-600">Hospital / Healthcare</span>
        </div>
        <div className="h-px bg-slate-200 my-1"></div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
          <span className="text-slate-600">Verified (90-100%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span className="text-slate-600">Likely Verified (70-89%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block"></span>
          <span className="text-slate-600">Unverified (&lt;70%)</span>
        </div>
      </div>
    </div>
  );
};
