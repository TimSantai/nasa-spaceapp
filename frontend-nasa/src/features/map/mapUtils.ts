import type { Feature, Polygon } from 'geojson';
import type * as maplibregl from 'maplibre-gl';
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

export function generateFieldPolygons(fields: FieldProfile[]) {
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
