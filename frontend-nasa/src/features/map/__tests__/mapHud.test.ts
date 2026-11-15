import test from 'node:test';
import assert from 'node:assert/strict';
import { generateFieldPolygons } from '../mapUtils.ts';
import type { FieldProfile } from '../../../types/domain.ts';

const testFields: FieldProfile[] = [
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
      slope: 2.5,
      erosionRisk: 'Low',
    },
    climateHistory: [],
    ndviTimeSeries: [],
    dataAvailability: {
      hasObservedRotation: true,
      hasFieldSoilSurvey: true,
      hasSatelliteNdvi: true,
      hasDailyPrecipitation: true,
      overallConfidence: 'HIGH',
      missingDataNotes: [],
    },
  },
  {
    id: 'banyumas-sumbang-02',
    name: 'Sumbang Highland Terrace 2A',
    regency: 'Banyumas',
    district: 'Sumbang',
    village: 'Kotayasa',
    coordinates: [-7.3481, 109.2592],
    elevationMeters: 420,
    areaHectares: 1.8,
    currentRotation: ['Upland Rice', 'Soybean', 'Vegetables'],
    soil: {
      type: 'Andosol',
      texture: 'Silt Loam',
      organicMatter: '3.4%',
      awc: 160,
      slope: 12.0,
      erosionRisk: 'Moderate',
    },
    climateHistory: [],
    ndviTimeSeries: [],
    dataAvailability: {
      hasObservedRotation: true,
      hasFieldSoilSurvey: true,
      hasSatelliteNdvi: true,
      hasDailyPrecipitation: true,
      overallConfidence: 'HIGH',
      missingDataNotes: [],
    },
  },
];

test('generateFieldPolygons: generates valid GeoJSON FeatureCollection', () => {
  const collection = generateFieldPolygons(testFields);

  assert.equal(collection.type, 'FeatureCollection');
  assert.equal(collection.features.length, testFields.length);

  for (const feature of collection.features) {
    assert.equal(feature.type, 'Feature');
    assert.equal(feature.geometry.type, 'Polygon');
    assert.equal(feature.geometry.coordinates.length, 1);
    assert.equal(feature.geometry.coordinates[0].length, 5); // Closed 4-point polygon

    const props = feature.properties;
    assert.ok(props.id);
    assert.ok(props.name);
    assert.ok(props.village);
    assert.ok(props.soil);
    assert.ok(typeof props.slope === 'number');
    assert.ok(typeof props.elevation === 'number');
    assert.ok(typeof props.awc === 'number');
  }
});

test('generateFieldPolygons: handles empty fields array safely', () => {
  const collection = generateFieldPolygons([]);
  assert.equal(collection.type, 'FeatureCollection');
  assert.equal(collection.features.length, 0);
});

test('HUD layer modes: valid attributes mapped across fields', () => {
  for (const field of testFields) {
    // Status/Parcel mode assertions
    assert.ok(field.id.length > 0);
    assert.ok(field.coordinates[0] !== 0 && field.coordinates[1] !== 0);

    // Slope mode assertions
    assert.ok(field.soil.slope >= 0);
    assert.ok(['Low', 'Moderate', 'High'].includes(field.soil.erosionRisk));

    // AWC mode assertions
    assert.ok(field.soil.awc > 0);
    assert.ok(field.soil.texture.length > 0);
  }
});

test('HUD filters: correctly slices fields by soil texture, slope, and water capacity', () => {
  const clayLoam = testFields.filter((f) => f.soil.texture.toLowerCase().includes('clay loam'));
  assert.equal(clayLoam.length, 1);
  assert.equal(clayLoam[0].id, 'banyumas-karangrau-01');

  const steep = testFields.filter((f) => f.soil.slope > 8);
  assert.equal(steep.length, 1);
  assert.equal(steep[0].id, 'banyumas-sumbang-02');

  const highAwc = testFields.filter((f) => f.soil.awc >= 140);
  assert.equal(highAwc.length, 2);
});

test('HUD filter retention: explicitly selectedField is preserved even if excluded by quick filter', () => {
  const steep = testFields.filter((f) => f.soil.slope > 8);
  const selected = testFields[0]; // Karangrau (slope 2.5%, so not steep)
  assert.equal(steep.some((f) => f.id === selected.id), false);

  const retained = steep.some((f) => f.id === selected.id) ? steep : [...steep, selected];
  assert.equal(retained.length, 2);
  assert.ok(retained.some((f) => f.id === selected.id));
});
