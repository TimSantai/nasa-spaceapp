import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, GeoJsonLayer, TextLayer } from '@deck.gl/layers';
import type { PickingInfo, MapViewState, ViewStateChangeParameters } from '@deck.gl/core';
import { Map } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import type { Feature, Geometry, Polygon } from 'geojson';
import type { FieldProfile } from '../../types/domain';
import type { Language } from '../../types/landing';
import { Mountain, Layers, Droplets, Activity } from 'lucide-react';
import { FloatingMapHeader } from './FloatingMapHeader';
import { FloatingSearchBar } from './FloatingSearchBar';
import { PlotDetailSideCard } from './PlotDetailSideCard';
import { MapErrorBoundary } from '../../components/MapErrorBoundary';

interface FieldMapProps {
  fields: FieldProfile[];
  selectedField: FieldProfile;
  onSelectField: (field: FieldProfile) => void;
  onOpenAnalysis?: (field: FieldProfile) => void;
  onOpenGlossary?: () => void;
  onOpenDataSources?: () => void;
  onBackToLanding?: () => void;
  currentLang?: Language;
  onToggleLang?: () => void;
  userCoords?: { latitude: number; longitude: number } | null;
  onRequestLocation?: () => void;
  isLocating?: boolean;
}

export type ThematicLayerMode = 'status' | 'slope' | 'awc';

export interface ParcelProperties {
  id: string;
  name: string;
  village: string;
  soil: string;
  slope: number;
  elevation: number;
  awc: number;
}

export type ParcelFeature = Feature<Polygon, ParcelProperties>;

// 100% Free Open Satellite Basemap (No API key required)
const SATELLITE_BASEMAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'satellite-tiles': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '&copy; Esri, Maxar &middot; NASA Earth Observation',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'satellite-base',
      type: 'raster',
      source: 'satellite-tiles',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

function generateFieldPolygons(fields: FieldProfile[]) {
  return {
    type: 'FeatureCollection' as const,
    features: fields.map((field): ParcelFeature => {
      const [lat, lng] = field.coordinates;
      const delta = 0.008; // ~800m parcel box
      return {
        type: 'Feature',
        id: field.id,
        properties: {
          id: field.id,
          name: field.name,
          village: field.village,
          soil: field.soil.texture,
          slope: field.soil.slope,
          elevation: field.elevationMeters,
          awc: field.soil.awc,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [lng - delta, lat - delta],
              [lng + delta, lat - delta],
              [lng + delta, lat + delta],
              [lng - delta, lat + delta],
              [lng - delta, lat - delta],
            ],
          ],
        },
      };
    }),
  };
}

export function FieldMap({
  fields,
  selectedField,
  onSelectField,
  onOpenAnalysis,
  onOpenGlossary,
  onOpenDataSources,
  onBackToLanding,
  currentLang = 'id',
  onToggleLang,
  userCoords,
  onRequestLocation,
  isLocating,
}: FieldMapProps) {
  // Thematic Layer State (Task 3.2)
  const [thematicLayer, setThematicLayer] = useState<ThematicLayerMode>('status');

  // Perspective Mode (3D vs 2D)
  const [is3D, setIs3D] = useState(true);

  // Floating Side Card open state
  const [isSideCardOpen, setIsSideCardOpen] = useState(true);

  // Quick Filter State ('all' | 'clay_loam' | 'steep' | 'high_awc')
  const [activeFilter, setActiveFilter] = useState('all');

  // Filtered fields based on active quick filter chip
  const filteredFields = useMemo(() => {
    if (activeFilter === 'clay_loam') {
      return fields.filter((f) => f.soil.texture.toLowerCase().includes('clay loam'));
    }
    if (activeFilter === 'steep') {
      return fields.filter((f) => f.soil.slope > 8);
    }
    if (activeFilter === 'high_awc') {
      return fields.filter((f) => f.soil.awc >= 140);
    }
    return fields;
  }, [fields, activeFilter]);

  // ViewState state for smooth cinematic orbit
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: selectedField?.coordinates?.[1] ?? 109.2942,
    latitude: selectedField?.coordinates?.[0] ?? -7.5186,
    zoom: 12.2,
    pitch: 50,
    bearing: 15,
  });

  const isAnimatingRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const prevFieldIdRef = useRef(selectedField.id);
  // Cinematic 360-degree Camera Orbit Animation to any field
  const animateToField = useCallback((field: FieldProfile) => {
    setIsSideCardOpen(true);

    const startLng = viewState.longitude;
    const startLat = viewState.latitude;
    const startZoom = viewState.zoom;
    const startPitch = viewState.pitch ?? 0;
    const startBearing = viewState.bearing ?? 0;

    const targetLng = field.coordinates[1];
    const targetLat = field.coordinates[0];
    const targetZoom = 12.6;
    const targetPitch = is3D ? 50 : 0;
    const targetBearing = is3D ? startBearing + 360 : 0;

    const duration = 2000; // ~2 seconds
    let startTime: number | null = null;
    isAnimatingRef.current = true;

    const animate = (currentTime: number) => {
      if (!isAnimatingRef.current) return;
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth cubic ease-out: 1 - (1 - t)^3
      const ease = 1 - Math.pow(1 - progress, 3);

      setViewState({
        longitude: startLng + (targetLng - startLng) * ease,
        latitude: startLat + (targetLat - startLat) * ease,
        zoom: startZoom + (targetZoom - startZoom) * ease,
        pitch: startPitch + (targetPitch - startPitch) * ease,
        bearing: startBearing + (targetBearing - startBearing) * ease,
      });

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        isAnimatingRef.current = false;
        // Keep bearing cleanly normalized
        setViewState((v) => ({ ...v, bearing: targetBearing % 360 }));
      }
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);
  }, [viewState, is3D]);

  const handleSelectField = useCallback((field: FieldProfile) => {
    onSelectField(field);
    animateToField(field);
  }, [onSelectField, animateToField]);

  // Watch for external selectedField prop changes
  useEffect(() => {
    if (prevFieldIdRef.current !== selectedField.id) {
      prevFieldIdRef.current = selectedField.id;
      animateToField(selectedField);
    }
  }, [selectedField, animateToField]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      isAnimatingRef.current = false;
    };
  }, []);

  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    object?: ParcelFeature | null;
  } | null>(null);

  const parcelGeoJson = useMemo(() => generateFieldPolygons(filteredFields), [filteredFields]);

  // Color functions based on active thematic layer
  const getParcelFillColor = (f: Feature<Geometry, ParcelProperties>): [number, number, number, number] => {
    const isSelected = f?.properties?.id === selectedField?.id;

    if (thematicLayer === 'slope') {
      const slope = f?.properties?.slope ?? 0;
      if (slope > 15) return [239, 68, 68, isSelected ? 220 : 180]; // Red - High erosion risk
      if (slope >= 8) return [245, 158, 11, isSelected ? 220 : 180]; // Amber - Moderate slope
      return [34, 197, 94, isSelected ? 220 : 180]; // Green - Gentle slope
    }

    if (thematicLayer === 'awc') {
      const awc = f?.properties?.awc ?? 120;
      if (awc >= 140) return [14, 116, 144, isSelected ? 230 : 190]; // Deep Cyan - High water capacity
      if (awc >= 120) return [56, 189, 248, isSelected ? 220 : 170]; // Sky blue - Moderate
      return [249, 115, 22, isSelected ? 230 : 190]; // Orange - Water deficit prone
    }

    // Default status mode: AgriPluse brand teal vs candidate cyan
    return isSelected
      ? [35, 127, 142, 200]
      : [8, 145, 178, 130];
  };

  const getParcelLineColor = (f: Feature<Geometry, ParcelProperties>): [number, number, number, number] => {
    const isSelected = f?.properties?.id === selectedField?.id;
    if (isSelected) return [35, 127, 142, 255];
    return [255, 255, 255, 200];
  };

  // Deck.gl Layers with AgriPluse Palette
  const layers = [
    // 1. Agricultural Parcel Boundaries & Extruded 3D Elevation
    // eslint-disable-next-line react-hooks/refs
    new GeoJsonLayer<ParcelProperties>({
      id: 'field-parcels',
      data: parcelGeoJson,
      pickable: true,
      stroked: true,
      filled: true,
      extruded: true,
      wireframe: true,
      getElevation: (f: Feature<Geometry, ParcelProperties>) => (f?.properties?.elevation || 50) * 1.5,
      getFillColor: getParcelFillColor,
      getLineColor: getParcelLineColor,
      getLineWidth: 2.5,
      lineWidthUnits: 'pixels',
      updateTriggers: {
        getFillColor: [thematicLayer, selectedField?.id],
        getLineColor: [thematicLayer, selectedField?.id],
      },
      onHover: (info: PickingInfo<Feature<Geometry, ParcelProperties>>) => {
        if (info.object) {
          setHoverInfo({ x: info.x, y: info.y, object: info.object as ParcelFeature });
        } else {
          setHoverInfo(null);
        }
      },
      onClick: (info: PickingInfo<Feature<Geometry, ParcelProperties>>) => {
        if (info.object?.properties?.id) {
          const match = fields.find((f) => f.id === info.object?.properties?.id);
          if (match) {
            handleSelectField(match);
          }
        }
      },
    }),

    // 2. Center pins
    // eslint-disable-next-line react-hooks/refs
    new ScatterplotLayer<FieldProfile>({
      id: 'field-pins',
      data: filteredFields,
      pickable: true,
      opacity: 0.95,
      stroked: true,
      filled: true,
      radiusScale: 6,
      radiusMinPixels: 8,
      radiusMaxPixels: 24,
      lineWidthMinPixels: 2,
      getPosition: (d: FieldProfile) => d?.coordinates ? [d.coordinates[1], d.coordinates[0]] : [109.2942, -7.5186],
      getRadius: (d: FieldProfile) => (d?.id === selectedField?.id ? 140 : 80),
      getFillColor: (d: FieldProfile) =>
        d?.id === selectedField?.id ? [35, 127, 142, 250] : [8, 145, 178, 220],
      getLineColor: () => [255, 255, 255, 255],
      updateTriggers: {
        getRadius: [selectedField?.id],
        getFillColor: [selectedField?.id],
      },
      onClick: (info: PickingInfo<FieldProfile>) => {
        if (info.object) {
          handleSelectField(info.object);
        }
      },
    }),

    // 3. Floating 3D Text Labels above Plots
    new TextLayer<FieldProfile>({
      id: 'field-labels',
      data: filteredFields,
      pickable: false,
      getPosition: (d: FieldProfile) =>
        d?.coordinates ? [d.coordinates[1], d.coordinates[0], (d.elevationMeters || 50) * 2 + 35] : [109.2942, -7.5186, 135],
      getText: (d: FieldProfile) => `${d?.village || ''}\n(${d?.soil?.slope ?? 0}% slope)`,
      getSize: 12,
      getColor: (d: FieldProfile) =>
        d?.id === selectedField?.id ? [35, 127, 142, 255] : [20, 35, 43, 230],
      updateTriggers: {
        getColor: [selectedField?.id],
      },
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'bottom',
      background: true,
      getBackgroundColor: () => [255, 255, 255, 240],
      backgroundPadding: [6, 4],
    }),

    // 4. User GPS Location Marker (when active)
    ...(userCoords
      ? [
          new ScatterplotLayer({
            id: 'user-gps-pulse',
            data: [{ position: [userCoords.longitude, userCoords.latitude] }],
            getPosition: (d: { position: [number, number] }) => d.position,
            getFillColor: [35, 127, 142, 50],
            getRadius: 350,
            radiusUnits: 'meters',
            stroked: true,
            getLineColor: [35, 127, 142, 200],
            getLineWidth: 2,
            lineWidthUnits: 'pixels',
          }),
          new ScatterplotLayer({
            id: 'user-gps-center',
            data: [{ position: [userCoords.longitude, userCoords.latitude] }],
            getPosition: (d: { position: [number, number] }) => d.position,
            getFillColor: [35, 127, 142, 255],
            getRadius: 60,
            radiusUnits: 'meters',
            stroked: true,
            getLineColor: [255, 255, 255, 255],
            getLineWidth: 3,
            lineWidthUnits: 'pixels',
          }),
        ]
      : []),
  ];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#F4F7FA]">
      {/* 1. Floating Header */}
      {onOpenGlossary && onOpenDataSources && onBackToLanding && (
        <FloatingMapHeader
          currentLang={currentLang}
          onToggleLang={onToggleLang}
          onOpenGlossary={onOpenGlossary}
          onOpenDataSources={onOpenDataSources}
          onBackToLanding={onBackToLanding}
          selectedVillage={selectedField.village}
        />
      )}

      {/* 2. Floating Omni-Search Bar with Quick Filter Chips */}
      <div className="pointer-events-auto fixed top-20 left-4 z-30">
        <FloatingSearchBar
          fields={fields}
          selectedField={selectedField}
          onSelectField={handleSelectField}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          userCoords={userCoords}
          onRequestLocation={onRequestLocation}
          isLocating={isLocating}
          currentLang={currentLang}
        />
      </div>

      {/* 3. Floating Plot Detail Side Card */}
      {onOpenAnalysis && (
        <PlotDetailSideCard
          field={selectedField}
          isOpen={isSideCardOpen}
          onClose={() => setIsSideCardOpen(false)}
          onOpenAnalysis={onOpenAnalysis}
          currentLang={currentLang}
        />
      )}

      {/* 4. Bottom Right Floating Thematic Layer Switcher & 2D/3D Perspective Toggle */}
      <div className="pointer-events-auto fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-30 flex flex-wrap items-center gap-2">
        {/* Layer Selector */}
        <div className="flex items-center rounded-full border border-[#E6EBF0] bg-white/95 p-1 text-[11px] font-semibold text-[#5F6B74] backdrop-blur-md shadow-float">
          <button
            onClick={() => setThematicLayer('status')}
            className={`rounded-full px-3 py-1.5 transition ${
              thematicLayer === 'status'
                ? 'bg-[#237F8E] text-white font-bold shadow-xs'
                : 'hover:text-[#14232B]'
            }`}
          >
            Petak
          </button>
          <button
            onClick={() => setThematicLayer('slope')}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition ${
              thematicLayer === 'slope'
                ? 'bg-[#237F8E] text-white font-bold shadow-xs'
                : 'hover:text-[#14232B]'
            }`}
          >
            <Activity className="h-3 w-3" />
            <span>Lereng (SRTM)</span>
          </button>
          <button
            onClick={() => setThematicLayer('awc')}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition ${
              thematicLayer === 'awc'
                ? 'bg-[#237F8E] text-white font-bold shadow-xs'
                : 'hover:text-[#14232B]'
            }`}
          >
            <Droplets className="h-3 w-3" />
            <span>Kapasitas Air (SMAP)</span>
          </button>
        </div>

        {/* 2D/3D Perspective Toggle */}
        <button
          onClick={() => {
            setIs3D(!is3D);
            setViewState((v) => ({
              ...v,
              pitch: is3D ? 0 : 50,
              bearing: is3D ? 0 : 15,
            }));
          }}
          className="flex items-center gap-1.5 rounded-full border border-[#E6EBF0] bg-white/95 px-4 py-2 text-xs font-semibold text-[#14232B] backdrop-blur-md transition hover:border-[#237F8E] hover:text-[#237F8E] shadow-float"
        >
          <Layers className="h-3.5 w-3.5 text-[#237F8E]" />
          <span>{is3D ? '3D View' : '2D Plan'}</span>
        </button>
      </div>

      {/* 5. Dynamic Map Legend - Floating Pill at Bottom Left */}
      <div className="pointer-events-auto fixed bottom-18 sm:bottom-6 left-4 sm:left-6 z-30 flex flex-wrap items-center gap-3 rounded-full border border-[#E6EBF0] bg-white/95 px-4 py-2 text-xs text-[#5F6B74] backdrop-blur-md shadow-float">
        {thematicLayer === 'status' && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#237F8E]" />
              <span className="font-semibold text-[#14232B]">Petak Aktif</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0891b2]" />
              <span>Petak Terkatalog</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mountain className="h-3.5 w-3.5 text-amber-600" />
              <span>Elevasi 3D</span>
            </div>
          </>
        )}

        {thematicLayer === 'slope' && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>&lt;8% Landai (Stabil)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>8-15% Moderat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="font-semibold text-red-700">&gt;15% Rentan Erosi</span>
            </div>
          </>
        )}

        {thematicLayer === 'awc' && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-700" />
              <span>&gt;140mm Air Melimpah</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
              <span>120-140mm Sedang</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              <span className="font-semibold text-orange-700">&lt;120mm Defisit Kelembaban</span>
            </div>
          </>
        )}
      </div>

      {/* 6. Hover Tooltip */}
      {hoverInfo?.object?.properties && (
        <div
          className="pointer-events-none absolute z-30 rounded-2xl border border-[#237F8E]/30 bg-white/95 p-3.5 text-xs text-[#14232B] shadow-card backdrop-blur-md"
          style={{ left: hoverInfo.x + 10, top: hoverInfo.y + 10 }}
        >
          <p className="font-bold text-[#237F8E]">{hoverInfo.object.properties.name}</p>
          <p className="text-[#5F6B74]">Desa {hoverInfo.object.properties.village}</p>
          <div className="mt-1.5 space-y-0.5 text-[11px] text-[#5F6B74]">
            <p>Tekstur Tanah: <strong className="text-[#14232B]">{hoverInfo.object.properties.soil}</strong></p>
            <p>
              Kemiringan: <strong className="text-[#14232B]">{hoverInfo.object.properties.slope}%</strong> &middot; Elevasi: <strong className="text-[#14232B]">{hoverInfo.object.properties.elevation}m</strong>
            </p>
            <p>Kapasitas Air (AWC): <strong className="text-[#14232B]">{hoverInfo.object.properties.awc} mm</strong></p>
          </div>
        </div>
      )}

      {/* 7. Full-Screen Deck.gl + MapLibre Map Canvas with WebGL Error Boundary */}
      <MapErrorBoundary>
        <DeckGL<null>
          viewState={viewState}
          onViewStateChange={(e: ViewStateChangeParameters) => {
            if (isAnimatingRef.current) {
              isAnimatingRef.current = false;
              if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            }
            setViewState(e.viewState as MapViewState);
          }}
          controller={true}
          layers={layers}
        >
          <Map
            mapLib={maplibregl}
            mapStyle={SATELLITE_BASEMAP_STYLE}
          />
        </DeckGL>
      </MapErrorBoundary>
    </div>
  );
}
