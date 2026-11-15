import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, GeoJsonLayer, TextLayer } from '@deck.gl/layers';
import type { PickingInfo, MapViewState, ViewStateChangeParameters } from '@deck.gl/core';
import { Map } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import type { Feature, Geometry } from 'geojson';
import type { FieldProfile } from '../../types/domain';
import type { Language } from '../../types/landing';
import { FloatingMapHeader } from './FloatingMapHeader';
import { FloatingSearchBar } from './FloatingSearchBar';
import { PlotDetailSideCard } from './PlotDetailSideCard';
import { ThematicLayerSwitcher } from './ThematicLayerSwitcher';
import { MapLegend } from './MapLegend';
import { MapErrorBoundary } from '../../components/MapErrorBoundary';
import {
  type ThematicLayerMode,
  type ParcelFeature,
  type ParcelProperties,
  SATELLITE_BASEMAP_STYLE,
  generateFieldPolygons,
} from './mapUtils';

export type { ThematicLayerMode, ParcelFeature, ParcelProperties };

interface FieldMapProps {
  fields: FieldProfile[];
  selectedField: FieldProfile | null;
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
  initialSearchQuery?: string;
  onSearchQueryChange?: (q: string) => void;
  dataMode?: 'live' | 'snapshot';
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
  initialSearchQuery,
  onSearchQueryChange,
  dataMode = 'snapshot',
}: FieldMapProps) {
  // Thematic Layer State (Task 3.2)
  const [thematicLayer, setThematicLayer] = useState<ThematicLayerMode>('status');

  // Perspective Mode (3D vs 2D)
  const [is3D, setIs3D] = useState(true);

  // Floating Side Card open state - only opens if a field was selected/passed
  const [isSideCardOpen, setIsSideCardOpen] = useState(Boolean(selectedField));

  // Quick Filter State ('all' | 'clay_loam' | 'steep' | 'high_awc')
  const [activeFilter, setActiveFilter] = useState('all');

  // Filtered fields based on active quick filter chip (always retaining selectedField if chosen)
  const filteredFields = useMemo(() => {
    let result = fields;
    if (activeFilter === 'clay_loam') {
      result = fields.filter((f) => f.soil.texture.toLowerCase().includes('clay loam'));
    } else if (activeFilter === 'steep') {
      result = fields.filter((f) => f.soil.slope > 8);
    } else if (activeFilter === 'high_awc') {
      result = fields.filter((f) => f.soil.awc >= 140);
    }
    if (selectedField && !result.some((f) => f.id === selectedField.id)) {
      return [...result, selectedField];
    }
    return result;
  }, [fields, activeFilter, selectedField]);

  // ViewState state: when selectedField is null, provide regional overview of Banyumas basin
  const [viewState, setViewState] = useState<MapViewState>(() => {
    if (selectedField?.coordinates) {
      return {
        longitude: selectedField.coordinates[1],
        latitude: selectedField.coordinates[0],
        zoom: 12.2,
        pitch: 50,
        bearing: 15,
      };
    }
    return {
      longitude: 109.28,
      latitude: -7.45,
      zoom: 10.6,
      pitch: 35,
      bearing: 0,
    };
  });

  const viewStateRef = useRef(viewState);

  useEffect(() => {
    viewStateRef.current = viewState;
  }, [viewState]);

  const isAnimatingRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const prevFieldIdRef = useRef<string | null>(selectedField?.id ?? null);
  // Cinematic 360-degree Camera Orbit Animation to any field
  const animateToField = useCallback((field: FieldProfile) => {
    if (!field || !field.coordinates) return;
    setIsSideCardOpen(true);

    const startLng = viewStateRef.current.longitude;
    const startLat = viewStateRef.current.latitude;
    const startZoom = viewStateRef.current.zoom;
    const startPitch = viewStateRef.current.pitch ?? 0;
    const startBearing = viewStateRef.current.bearing ?? 0;

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
  }, [is3D]);

  const handleSelectField = useCallback((field: FieldProfile) => {
    onSelectField(field);
    animateToField(field);
  }, [onSelectField, animateToField]);

  // Watch for external selectedField prop changes
  useEffect(() => {
    if (selectedField?.id) {
      if (prevFieldIdRef.current !== selectedField.id) {
        prevFieldIdRef.current = selectedField.id;
        animateToField(selectedField);
      }
    } else {
      prevFieldIdRef.current = null;
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
          selectedVillage={
            selectedField?.village ??
            (currentLang === 'id' ? 'Semua Wilayah Banyumas' : 'All Banyumas Basin')
          }
          dataMode={dataMode}
        />
      )}

      {/* 2. Left HUD: Floating Omni-Search Bar, Quick Filters, and Thematic Layer Switcher */}
      <div className="pointer-events-auto fixed top-20 left-4 right-4 sm:right-auto z-30 flex flex-col gap-2 max-w-md sm:max-w-lg">
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
          initialQuery={initialSearchQuery}
          onQueryChange={onSearchQueryChange}
        />

        {/* Thematic Layer Switcher & 2D/3D Perspective Toggle placed directly beside/below search bar */}
        <ThematicLayerSwitcher
          thematicLayer={thematicLayer}
          onLayerChange={setThematicLayer}
          is3D={is3D}
          onToggle3D={() => {
            setIs3D(!is3D);
            setViewState((v) => ({
              ...v,
              pitch: is3D ? 0 : 50,
              bearing: is3D ? 0 : 15,
            }));
          }}
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

      {/* 5. Dynamic Map Legend - Floating Pill at Bottom Left */}
      <MapLegend
        thematicLayer={thematicLayer}
        currentLang={currentLang}
      />

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
      <MapErrorBoundary currentLang={currentLang}>
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
