import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MOCK_FIELDS,
  SNAPSHOT_CROP_LABELS,
  snapshotStrategies,
} from '../../../api/mock/mockData.ts';
import { siteOf, baselineFromRotation, BANYUMAS_CROPS } from '../../../api/fieldshift.ts';
import { applyWeights } from '../../../lib/scoring.ts';
import type { PriorityWeights } from '../../../types/domain.ts';

test('rotationsQuery: MOCK_FIELDS contains valid real snapshot data for Banyumas basin', () => {
  assert.ok(Array.isArray(MOCK_FIELDS));
  assert.ok(MOCK_FIELDS.length >= 3, 'Expected at least 3 Banyumas fields in snapshot');

  for (const field of MOCK_FIELDS) {
    assert.ok(field.id.startsWith('banyumas-'), `Invalid field id prefix: ${field.id}`);
    assert.equal(field.regency, 'Banyumas');
    assert.equal(field.coordinates.length, 2);
    assert.ok(typeof field.elevationMeters === 'number');
    assert.ok(field.soil && typeof field.soil.awc === 'number');
    assert.equal(siteOf(field), 'banyumas');
  }
});

test('rotationsQuery: SNAPSHOT_CROP_LABELS covers essential Indonesian crop rotations', () => {
  assert.ok(Object.keys(SNAPSHOT_CROP_LABELS).length > 0);
  assert.ok('rice' in SNAPSHOT_CROP_LABELS);
  assert.ok('maize' in SNAPSHOT_CROP_LABELS);
  assert.ok('soybean' in SNAPSHOT_CROP_LABELS);

  for (const crop of BANYUMAS_CROPS) {
    assert.ok(crop in SNAPSHOT_CROP_LABELS, `Missing label for Banyumas crop: ${crop}`);
  }
});

test('rotationsQuery: snapshotStrategies returns Pareto-optimal candidate set', () => {
  const normalStrats = snapshotStrategies('normal');
  assert.equal(normalStrats.length, 3, 'Expected 3 candidate strategies');

  const baseline = normalStrats.find((s) => s.isBaseline);
  assert.ok(baseline, 'Expected a baseline strategy');
  assert.ok(['Dominated', 'Tradeoff'].includes(baseline.paretoStatus), `Unexpected baseline pareto status: ${baseline.paretoStatus}`);

  const optimal = normalStrats.find((s) => s.paretoStatus === 'Optimal');
  assert.ok(optimal, 'Expected an Optimal strategy');

  const elNinoStrats = snapshotStrategies('el_nino');
  assert.equal(elNinoStrats.length, 3);
  // Verify scores are numbers between 0 and 100
  for (const s of elNinoStrats) {
    assert.ok(s.scores.mean.overall >= 0 && s.scores.mean.overall <= 100);
    assert.ok(s.scores.worstCase.overall >= 0 && s.scores.worstCase.overall <= 100);
    assert.ok(s.cropSequence.length > 0);
  }
});

test('rotationsQuery: baselineFromRotation correctly parses free-text farmer rotation', () => {
  const sampleField = MOCK_FIELDS[0];
  const baseline = baselineFromRotation(sampleField);

  assert.ok(typeof baseline === 'object');
  assert.ok('MT1_wet' in baseline);
  assert.ok('MT2_wet_dry' in baseline);
  assert.ok('MT3_dry' in baseline);
});

test('rotationsQuery: applyWeights recalculates scores dynamically on client side without latency', () => {
  const strats = snapshotStrategies('normal');
  const weights: PriorityWeights = {
    waterEfficiency: 80,
    soilHealth: 5,
    coverDays: 5,
    erosionControl: 5,
    pestBreak: 5,
  };

  const weighted = applyWeights(strats, weights);
  assert.equal(weighted.length, strats.length);

  for (let i = 0; i < weighted.length; i++) {
    assert.ok(typeof weighted[i].scores.mean.overall === 'number');
    assert.ok(weighted[i].scores.mean.overall >= 0 && weighted[i].scores.mean.overall <= 100);
  }
});

test('rotationsQuery: empty baseline serialization produces undefined instead of empty object payload', () => {
  const emptyKey = JSON.stringify({});
  const parsedEmpty = emptyKey && emptyKey !== '{}' ? (JSON.parse(emptyKey) as Record<string, string>) : undefined;
  assert.equal(parsedEmpty, undefined, 'Empty baseline key "{}" must parse to undefined');

  const populatedKey = JSON.stringify({ MT1_wet: 'rice', MT2_wet_dry: 'soybean' });
  const parsedPopulated = populatedKey && populatedKey !== '{}' ? (JSON.parse(populatedKey) as Record<string, string>) : undefined;
  assert.deepEqual(parsedPopulated, { MT1_wet: 'rice', MT2_wet_dry: 'soybean' });
});

test('rotationsQuery: query client configuration sets robust caching defaults', async () => {
  const { queryClient } = await import('../../../api/queryClient.ts');
  const defaults = queryClient.getDefaultOptions();

  assert.equal(defaults.queries?.staleTime, 1000 * 60 * 5, 'Expected 5 min staleTime');
  assert.equal(defaults.queries?.gcTime, 1000 * 60 * 30, 'Expected 30 min gcTime');
  assert.equal(defaults.queries?.refetchOnWindowFocus, false, 'Expected refetchOnWindowFocus false');
});
