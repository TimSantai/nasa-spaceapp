import type { Feature, Polygon, FeatureCollection } from 'geojson';
import type * as maplibregl from 'maplibre-gl';
import { Delaunay } from 'd3-delaunay';
import type { FieldProfile } from '../../types/domain';

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
export const SATELLITE_BASEMAP_STYLE: maplibregl.StyleSpecification = {
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

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return hash;
}

/**
 * Generates an organic, non-rectangular parcel ring (7 vertices) with slight terrain-like variance.
 * Deterministic based on the field id so it never flickers across re-renders.
 */
export function generateOrganicParcelRing(
  lng: number,
  lat: number,
  seed: string,
  baseRadius = 0.0055
): [number, number][] {
  const numPoints = 7;
  const hash = hashString(seed);
  const ring: [number, number][] = [];

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const pseudoRandom = Math.sin(hash + i * 1.7) * 0.18;
    const r = baseRadius * (1 + pseudoRandom);
    // Latitudinal aspect ratio compensation at ~ -7.5 degrees: cos(-7.5 deg) ~ 0.99
    ring.push([lng + r * Math.cos(angle), lat + r * Math.sin(angle) * 0.88]);
  }

  // Ensure closed ring
  ring.push([ring[0][0], ring[0][1]]);
  return ring;
}

function extractParcelProperties(field: FieldProfile): ParcelProperties {
  return {
    id: field.id,
    name: field.name,
    village: field.village,
    soil: field.soil.texture,
    slope: field.soil.slope,
    elevation: field.elevationMeters,
    awc: field.soil.awc,
  };
}

function sanitizeFieldPoints(fields: FieldProfile[]): [number, number][] {
  const seen = new Set<string>();
  return fields.map((f, i) => {
    let [lat, lng] = f.coordinates;
    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    if (seen.has(key)) {
      lng += 0.0001 * Math.sin(i);
      lat += 0.0001 * Math.cos(i);
    }
    seen.add(key);
    return [lng, lat];
  });
}

function computeVoronoiBounds(
  points: [number, number][],
  padding = 0.03
): [number, number, number, number] {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of points) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  return [minLng - padding, minLat - padding, maxLng + padding, maxLat + padding];
}

function processVoronoiCell(
  poly: [number, number][] | null,
  cx: number,
  cy: number,
  fieldId: string
): [number, number][] {
  const MAX_RADIUS = 0.015; // ~1.6km max reach for outermost boundary cells
  const INSET_RATIO = 0.90; // Inset 10% to reveal natural roads/boundaries between parcels

  if (!poly || poly.length < 4) {
    return generateOrganicParcelRing(cx, cy, fieldId);
  }

  const ring: [number, number][] = poly.map(([x, y]) => {
    const dist = Math.hypot(x - cx, y - cy);
    const r = dist > MAX_RADIUS ? (MAX_RADIUS / dist) * INSET_RATIO : INSET_RATIO;
    return [cx + (x - cx) * r, cy + (y - cy) * r];
  });

  // Ensure ring closure
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([first[0], first[1]]);
  }
  return ring;
}

/**
 * Generates natural Voronoi parcel geometries for fields across the basin.
 * When >= 3 fields exist, Delaunay Voronoi partitions the space naturally into
 * seamless village territory cells, with radial clamping and an inset to reveal
 * agricultural pathways and roads between plots.
 */
export function generateFieldPolygons(fields: FieldProfile[]): FeatureCollection<Polygon, ParcelProperties> {
  if (!fields.length) {
    return { type: 'FeatureCollection', features: [] };
  }

  // Fallback to organic single/dual polygons if fewer than 3 fields exist
  if (fields.length < 3) {
    return {
      type: 'FeatureCollection',
      features: fields.map((field): ParcelFeature => ({
        type: 'Feature',
        id: field.id,
        properties: extractParcelProperties(field),
        geometry: {
          type: 'Polygon',
          coordinates: [generateOrganicParcelRing(field.coordinates[1], field.coordinates[0], field.id)],
        },
      })),
    };
  }

  const points = sanitizeFieldPoints(fields);
  const bounds = computeVoronoiBounds(points);

  let voronoi: ReturnType<Delaunay<[number, number]>['voronoi']> | null = null;
  try {
    const delaunay = Delaunay.from(points);
    voronoi = delaunay.voronoi(bounds);
  } catch {
    voronoi = null;
  }

  const features = fields.map((field, i): ParcelFeature => {
    const [cx, cy] = points[i];
    const poly = voronoi ? (voronoi.cellPolygon(i) as [number, number][] | null) : null;
    const ringCoords = processVoronoiCell(poly, cx, cy, field.id);

    return {
      type: 'Feature',
      id: field.id,
      properties: extractParcelProperties(field),
      geometry: {
        type: 'Polygon',
        coordinates: [ringCoords],
      },
    };
  });

  return { type: 'FeatureCollection', features };
}
