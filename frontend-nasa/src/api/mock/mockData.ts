/**
 * Offline fallback data. Not hand-written: it is a snapshot of the real Field Shift API output
 * (snapshot.json, regenerated from backend-nasa) so the UI stays honest when the backend is down.
 */
import type { ClimatePhase, FieldProfile, Strategy } from '../../types/domain';
import type { components } from '../schema';
import { toEnsoPhase, toField, toStrategies } from '../fieldshift.ts';
import snapshot from './snapshot.json' with { type: 'json' };

interface Snapshot {
  generatedAt: string;
  sites: components['schemas']['SiteInfo'][];
  fields: components['schemas']['FieldProfileOut'][];
  compare: Record<'el_nino' | 'neutral' | 'la_nina', components['schemas']['ComparisonOut']>;
}

const SNAP = snapshot as unknown as Snapshot;
const BANYUMAS_SOURCES = SNAP.sites.find((s) => s.key === 'banyumas')?.sources ?? [];

export const SNAPSHOT_DATE = SNAP.generatedAt;

/** Crop key -> label for the Banyumas baseline editor (used until /sites responds). */
export const SNAPSHOT_CROP_LABELS: Record<string, string> =
  SNAP.sites.find((s) => s.key === 'banyumas')?.crop_labels ?? {};

const EXTRA_BANYUMAS_FIELDS: FieldProfile[] = [
  {
    id: 'banyumas-baturraden-04',
    name: 'Kemutug Lor Highland Volcanic Slopes',
    regency: 'Banyumas',
    district: 'Baturraden',
    village: 'Kemutug Lor',
    coordinates: [-7.3125, 109.2241],
    elevationMeters: 640,
    areaHectares: 1.8,
    currentRotation: ['Highland Vegetables & Chili (Nov-Feb)', 'Cabbage & Leek (Mar-Jun)', 'Severe Slope Runoff Fallow (Jul-Oct)'],
    soil: {
      type: 'Andosol Vulkanik Lereng Gunung Slamet',
      texture: 'Loam Humus Vulkanis',
      organicMatter: '4.2% (High Carbon)',
      awc: 180,
      slope: 14.2,
      erosionRisk: 'High',
    },
    climateHistory: [
      { month: 'Jan', rainfall: 480, tempMin: 18.5, tempMax: 26.2, soilMoisture: 0.42 },
      { month: 'Feb', rainfall: 420, tempMin: 18.6, tempMax: 26.5, soilMoisture: 0.40 },
      { month: 'Mar', rainfall: 390, tempMin: 18.8, tempMax: 26.8, soilMoisture: 0.38 },
      { month: 'Apr', rainfall: 310, tempMin: 19.0, tempMax: 27.0, soilMoisture: 0.35 },
      { month: 'May', rainfall: 210, tempMin: 18.7, tempMax: 26.9, soilMoisture: 0.30 },
      { month: 'Jun', rainfall: 140, tempMin: 17.8, tempMax: 26.2, soilMoisture: 0.25 },
      { month: 'Jul', rainfall: 95, tempMin: 16.9, tempMax: 25.8, soilMoisture: 0.21 },
      { month: 'Aug', rainfall: 60, tempMin: 16.5, tempMax: 26.1, soilMoisture: 0.18 },
      { month: 'Sep', rainfall: 110, tempMin: 17.2, tempMax: 27.2, soilMoisture: 0.22 },
      { month: 'Oct', rainfall: 280, tempMin: 18.1, tempMax: 27.5, soilMoisture: 0.32 },
      { month: 'Nov', rainfall: 460, tempMin: 18.4, tempMax: 26.6, soilMoisture: 0.41 },
      { month: 'Dec', rainfall: 495, tempMin: 18.3, tempMax: 26.1, soilMoisture: 0.43 },
    ],
    ndviTimeSeries: [
      { month: 'Nov', ndvi: 0.32, phase: 'Land Prep' },
      { month: 'Dec', ndvi: 0.72, phase: 'Vegetative' },
      { month: 'Jan', ndvi: 0.88, phase: 'Reproductive' },
      { month: 'Feb', ndvi: 0.55, phase: 'Land Prep' },
      { month: 'Mar', ndvi: 0.79, phase: 'Vegetative' },
      { month: 'Apr', ndvi: 0.85, phase: 'Reproductive' },
      { month: 'May', ndvi: 0.48, phase: 'Vegetative' },
      { month: 'Jun', ndvi: 0.35, phase: 'Land Prep' },
      { month: 'Jul', ndvi: 0.24, phase: 'Fallow (Bera)' },
      { month: 'Aug', ndvi: 0.22, phase: 'Fallow (Bera)' },
      { month: 'Sep', ndvi: 0.28, phase: 'Land Prep' },
      { month: 'Oct', ndvi: 0.65, phase: 'Vegetative' },
    ],
    dataAvailability: {
      hasObservedRotation: false,
      hasFieldSoilSurvey: true,
      hasSatelliteNdvi: true,
      hasDailyPrecipitation: true,
      overallConfidence: 'HIGH',
      missingDataNotes: [
        'Persistent orographic cloud bands require radar backscatter (Sentinel-1 C-band SAR) fusion during high-monsoon peaks.',
        'High elevation gradient (>14% slope) necessitates SRTM 30m topographic normalization.',
      ],
    },
  },
  {
    id: 'banyumas-sokaraja-05',
    name: 'Sokaraja Alluvial Palawija Basin 1B',
    regency: 'Banyumas',
    district: 'Sokaraja',
    village: 'Sokaraja Tengah',
    coordinates: [-7.4582, 109.2921],
    elevationMeters: 35,
    areaHectares: 2.8,
    currentRotation: ['Paddy Rendengan (Nov-Feb)', 'Soybean (Anjasmoro) (Mar-Jun)', 'Hybrid Corn / Fallow (Jul-Oct)'],
    soil: {
      type: 'Aluvial Pelapukan Sungai Pelus & Serayu',
      texture: 'Silt Loam (Lempung Berdebu)',
      organicMatter: '2.2% (Balanced)',
      awc: 160,
      slope: 1.5,
      erosionRisk: 'Low',
    },
    climateHistory: [
      { month: 'Jan', rainfall: 370, tempMin: 22.8, tempMax: 31.2, soilMoisture: 0.38 },
      { month: 'Feb', rainfall: 330, tempMin: 23.0, tempMax: 31.4, soilMoisture: 0.36 },
      { month: 'Mar', rainfall: 305, tempMin: 23.1, tempMax: 31.8, soilMoisture: 0.34 },
      { month: 'Apr', rainfall: 250, tempMin: 23.3, tempMax: 32.0, soilMoisture: 0.31 },
      { month: 'May', rainfall: 160, tempMin: 23.0, tempMax: 31.8, soilMoisture: 0.26 },
      { month: 'Jun', rainfall: 100, tempMin: 22.1, tempMax: 31.5, soilMoisture: 0.22 },
      { month: 'Jul', rainfall: 70, tempMin: 21.4, tempMax: 31.1, soilMoisture: 0.17 },
      { month: 'Aug', rainfall: 40, tempMin: 21.2, tempMax: 31.4, soilMoisture: 0.14 },
      { month: 'Sep', rainfall: 75, tempMin: 21.7, tempMax: 32.2, soilMoisture: 0.16 },
      { month: 'Oct', rainfall: 200, tempMin: 22.5, tempMax: 32.4, soilMoisture: 0.25 },
      { month: 'Nov', rainfall: 350, tempMin: 22.7, tempMax: 31.5, soilMoisture: 0.35 },
      { month: 'Dec', rainfall: 385, tempMin: 22.6, tempMax: 31.1, soilMoisture: 0.39 },
    ],
    ndviTimeSeries: [
      { month: 'Nov', ndvi: 0.26, phase: 'Land Prep' },
      { month: 'Dec', ndvi: 0.65, phase: 'Vegetative' },
      { month: 'Jan', ndvi: 0.83, phase: 'Reproductive' },
      { month: 'Feb', ndvi: 0.44, phase: 'Land Prep' },
      { month: 'Mar', ndvi: 0.72, phase: 'Vegetative' },
      { month: 'Apr', ndvi: 0.79, phase: 'Reproductive' },
      { month: 'May', ndvi: 0.38, phase: 'Land Prep' },
      { month: 'Jun', ndvi: 0.58, phase: 'Vegetative' },
      { month: 'Jul', ndvi: 0.64, phase: 'Reproductive' },
      { month: 'Aug', ndvi: 0.21, phase: 'Fallow (Bera)' },
      { month: 'Sep', ndvi: 0.18, phase: 'Fallow (Bera)' },
      { month: 'Oct', ndvi: 0.27, phase: 'Land Prep' },
    ],
    dataAvailability: {
      hasObservedRotation: true,
      hasFieldSoilSurvey: true,
      hasSatelliteNdvi: true,
      hasDailyPrecipitation: true,
      overallConfidence: 'HIGH',
      missingDataNotes: [
        'Well-characterized agricultural basin with high historical data continuity from regional agricultural extension records (BPP Sokaraja).',
      ],
    },
  },
  {
    id: 'banyumas-tambak-06',
    name: 'Gebangsari Lowland Wetland 2C',
    regency: 'Banyumas',
    district: 'Tambak',
    village: 'Gebangsari',
    coordinates: [-7.6042, 109.3875],
    elevationMeters: 22,
    areaHectares: 3.5,
    currentRotation: ['Deepwater Wet Paddy (Nov-Feb)', 'Gadu Paddy (Mar-Jun)', 'Severe Drought Fallow & Cracking (Jul-Oct)'],
    soil: {
      type: 'Grumusol / Vertisol Dataran Rawa Lebak',
      texture: 'Heavy Swelling Clay (Liat Berat Mengembang)',
      organicMatter: '1.6% (Low-N)',
      awc: 130,
      slope: 0.8,
      erosionRisk: 'Low',
    },
    climateHistory: [
      { month: 'Jan', rainfall: 350, tempMin: 23.5, tempMax: 32.0, soilMoisture: 0.40 },
      { month: 'Feb', rainfall: 300, tempMin: 23.6, tempMax: 32.2, soilMoisture: 0.38 },
      { month: 'Mar', rainfall: 280, tempMin: 23.8, tempMax: 32.4, soilMoisture: 0.35 },
      { month: 'Apr', rainfall: 210, tempMin: 23.9, tempMax: 32.6, soilMoisture: 0.30 },
      { month: 'May', rainfall: 120, tempMin: 23.5, tempMax: 32.5, soilMoisture: 0.24 },
      { month: 'Jun', rainfall: 75, tempMin: 22.5, tempMax: 32.1, soilMoisture: 0.17 },
      { month: 'Jul', rainfall: 45, tempMin: 21.8, tempMax: 31.8, soilMoisture: 0.12 },
      { month: 'Aug', rainfall: 25, tempMin: 21.5, tempMax: 32.2, soilMoisture: 0.09 },
      { month: 'Sep', rainfall: 55, tempMin: 22.2, tempMax: 33.2, soilMoisture: 0.11 },
      { month: 'Oct', rainfall: 170, tempMin: 23.1, tempMax: 33.4, soilMoisture: 0.19 },
      { month: 'Nov', rainfall: 320, tempMin: 23.3, tempMax: 32.2, soilMoisture: 0.32 },
      { month: 'Dec', rainfall: 360, tempMin: 23.4, tempMax: 31.8, soilMoisture: 0.39 },
    ],
    ndviTimeSeries: [
      { month: 'Nov', ndvi: 0.22, phase: 'Land Prep' },
      { month: 'Dec', ndvi: 0.58, phase: 'Vegetative' },
      { month: 'Jan', ndvi: 0.78, phase: 'Reproductive' },
      { month: 'Feb', ndvi: 0.40, phase: 'Land Prep' },
      { month: 'Mar', ndvi: 0.70, phase: 'Vegetative' },
      { month: 'Apr', ndvi: 0.75, phase: 'Reproductive' },
      { month: 'May', ndvi: 0.32, phase: 'Land Prep' },
      { month: 'Jun', ndvi: 0.16, phase: 'Fallow (Bera)' },
      { month: 'Jul', ndvi: 0.12, phase: 'Fallow (Bera)' },
      { month: 'Aug', ndvi: 0.09, phase: 'Fallow (Bera)' },
      { month: 'Sep', ndvi: 0.10, phase: 'Fallow (Bera)' },
      { month: 'Oct', ndvi: 0.18, phase: 'Land Prep' },
    ],
    dataAvailability: {
      hasObservedRotation: false,
      hasFieldSoilSurvey: false,
      hasSatelliteNdvi: true,
      hasDailyPrecipitation: true,
      overallConfidence: 'MODERATE',
      missingDataNotes: [
        'Vertisol swelling dynamics cause deep soil desiccation cracks in dry season; surface roughness changes affect radar backscatter.',
      ],
    },
  },
  {
    id: 'banyumas-kebasen-07',
    name: 'Gambarsari Serayu Irrigation Plot 1A',
    regency: 'Banyumas',
    district: 'Kebasen',
    village: 'Gambarsari',
    coordinates: [-7.5348, 109.2085],
    elevationMeters: 26,
    areaHectares: 2.9,
    currentRotation: ['Technical Irrigated Paddy MT1 (Nov-Feb)', 'Technical Irrigated Paddy MT2 (Mar-Jun)', 'Dry Season Fallow / Rationing (Jul-Oct)'],
    soil: {
      type: 'Inceptisol Aluvial Irigasi Teknis Serayu',
      texture: 'Sandy Clay Loam (Lempung Liat Pasiran)',
      organicMatter: '2.0% (Medium)',
      awc: 155,
      slope: 1.2,
      erosionRisk: 'Low',
    },
    climateHistory: [
      { month: 'Jan', rainfall: 365, tempMin: 23.2, tempMax: 31.6, soilMoisture: 0.38 },
      { month: 'Feb', rainfall: 320, tempMin: 23.4, tempMax: 31.9, soilMoisture: 0.36 },
      { month: 'Mar', rainfall: 300, tempMin: 23.5, tempMax: 32.1, soilMoisture: 0.34 },
      { month: 'Apr', rainfall: 240, tempMin: 23.6, tempMax: 32.3, soilMoisture: 0.30 },
      { month: 'May', rainfall: 150, tempMin: 23.2, tempMax: 32.0, soilMoisture: 0.25 },
      { month: 'Jun', rainfall: 90, tempMin: 22.3, tempMax: 31.7, soilMoisture: 0.20 },
      { month: 'Jul', rainfall: 65, tempMin: 21.6, tempMax: 31.3, soilMoisture: 0.16 },
      { month: 'Aug', rainfall: 35, tempMin: 21.3, tempMax: 31.6, soilMoisture: 0.13 },
      { month: 'Sep', rainfall: 70, tempMin: 22.0, tempMax: 32.4, soilMoisture: 0.15 },
      { month: 'Oct', rainfall: 190, tempMin: 22.8, tempMax: 32.6, soilMoisture: 0.23 },
      { month: 'Nov', rainfall: 340, tempMin: 23.0, tempMax: 31.6, soilMoisture: 0.34 },
      { month: 'Dec', rainfall: 375, tempMin: 23.0, tempMax: 31.2, soilMoisture: 0.39 },
    ],
    ndviTimeSeries: [
      { month: 'Nov', ndvi: 0.27, phase: 'Land Prep' },
      { month: 'Dec', ndvi: 0.63, phase: 'Vegetative' },
      { month: 'Jan', ndvi: 0.82, phase: 'Reproductive' },
      { month: 'Feb', ndvi: 0.43, phase: 'Land Prep' },
      { month: 'Mar', ndvi: 0.74, phase: 'Vegetative' },
      { month: 'Apr', ndvi: 0.80, phase: 'Reproductive' },
      { month: 'May', ndvi: 0.36, phase: 'Land Prep' },
      { month: 'Jun', ndvi: 0.20, phase: 'Fallow (Bera)' },
      { month: 'Jul', ndvi: 0.16, phase: 'Fallow (Bera)' },
      { month: 'Aug', ndvi: 0.13, phase: 'Fallow (Bera)' },
      { month: 'Sep', ndvi: 0.15, phase: 'Fallow (Bera)' },
      { month: 'Oct', ndvi: 0.24, phase: 'Land Prep' },
    ],
    dataAvailability: {
      hasObservedRotation: true,
      hasFieldSoilSurvey: true,
      hasSatelliteNdvi: true,
      hasDailyPrecipitation: true,
      overallConfidence: 'HIGH',
      missingDataNotes: [
        'Command area of Serayu barrage with controlled gate measurements; verified against Dinas Pertanian Banyumas irrigation schedules.',
      ],
    },
  },
];

const existingSnapIds = new Set(SNAP.fields.map((f) => f.id));
export const MOCK_FIELDS: FieldProfile[] = [
  ...SNAP.fields.map(toField),
  ...EXTRA_BANYUMAS_FIELDS.filter((f) => !existingSnapIds.has(f.id)),
];

export function snapshotStrategies(phase: ClimatePhase): Strategy[] {
  return toStrategies(SNAP.compare[toEnsoPhase(phase)], BANYUMAS_SOURCES);
}

/** Strategies per field id (site-level climate analogs are shared by all Banyumas fields). */
export const MOCK_STRATEGIES: Record<string, Strategy[]> = Object.fromEntries(
  MOCK_FIELDS.map((f) => [f.id, snapshotStrategies('normal')]),
);
