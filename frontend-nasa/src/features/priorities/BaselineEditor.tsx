import React from 'react';
import { Sprout, RotateCcw } from 'lucide-react';
import type { Language } from '../../types/landing';
import { getCropLabel, getSeasonLabel } from '../../lib/cropTranslation';

interface BaselineEditorProps {
  seasons: string[];
  cropLabels: Record<string, string>;
  value: Record<string, string>;
  initial: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  currentLang?: Language;
}

/**
 * The farmer's current rotation for one year. It replaces the default baseline in the engine,
 * so every alternative is compared against what this farmer actually grows.
 */
export const BaselineEditor: React.FC<BaselineEditorProps> = ({
  seasons,
  cropLabels,
  value,
  initial,
  onChange,
  currentLang = 'id',
}) => {
  const isId = currentLang === 'id';
  const options = [
    ['fallow', isId ? 'Bera / Istirahat' : 'Fallow / rest'],
    ...Object.entries(cropLabels)
      .filter(([key]) => key !== 'fallow')
      .map(([key]) => [key, getCropLabel(key, currentLang)]),
  ];
  const changed = seasons.some((s) => (value[s] ?? 'fallow') !== (initial[s] ?? 'fallow'));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-[#1a7a6d] uppercase">
            {isId ? '/ ROTASI SAAT INI (BASELINE)' : '/ CURRENT ROTATION (BASELINE)'}
          </span>
          <h3 className="mt-1 flex items-center gap-2 text-base font-bold text-gray-900">
            <Sprout className="h-4 w-4 text-[#1a7a6d]" />
            {isId ? 'Pola tanam petani sekarang' : 'Current farmer crop sequence'}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {isId
              ? 'Isi sesuai yang benar-benar ditanam. Semua strategi alternatif dibandingkan terhadap pola ini.'
              : 'Select actual crops planted per season. All alternative strategies are benchmarked against this rotation.'}
          </p>
        </div>
        {changed && (
          <button
            type="button"
            onClick={() => onChange(initial)}
            className="inline-flex items-center gap-1.5 self-start rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:border-[#1a7a6d] hover:text-[#1a7a6d] transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{isId ? 'Kembalikan' : 'Reset'}</span>
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {seasons.map((season) => (
          <label key={season} className="flex flex-col gap-1 text-xs">
            <span className="font-semibold text-gray-700">{getSeasonLabel(season, currentLang)}</span>
            <select
              value={value[season] ?? 'fallow'}
              onChange={(e) => onChange({ ...value, [season]: e.target.value })}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-[#1a7a6d] focus:outline-hidden"
            >
              {options.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
};
