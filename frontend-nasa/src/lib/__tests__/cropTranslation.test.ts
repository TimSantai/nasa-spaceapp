import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getCropLabel,
  getSeasonLabel,
  formatCropSequenceItem,
  formatStrategyTitle,
  formatFreeRotationItem,
} from '../cropTranslation.ts';

test('getCropLabel: translates crops to Indonesian and English accurately', () => {
  assert.equal(getCropLabel('rice', 'id'), 'Padi (Sawah)');
  assert.equal(getCropLabel('rice', 'en'), 'Rice (paddy)');

  assert.equal(getCropLabel('maize', 'id'), 'Jagung');
  assert.equal(getCropLabel('maize', 'en'), 'Corn (maize)');

  assert.equal(getCropLabel('soybean', 'id'), 'Kedelai');
  assert.equal(getCropLabel('soybean', 'en'), 'Soybean');

  assert.equal(getCropLabel('groundnut', 'id'), 'Kacang Tanah');
  assert.equal(getCropLabel('groundnut', 'en'), 'Groundnut');

  assert.equal(getCropLabel('fallow', 'id'), 'Bera / Istirahat');
  assert.equal(getCropLabel('fallow', 'en'), 'Fallow / rest');

  assert.equal(getCropLabel('chili', 'id'), 'Cabai');
  assert.equal(getCropLabel('tomato', 'id'), 'Tomat');
  assert.equal(getCropLabel('onion', 'id'), 'Bawang Merah');

  // Snake case fallback
  assert.equal(getCropLabel('sweet_potato', 'id'), 'Sweet potato');
});

test('getSeasonLabel: formats seasons with dates in Indonesian and English', () => {
  assert.equal(getSeasonLabel('MT1_wet', 'id'), 'MT1 (Nov–Feb)');
  assert.equal(getSeasonLabel('MT1_wet', 'en'), 'MT1 (Nov–Feb)');

  assert.equal(getSeasonLabel('MT2_wet_dry', 'id'), 'MT2 (Mar–Jun)');
  assert.equal(getSeasonLabel('MT3_dry', 'id'), 'MT3 (Jul–Okt)');
  assert.equal(getSeasonLabel('MT3_dry', 'en'), 'MT3 (Jul–Oct)');
});

test('formatCropSequenceItem: translates colon-separated and slash-separated items', () => {
  assert.equal(formatCropSequenceItem('MT1 Nov–Feb: rice', 'id'), 'MT1 (Nov–Feb): Padi (Sawah)');
  assert.equal(formatCropSequenceItem('MT1 Nov–Feb: rice', 'en'), 'MT1 (Nov–Feb): Rice (paddy)');

  assert.equal(formatCropSequenceItem('MT2 Mar–Jun: maize', 'id'), 'MT2 (Mar–Jun): Jagung');
  assert.equal(formatCropSequenceItem('MT3 Jul–Oct: groundnut', 'id'), 'MT3 (Jul–Okt): Kacang Tanah');

  assert.equal(formatCropSequenceItem('rice / maize / fallow', 'id'), 'Padi (Sawah) / Jagung / Bera / Istirahat');
  assert.equal(formatCropSequenceItem('rice / rice / fallow ×2 yr', 'id'), 'Padi (Sawah) / Padi (Sawah) / Bera / Istirahat ×2 thn');
  assert.equal(formatCropSequenceItem('rice / rice / fallow x2 yr', 'id'), 'Padi (Sawah) / Padi (Sawah) / Bera / Istirahat ×2 thn');
});

test('formatStrategyTitle: translates strategy names', () => {
  assert.equal(
    formatStrategyTitle('Rice - maize - groundnut (diversified)', 'id'),
    'Padi - Jagung - Kacang Tanah (Diversifikasi)',
  );
  assert.equal(
    formatStrategyTitle('Rice - maize - groundnut (diversified)', 'en'),
    'Rice - Maize - Groundnut (Diversified)',
  );

  assert.equal(
    formatStrategyTitle('Rice - rice - soybean in the dry season', 'id'),
    'Padi - Padi - Kedelai (Musim Kemarau)',
  );

  assert.equal(
    formatStrategyTitle('Assumed current: rice - rice - dry-season fallow', 'id'),
    'Pola Eksisting: Padi - Padi - Bera Kemarau',
  );
});

test('formatFreeRotationItem: translates snapshot free-text rotations', () => {
  assert.equal(formatFreeRotationItem('Paddy (Wet Season)', 'id'), 'Padi Sawah (Musim Hujan)');
  assert.equal(formatFreeRotationItem('Paddy (Wet Season)', 'en'), 'Paddy (Wet Season)');

  assert.equal(formatFreeRotationItem('Paddy (Dry Season 1)', 'id'), 'Padi Gadu (Musim Kemarau 1)');
  assert.equal(formatFreeRotationItem('Fallow (Dry Season 2)', 'id'), 'Lahan Bera (Musim Kemarau 2)');
});
