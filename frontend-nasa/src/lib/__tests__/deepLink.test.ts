import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHash, buildWorkspaceHash, searchCatalogPlots } from '../deepLink.ts';
import type { FieldProfile } from '../../types/domain.ts';

const mockFields: FieldProfile[] = [
  {
    id: 'banyumas-karangrau-01',
    name: 'Plot Karangrau Block 4B',
    regency: 'Banyumas',
    district: 'Banyumas',
    village: 'Karangrau',
    coordinates: [-7.5186, 109.2942],
    elevationMeters: 48,
    areaHectares: 2.4,
    currentRotation: ['Paddy (Wet Season)', 'Fallow'],
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
    id: 'banyumas-sumbang-02',
    name: 'Sumbang Highland Terrace 2A',
    regency: 'Banyumas',
    district: 'Sumbang',
    village: 'Kotayasa',
    coordinates: [-7.3512, 109.2568],
    elevationMeters: 310,
    areaHectares: 1.8,
    currentRotation: ['Paddy', 'Chili'],
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
];

test('parseHash: default to landing mode when hash is empty or #', () => {
  const result1 = parseHash('', mockFields);
  assert.equal(result1.viewMode, 'landing');
  assert.equal(result1.matchedField, null);

  const result2 = parseHash('#', mockFields);
  assert.equal(result2.viewMode, 'landing');
});

test('parseHash: parses field ID and matches catalog plot', () => {
  const result = parseHash('#workspace?field=banyumas-sumbang-02', mockFields);
  assert.equal(result.viewMode, 'workspace');
  assert.equal(result.fieldId, 'banyumas-sumbang-02');
  assert.ok(result.matchedField !== null);
  assert.equal(result.matchedField.village, 'Kotayasa');
});

test('parseHash: parses search query q and infers matched field', () => {
  const result = parseHash('#workspace?q=Kotayasa', mockFields);
  assert.equal(result.viewMode, 'workspace');
  assert.equal(result.query, 'Kotayasa');
  assert.ok(result.matchedField !== null);
  assert.equal(result.matchedField.id, 'banyumas-sumbang-02');
});

test('buildWorkspaceHash: constructs deep link URL cleanly', () => {
  assert.equal(buildWorkspaceHash(), '#workspace');
  assert.equal(buildWorkspaceHash('banyumas-karangrau-01'), '#workspace?field=banyumas-karangrau-01');
  assert.equal(
    buildWorkspaceHash('banyumas-sumbang-02', 'Kotayasa'),
    '#workspace?field=banyumas-sumbang-02&q=Kotayasa'
  );
  // Robust against accidental undefined or empty strings
  assert.equal(buildWorkspaceHash(undefined, undefined), '#workspace');
  assert.equal(buildWorkspaceHash('banyumas-karangrau-01', ''), '#workspace?field=banyumas-karangrau-01');
});

test('parseHash: handles bare #workspace gracefully with fallback', () => {
  const result = parseHash('#workspace', mockFields);
  assert.equal(result.viewMode, 'workspace');
  assert.equal(result.fieldId, null);
  assert.equal(result.matchedField, null);
  assert.equal(result.query, '');
});

test('searchCatalogPlots: finds plots by village, soil, and rotation', () => {
  const byVillage = searchCatalogPlots('Kotayasa', mockFields);
  assert.equal(byVillage.length, 1);
  assert.equal(byVillage[0].id, 'banyumas-sumbang-02');

  const bySoil = searchCatalogPlots('Clay Loam', mockFields);
  assert.equal(bySoil.length, 1);
  assert.equal(bySoil[0].id, 'banyumas-karangrau-01');

  const byCrop = searchCatalogPlots('Chili', mockFields);
  assert.equal(byCrop.length, 1);
  assert.equal(byCrop[0].id, 'banyumas-sumbang-02');

  const all = searchCatalogPlots('', mockFields);
  assert.equal(all.length, 2);
});
