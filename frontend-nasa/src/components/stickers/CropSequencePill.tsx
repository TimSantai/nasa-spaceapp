import React from 'react';
import type { Language } from '../../types/landing';
import { CropSticker, type StickerSize } from './CropSticker';
import { SeasonSticker } from './SeasonSticker';
import { getCropLabel } from '../../lib/cropTranslation';

interface CropSequencePillProps {
  item: string;
  currentLang?: Language;
  size?: StickerSize;
  className?: string;
}

export const CropSequencePill: React.FC<CropSequencePillProps> = ({
  item,
  currentLang = 'id',
  size = 'sm',
  className = '',
}) => {
  const isId = currentLang === 'id';
  const colonIndex = item.indexOf(':');

  if (colonIndex !== -1) {
    const rawSeason = item.slice(0, colonIndex).trim();
    const rawCrop = item.slice(colonIndex + 1).trim();

    let displaySeason = rawSeason;
    let seasonTag = 'MT';
    if (/MT1/i.test(rawSeason)) {
      seasonTag = 'MT1';
      displaySeason = isId ? 'MT1 (Nov–Feb)' : 'MT1 (Nov–Feb)';
    } else if (/MT2/i.test(rawSeason)) {
      seasonTag = 'MT2';
      displaySeason = isId ? 'MT2 (Mar–Jun)' : 'MT2 (Mar–Jun)';
    } else if (/MT3/i.test(rawSeason)) {
      seasonTag = 'MT3';
      displaySeason = isId ? 'MT3 (Jul–Okt)' : 'MT3 (Jul–Oct)';
    }

    const translatedCrop = getCropLabel(rawCrop, currentLang);
    const tooltipText = `${displaySeason} · ${translatedCrop}`;

    return (
      <span
        title={tooltipText}
        className={`inline-flex items-center gap-1.5 rounded-full border border-gray-200/80 bg-white py-0.5 pl-1.5 pr-3 text-xs font-semibold text-gray-800 shadow-2xs transition hover:border-[#1a7a6d] hover:bg-[#F0FDF4] hover:shadow-xs ${className}`}
      >
        {/* Season Mini Sticker */}
        <SeasonSticker season={rawSeason} size={size} />

        {/* Season tag badge */}
        <span className="rounded bg-slate-100 px-1 py-0.5 text-[9px] font-bold tracking-tight text-slate-600 font-mono">
          {seasonTag}
        </span>

        {/* Crop Sticker */}
        <CropSticker name={rawCrop} size={size} />

        {/* Localized crop name */}
        <span className="text-[11px] leading-tight font-medium text-gray-900">
          {translatedCrop}
        </span>
      </span>
    );
  }

  // Handle multi-crop slash separated sequence (e.g. "rice / maize / fallow" or "rice ×2 yr")
  if (item.includes('/')) {
    const crops = item.split('/').map((c) => c.trim());
    return (
      <span
        className={`inline-flex flex-wrap items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-2xs ${className}`}
      >
        {crops.map((c, i) => {
          const yrMatch = c.match(/(.*?)\s*[×x]\s*(\d+)\s*yr/i);
          const cropName = yrMatch ? yrMatch[1].trim() : c;
          const count = yrMatch ? yrMatch[2] : null;
          const translated = getCropLabel(cropName, currentLang);

          return (
            <React.Fragment key={i}>
              <span className="inline-flex items-center gap-1">
                <CropSticker name={cropName} size="xs" />
                <span className="text-[11px]">
                  {translated}
                  {count && ` ×${count} ${isId ? 'thn' : 'yr'}`}
                </span>
              </span>
              {i < crops.length - 1 && <span className="text-gray-300">/</span>}
            </React.Fragment>
          );
        })}
      </span>
    );
  }

  // Single crop fallback (with possible multi-year multiplier e.g. "alfalfa ×3 yr")
  const yrMatch = item.match(/(.*?)\s*[×x]\s*(\d+)\s*yr/i);
  const cropName = yrMatch ? yrMatch[1].trim() : item;
  const count = yrMatch ? yrMatch[2] : null;
  const translated = getCropLabel(cropName, currentLang);
  const label = count ? `${translated} ×${count} ${isId ? 'thn' : 'yr'}` : translated;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white py-0.5 pl-1.5 pr-2.5 text-xs font-semibold text-gray-800 shadow-2xs ${className}`}
      title={label}
    >
      <CropSticker name={cropName} size={size} />
      <span className="text-[11px] font-medium text-gray-900">{label}</span>
    </span>
  );
};
