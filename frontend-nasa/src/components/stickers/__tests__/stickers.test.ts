import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCropKey, normalizeSeasonKey } from '../stickerUtils.ts';

test('normalizeCropKey: normalizes synonyms and crop strings', () => {
  assert.equal(normalizeCropKey('rice'), 'rice');
  assert.equal(normalizeCropKey('Padi Sawah'), 'rice');
  assert.equal(normalizeCropKey('Paddy (Wet Season)'), 'rice');

  assert.equal(normalizeCropKey('maize'), 'maize');
  assert.equal(normalizeCropKey('Corn (maize)'), 'maize');
  assert.equal(normalizeCropKey('Jagung Hibrida'), 'maize');

  assert.equal(normalizeCropKey('soybean'), 'soybean');
  assert.equal(normalizeCropKey('Kedelai Anjasmoro'), 'soybean');

  assert.equal(normalizeCropKey('groundnut'), 'groundnut');
  assert.equal(normalizeCropKey('Kacang Tanah'), 'groundnut');
  assert.equal(normalizeCropKey('peanut'), 'groundnut');

  assert.equal(normalizeCropKey('chili'), 'chili');
  assert.equal(normalizeCropKey('Cabai'), 'chili');

  assert.equal(normalizeCropKey('tomato'), 'tomato');
  assert.equal(normalizeCropKey('Tomat'), 'tomato');

  assert.equal(normalizeCropKey('onion'), 'onion');
  assert.equal(normalizeCropKey('Bawang Merah'), 'onion');

  assert.equal(normalizeCropKey('fallow'), 'fallow');
  assert.equal(normalizeCropKey('Lahan Bera'), 'fallow');
  assert.equal(normalizeCropKey('Bera / Istirahat'), 'fallow');

  // Fallback
  assert.equal(normalizeCropKey('unknown_crop'), 'default');
});

test('normalizeSeasonKey: parses Indonesian and English season keys', () => {
  assert.equal(normalizeSeasonKey('MT1_wet'), 'mt1');
  assert.equal(normalizeSeasonKey('MT1 Nov–Feb'), 'mt1');
  assert.equal(normalizeSeasonKey('Musim Penghujan (Rendengan)'), 'mt1');

  assert.equal(normalizeSeasonKey('MT2_wet_dry'), 'mt2');
  assert.equal(normalizeSeasonKey('MT2 Mar–Jun'), 'mt2');
  assert.equal(normalizeSeasonKey('Musim Gadu'), 'mt2');

  assert.equal(normalizeSeasonKey('MT3_dry'), 'mt3');
  assert.equal(normalizeSeasonKey('MT3 Jul–Oct'), 'mt3');
  assert.equal(normalizeSeasonKey('Musim Kemarau'), 'mt3');

  assert.equal(normalizeSeasonKey('winter_recharge'), 'default');
});

test('normalizeCropKey: handles empty or invalid crop strings gracefully', () => {
  assert.equal(normalizeCropKey(''), 'default');
  assert.equal(normalizeCropKey('   '), 'default');
  assert.equal(normalizeCropKey('alfalfa ×3 yr'), 'default');
});
