import type { Language } from '../types/landing';

export const CROP_NAMES: Record<string, { id: string; en: string }> = {
  rice: { id: 'Padi (Sawah)', en: 'Rice (paddy)' },
  paddy: { id: 'Padi (Sawah)', en: 'Rice (paddy)' },
  maize: { id: 'Jagung', en: 'Corn (maize)' },
  corn: { id: 'Jagung', en: 'Corn (maize)' },
  soybean: { id: 'Kedelai', en: 'Soybean' },
  groundnut: { id: 'Kacang Tanah', en: 'Groundnut' },
  peanut: { id: 'Kacang Tanah', en: 'Groundnut' },
  chili: { id: 'Cabai', en: 'Chili pepper' },
  tomato: { id: 'Tomat', en: 'Tomato' },
  onion: { id: 'Bawang Merah', en: 'Onion (dry)' },
  fallow: { id: 'Bera / Istirahat', en: 'Fallow / rest' },
  sorghum: { id: 'Sorgum', en: 'Sorghum' },
  mungbean: { id: 'Kacang Hijau', en: 'Mung bean' },
  clover: { id: 'Semanggi (Cover crop)', en: 'Clover cover crop' },
  alfalfa: { id: 'Alfalfa', en: 'Alfalfa' },
  winter_wheat: { id: 'Gandum Musim Dingin', en: 'Winter wheat' },
  triticale: { id: 'Triticale', en: 'Triticale' },
  vegetables: { id: 'Sayuran', en: 'Vegetables' },
  cabbage: { id: 'Kubis', en: 'Cabbage' },
  leek: { id: 'Daun Bawang', en: 'Leek' },
};

export const SEASON_TRANSLATIONS: Record<string, { id: string; en: string }> = {
  MT1_wet: { id: 'MT1 (Nov–Feb)', en: 'MT1 (Nov–Feb)' },
  MT2_wet_dry: { id: 'MT2 (Mar–Jun)', en: 'MT2 (Mar–Jun)' },
  MT3_dry: { id: 'MT3 (Jul–Okt)', en: 'MT3 (Jul–Oct)' },
  winter_recharge: { id: 'Pengisian Air (Nov–Mar)', en: 'Winter Recharge (Nov–Mar)' },
  growing: { id: 'Musim Tanam (Apr–Sep)', en: 'Growing Season (Apr–Sep)' },
};

/**
 * Returns translated crop label by crop key (e.g. 'rice', 'maize', 'soybean').
 */
export function getCropLabel(cropKey: string, lang: Language = 'id'): string {
  const normalized = cropKey.trim().toLowerCase();
  const entry = CROP_NAMES[normalized];
  if (entry) {
    return entry[lang];
  }
  // Check substring matches
  for (const [key, val] of Object.entries(CROP_NAMES)) {
    if (normalized.includes(key)) {
      return val[lang];
    }
  }
  // Fallback to title-casing the key
  const cleaned = cropKey.replace(/_/g, ' ');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Returns translated season label by season key.
 */
export function getSeasonLabel(seasonKey: string, lang: Language = 'id'): string {
  const entry = SEASON_TRANSLATIONS[seasonKey];
  if (entry) {
    return entry[lang];
  }
  if (seasonKey.includes('MT1')) return lang === 'id' ? 'MT1 (Nov–Feb)' : 'MT1 (Nov–Feb)';
  if (seasonKey.includes('MT2')) return lang === 'id' ? 'MT2 (Mar–Jun)' : 'MT2 (Mar–Jun)';
  if (seasonKey.includes('MT3')) return lang === 'id' ? 'MT3 (Jul–Okt)' : 'MT3 (Jul–Oct)';
  return seasonKey;
}

/**
 * Formats a crop sequence element (e.g. "MT1 Nov–Feb: rice" or "rice / maize / groundnut").
 */
export function formatCropSequenceItem(item: string, lang: Language = 'id'): string {
  const colonIndex = item.indexOf(':');
  if (colonIndex !== -1) {
    const rawSeason = item.slice(0, colonIndex).trim();
    const rawCrop = item.slice(colonIndex + 1).trim();

    let translatedSeason = rawSeason;
    if (/MT1/i.test(rawSeason)) {
      translatedSeason = lang === 'id' ? 'MT1 (Nov–Feb)' : 'MT1 (Nov–Feb)';
    } else if (/MT2/i.test(rawSeason)) {
      translatedSeason = lang === 'id' ? 'MT2 (Mar–Jun)' : 'MT2 (Mar–Jun)';
    } else if (/MT3/i.test(rawSeason)) {
      translatedSeason = lang === 'id' ? 'MT3 (Jul–Okt)' : 'MT3 (Jul–Oct)';
    }

    const translatedCrop = getCropLabel(rawCrop, lang);
    return `${translatedSeason}: ${translatedCrop}`;
  }

  if (item.includes('/')) {
    const parts = item.split('/');
    const translatedParts = parts.map((p) => {
      // Check for year multiplier (e.g. "fallow ×2 yr" or "fallow x2 yr")
      const yrMatch = p.match(/(.*?)\s*[×x]\s*(\d+)\s*yr/i);
      if (yrMatch) {
        const crop = getCropLabel(yrMatch[1].trim(), lang);
        const count = yrMatch[2];
        return `${crop} ×${count} ${lang === 'id' ? 'thn' : 'yr'}`;
      }
      return getCropLabel(p.trim(), lang);
    });
    return translatedParts.join(' / ');
  }

  return getCropLabel(item, lang);
}

const STRATEGY_TITLE_LOOKUP: Record<string, { id: string; en: string }> = {
  'Rice - maize - groundnut (diversified)': {
    id: 'Padi - Jagung - Kacang Tanah (Diversifikasi)',
    en: 'Rice - Maize - Groundnut (Diversified)',
  },
  'Rice - rice - soybean in the dry season': {
    id: 'Padi - Padi - Kedelai (Musim Kemarau)',
    en: 'Rice - Rice - Soybean in the Dry Season',
  },
  'Assumed current: rice - rice - dry-season fallow': {
    id: 'Pola Eksisting: Padi - Padi - Bera Kemarau',
    en: 'Current Baseline: Rice - Rice - Dry-Season Fallow',
  },
};

/**
 * Formats strategy titles for bilingual display.
 */
export function formatStrategyTitle(title: string, lang: Language = 'id'): string {
  const directMatch = STRATEGY_TITLE_LOOKUP[title.trim()];
  if (directMatch) {
    return directMatch[lang];
  }

  if (lang === 'en') {
    return title;
  }

  // Indonesian rule-based replacement
  let res = title;
  res = res.replace(/Assumed current:\s*/i, 'Pola Eksisting: ');
  res = res.replace(/in the dry season/gi, 'di Musim Kemarau');
  res = res.replace(/\(diversified\)/gi, '(Diversifikasi)');
  res = res.replace(/dry-season fallow/gi, 'Bera Kemarau');
  res = res.replace(/\brice\b/gi, 'Padi');
  res = res.replace(/\bmaize\b/gi, 'Jagung');
  res = res.replace(/\bcorn\b/gi, 'Jagung');
  res = res.replace(/\bsoybean\b/gi, 'Kedelai');
  res = res.replace(/\bgroundnut\b/gi, 'Kacang Tanah');
  res = res.replace(/\bchili\b/gi, 'Cabai');
  res = res.replace(/\btomato\b/gi, 'Tomat');
  res = res.replace(/\bonion\b/gi, 'Bawang Merah');
  res = res.replace(/\bfallow\b/gi, 'Bera');
  return res;
}

const ROTATION_LOOKUP: Record<string, { id: string; en: string }> = {
  'Paddy (Wet Season)': { id: 'Padi Sawah (Musim Hujan)', en: 'Paddy (Wet Season)' },
  'Paddy (Dry Season 1)': { id: 'Padi Gadu (Musim Kemarau 1)', en: 'Paddy (Dry Season 1)' },
  'Fallow (Dry Season 2)': { id: 'Lahan Bera (Musim Kemarau 2)', en: 'Fallow (Dry Season 2)' },
  'Horticulture (Chili/Tomato)': { id: 'Hortikultura (Cabai/Tomat)', en: 'Horticulture (Chili/Tomato)' },
  Fallow: { id: 'Lahan Bera', en: 'Fallow' },
  'Highland Vegetables & Chili (Nov-Feb)': {
    id: 'Sayuran Dataran Tinggi & Cabai (Nov–Feb)',
    en: 'Highland Vegetables & Chili (Nov–Feb)',
  },
  'Cabbage & Leek (Mar-Jun)': { id: 'Kubis & Daun Bawang (Mar–Jun)', en: 'Cabbage & Leek (Mar–Jun)' },
  'Severe Slope Runoff Fallow (Jul-Oct)': {
    id: 'Bera Lereng Kering (Jul–Okt)',
    en: 'Severe Slope Runoff Fallow (Jul–Oct)',
  },
  'Paddy Rendengan (Nov-Feb)': { id: 'Padi Rendengan (Nov–Feb)', en: 'Wet-Season Rice (Nov–Feb)' },
  'Soybean (Anjasmoro) (Mar-Jun)': {
    id: 'Kedelai Anjasmoro (Mar–Jun)',
    en: 'Soybean (Anjasmoro) (Mar–Jun)',
  },
  'Hybrid Corn / Fallow (Jul-Oct)': {
    id: 'Jagung Hibrida / Bera (Jul–Okt)',
    en: 'Hybrid Corn / Fallow (Jul–Oct)',
  },
  'Deepwater Wet Paddy (Nov-Feb)': {
    id: 'Padi Rendengan Rawa (Nov–Feb)',
    en: 'Deepwater Wet Paddy (Nov–Feb)',
  },
  'Gadu Paddy (Mar-Jun)': { id: 'Padi Gadu (Mar–Jun)', en: 'Dry-Season Paddy (Mar–Jun)' },
  'Severe Drought Fallow & Cracking (Jul-Oct)': {
    id: 'Bera Cekaman Kekeringan (Jul–Okt)',
    en: 'Severe Drought Fallow & Soil Cracking (Jul–Oct)',
  },
  'Technical Irrigated Paddy MT1 (Nov-Feb)': {
    id: 'Padi Irigasi Teknis MT1 (Nov–Feb)',
    en: 'Technical Irrigated Paddy MT1 (Nov–Feb)',
  },
  'Technical Irrigated Paddy MT2 (Mar-Jun)': {
    id: 'Padi Irigasi Teknis MT2 (Mar–Jun)',
    en: 'Technical Irrigated Paddy MT2 (Mar–Jun)',
  },
  'Dry Season Fallow / Rationing (Jul-Oct)': {
    id: 'Bera Gilir Air Kemarau (Jul–Okt)',
    en: 'Dry Season Fallow / Rationing (Jul–Oct)',
  },
};

/**
 * Formats free-text farmer rotation strings into translated equivalents.
 */
export function formatFreeRotationItem(text: string, lang: Language = 'id'): string {
  const match = ROTATION_LOOKUP[text.trim()];
  if (match) {
    return match[lang];
  }
  return text;
}
