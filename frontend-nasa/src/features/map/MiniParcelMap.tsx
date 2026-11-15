import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Maximize2, ShieldCheck } from 'lucide-react';
import type { FieldProfile } from '../../types/domain';
import type { Language } from '../../types/landing';
import { SATELLITE_BASEMAP_STYLE } from './mapUtils';

interface MiniParcelMapProps {
  field: FieldProfile;
  onOpenFullMap?: () => void;
  currentLang?: Language;
}

export const MiniParcelMap: React.FC<MiniParcelMapProps> = ({
  field,
  onOpenFullMap,
  currentLang = 'id',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const isId = currentLang === 'id';

  const [lat, lng] = field.coordinates;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: SATELLITE_BASEMAP_STYLE,
        center: [lng, lat],
        zoom: 15.2,
        pitch: 35,
        bearing: -10,
        interactive: true,
        attributionControl: false,
      });

      // Add navigation controls (zoom only, compact)
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

      map.on('load', () => {
        // Compute ~400m polygon box around field center
        const deltaLng = 0.0035;
        const deltaLat = 0.0025;

        const parcelGeoJSON: GeoJSON.Feature<GeoJSON.Polygon> = {
          type: 'Feature',
          properties: {
            id: field.id,
            name: field.name,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [lng - deltaLng, lat - deltaLat],
                [lng + deltaLng, lat - deltaLat],
                [lng + deltaLng, lat + deltaLat],
                [lng - deltaLng, lat + deltaLat],
                [lng - deltaLng, lat - deltaLat],
              ],
            ],
          },
        };

        map.addSource('parcel-boundary', {
          type: 'geojson',
          data: parcelGeoJSON,
        });

        // Fill layer
        map.addLayer({
          id: 'parcel-fill',
          type: 'fill',
          source: 'parcel-boundary',
          paint: {
            'fill-color': '#237F8E',
            'fill-opacity': 0.28,
          },
        });

        // Glowing boundary line
        map.addLayer({
          id: 'parcel-outline',
          type: 'line',
          source: 'parcel-boundary',
          paint: {
            'line-color': '#38bdf8',
            'line-width': 2.5,
            'line-dasharray': [2, 1],
          },
        });

        // Outer glow
        map.addLayer({
          id: 'parcel-glow',
          type: 'line',
          source: 'parcel-boundary',
          paint: {
            'line-color': '#237F8E',
            'line-width': 6,
            'line-opacity': 0.45,
          },
        });

        // Center Pin Marker
        const el = document.createElement('div');
        el.className = 'flex items-center justify-center';
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-[#237F8E] opacity-75"></span>
            <div class="relative flex h-7 w-7 items-center justify-center rounded-full bg-[#237F8E] text-white shadow-md border-2 border-white text-[11px] font-bold">
              🌾
            </div>
          </div>
        `;

        markerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map);
      });

      mapRef.current = map;
    } catch (err) {
      console.warn('MapLibre WebGL initialization notice:', err);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [field.id, field.name, lat, lng]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#E6EBF0] bg-[#0c1f24] shadow-xs group">
      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className="h-72 sm:h-80 w-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Left Spatial Inset Badge */}
      <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2 rounded-xl bg-white/95 backdrop-blur-md px-3 py-1.5 shadow-sm border border-[#E6EBF0]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#237F8E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#237F8E]"></span>
          </span>
          <span className="text-[11px] font-bold text-[#14232B] tracking-tight">
            {isId ? 'Preview Satelit Petak Lahan' : 'Satellite Parcel Inset'}
          </span>
          <span className="rounded-md bg-[#E3F1F3] px-1.5 py-0.5 text-[9px] font-extrabold text-[#1B6572] uppercase font-mono">
            ESRI 30m
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-lg bg-black/75 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono text-white border border-white/10 shadow-xs tabular-nums">
            GPS: {lat.toFixed(4)}°, {lng.toFixed(4)}°
          </span>
          <span className="rounded-lg bg-black/75 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono text-cyan-300 border border-white/10 shadow-xs tabular-nums">
            Elevasi: {field.elevationMeters} mdpl
          </span>
          <span className="rounded-lg bg-black/75 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono text-emerald-300 border border-white/10 shadow-xs tabular-nums">
            Lereng: {field.soil.slope}%
          </span>
        </div>
      </div>

      {/* Top Right Quick Full Map Button */}
      {onOpenFullMap && (
        <div className="absolute top-3.5 right-3.5 z-10">
          <button
            type="button"
            onClick={onOpenFullMap}
            className="flex items-center gap-1.5 rounded-xl bg-white/95 hover:bg-white text-[#14232B] hover:text-[#237F8E] px-3 py-1.5 text-xs font-bold shadow-md border border-[#E6EBF0] transition active:scale-95 cursor-pointer backdrop-blur-md"
            title={isId ? 'Buka di Peta 3D Penuh' : 'Open in Full 3D Map'}
          >
            <Maximize2 className="h-3.5 w-3.5 text-[#237F8E]" />
            <span className="hidden sm:inline">
              {isId ? 'Peta 3D Penuh' : 'Full 3D Map'}
            </span>
          </button>
        </div>
      )}

      {/* Bottom Info Ribbon */}
      <div className="absolute bottom-3 left-3 right-16 z-10 pointer-events-none">
        <div className="rounded-xl bg-white/95 backdrop-blur-md px-3 py-1.5 border border-[#E6EBF0] shadow-xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-3.5 w-3.5 text-[#237F8E] shrink-0" />
            <span className="font-semibold text-[#14232B] truncate text-[11px]">
              Desa {field.village}, Kec. {field.district} &middot;{' '}
              <span className="text-[#5F6B74] font-normal">{field.soil.type}</span>
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-[#1E5B4F] shrink-0 ml-2">
            <ShieldCheck className="h-3 w-3" />
            Batas Poligon Terverifikasi
          </span>
        </div>
      </div>
    </div>
  );
};
