export type StickerSize = 'xs' | 'sm' | 'md' | 'lg';

export const METRIC_STICKER_TYPES = ['area', 'slope', 'elevation', 'awc', 'pedology'] as const;
export type MetricStickerType = (typeof METRIC_STICKER_TYPES)[number];

export const SIZE_PX: Record<StickerSize, number> = {
  xs: 16,
  sm: 22,
  md: 32,
  lg: 48,
};

export const normalizeCropKey = (rawName: string): string => {
  const lower = rawName.toLowerCase().trim();
  if (lower.includes('padi') || lower.includes('rice') || lower.includes('paddy')) return 'rice';
  if (lower.includes('jagung') || lower.includes('maize') || lower.includes('corn')) return 'maize';
  if (lower.includes('kedelai') || lower.includes('soy')) return 'soybean';
  if (lower.includes('kacang tanah') || lower.includes('groundnut') || lower.includes('peanut')) return 'groundnut';
  if (lower.includes('cabai') || lower.includes('chili') || lower.includes('pepper')) return 'chili';
  if (lower.includes('tomat') || lower.includes('tomato')) return 'tomato';
  if (lower.includes('bawang') || lower.includes('onion')) return 'onion';
  if (lower.includes('bera') || lower.includes('fallow') || lower.includes('istirahat')) return 'fallow';
  if (lower.includes('sorghum') || lower.includes('sorgum')) return 'sorghum';
  if (lower.includes('kacang hijau') || lower.includes('mungbean')) return 'mungbean';
  return 'default';
};

export const normalizeSeasonKey = (rawSeason: string): 'mt1' | 'mt2' | 'mt3' | 'default' => {
  const lower = rawSeason.toLowerCase().trim();
  if (
    lower.includes('mt2') ||
    lower.includes('wet_dry') ||
    lower.includes('gadu') ||
    lower.includes('mar–jun') ||
    lower.includes('mar-jun')
  ) {
    return 'mt2';
  }
  if (
    lower.includes('mt3') ||
    lower.includes('dry') ||
    lower.includes('kemarau') ||
    lower.includes('jul–okt') ||
    lower.includes('jul-oct')
  ) {
    return 'mt3';
  }
  if (
    lower.includes('mt1') ||
    lower.includes('wet') ||
    lower.includes('rendengan') ||
    lower.includes('hujan')
  ) {
    return 'mt1';
  }
  return 'default';
};
