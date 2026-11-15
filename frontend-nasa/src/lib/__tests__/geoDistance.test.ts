import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHaversineDistance,
  findNearestField,
  sortFieldsByProximity,
  formatDistance,
  isWithinObservationalBasin,
} from '../geoDistance.ts';
import type { FieldProfile } from '../../types/domain.ts';

const mockFields: FieldProfile[] = [
  {
    id: 'field-karangrau',
    name: 'Plot Karangrau Block 4B',
    regency: 'Banyumas',
    district: 'Banyumas',
    village: 'Karangrau',
    coordinates: [-7.5186, 109.2942],
    elevationMeters: 48,
    areaHectares: 2.4,
    currentRotation: ['Paddy'],
    soil: {
      type: 'Alluvial',
      texture: 'Clay Loam',
      organicMatter: '1.8%',
      awc: 145,
      slope: 2.1,
      erosionRisk: 'Low',
    },
    climateHistory: [],
    ndviTimeSeries: [],
    dataAvailability: {
      hasObservedRotation: false,
      hasFieldSoilSurvey: false,
      hasSatelliteNdvi: true,
      hasDailyPrecipitation: true,
      overallConfidence: 'MODERATE',
      missingDataNotes: [],
    },
  },
  {
    id: 'field-kotayasa',
    name: 'Sumbang Highland Terrace 2A',
    regency: 'Banyumas',
    district: 'Sumbang',
    village: 'Kotayasa',
    coordinates: [-7.3512, 109.2568],
    elevationMeters: 310,
    areaHectares: 1.8,
    currentRotation: ['Paddy'],
    soil: {
      type: 'Andosol',
      texture: 'Loamy Sand',
      organicMatter: '3.2%',
      awc: 180,
      slope: 8.4,
      erosionRisk: 'Moderate',
    },
    climateHistory: [],
    ndviTimeSeries: [],
    dataAvailability: {
      hasObservedRotation: false,
      hasFieldSoilSurvey: false,
      hasSatelliteNdvi: true,
      hasDailyPrecipitation: true,
      overallConfidence: 'MODERATE',
      missingDataNotes: [],
    },
  },
  {
    id: 'field-rawalo',
    name: 'Rawalo Lowland Basin 1C',
    regency: 'Banyumas',
    district: 'Rawalo',
    village: 'Rawalo',
    coordinates: [-7.5255, 109.1623],
    elevationMeters: 28,
    areaHectares: 3.1,
    currentRotation: ['Paddy'],
    soil: {
      type: 'Vertisol',
      texture: 'Heavy Clay',
      organicMatter: '1.4%',
      awc: 125,
      slope: 0.8,
      erosionRisk: 'Low',
    },
    climateHistory: [],
    ndviTimeSeries: [],
    dataAvailability: {
      hasObservedRotation: false,
      hasFieldSoilSurvey: false,
      hasSatelliteNdvi: true,
      hasDailyPrecipitation: true,
      overallConfidence: 'MODERATE',
      missingDataNotes: [],
    },
  },
];

test('calculateHaversineDistance: returns 0 for identical points', () => {
  const dist = calculateHaversineDistance(-7.5186, 109.2942, -7.5186, 109.2942);
  assert.equal(dist, 0);
});

test('calculateHaversineDistance: calculates reasonable distance between Karangrau and Kotayasa (~19km)', () => {
  const dist = calculateHaversineDistance(-7.5186, 109.2942, -7.3512, 109.2568);
  assert.ok(dist >= 18 && dist <= 20, `Expected around 19 km, got ${dist}`);
});

test('findNearestField: picks closest plot accurately', () => {
  // A point very close to Rawalo (-7.5250, 109.1620)
  const result = findNearestField(-7.5250, 109.1620, mockFields);
  assert.ok(result !== null);
  assert.equal(result.field.id, 'field-rawalo');
  assert.ok(result.distanceKm < 0.5);
});

test('sortFieldsByProximity: sorts fields closest to farthest and marks nearest', () => {
  // Location close to Sumbang/Kotayasa
  const sorted = sortFieldsByProximity(-7.35, 109.25, mockFields);
  assert.equal(sorted.length, 3);
  assert.equal(sorted[0].id, 'field-kotayasa');
  assert.equal(sorted[0].isNearest, true);
  assert.ok(sorted[0].distanceKm < sorted[1].distanceKm);
  assert.ok(sorted[1].distanceKm <= sorted[2].distanceKm);
});

test('formatDistance: formats properly for id and en', () => {
  assert.equal(formatDistance(0.45, 'id'), '< 1 km (450 m)');
  assert.ok(formatDistance(12.4, 'id').includes('12,4 km') || formatDistance(12.4, 'id').includes('12.4 km'));
});

test('isWithinObservationalBasin: distinguishes local vs distant user coordinates', () => {
  // User in Purwokerto (close to Banyumas ~15km)
  assert.equal(isWithinObservationalBasin(15), true);
  // User in Jakarta (~300km away)
  assert.equal(isWithinObservationalBasin(320), false);
});
