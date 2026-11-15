import React from 'react';
import type { FieldProfile } from '../../types/domain';
import type { Language } from '../../types/landing';
import { X, ArrowRight, Layers, CheckCircle2, Sprout, Satellite } from 'lucide-react';

interface PlotDetailSideCardProps {
  field: FieldProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAnalysis: (field: FieldProfile) => void;
  currentLang?: Language;
}

export const PlotDetailSideCard: React.FC<PlotDetailSideCardProps> = ({
  field,
  isOpen,
  onClose,
  onOpenAnalysis,
  currentLang = 'id',
}) => {
  const isId = currentLang === 'id';

  // Retain last active field in state during prop changes without triggering cascading effect renders
  const [prevField, setPrevField] = React.useState<FieldProfile | null>(field);
  const [cachedField, setCachedField] = React.useState<FieldProfile | null>(field);

  if (field !== prevField) {
    setPrevField(field);
    if (field) {
      setCachedField(field);
    }
  }

  const activeField = field ?? cachedField;
  if (!activeField) return null;

  return (
    <aside
      className={`fixed left-4 right-4 top-20 z-40 max-w-sm sm:left-auto sm:right-4 sm:max-w-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${isOpen
        ? 'translate-x-0 opacity-100 pointer-events-auto'
        : 'translate-x-12 opacity-0 pointer-events-none'
        }`}
      aria-hidden={!isOpen}
      aria-label="Panel Detail Petak"
    >
      <div className="max-h-[calc(100vh-6rem)] overflow-y-auto rounded-3xl border border-[#E6EBF0] bg-white/95 p-6 shadow-float backdrop-blur-md text-[#14232B]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E6EBF0] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-[#E3F1F3] px-2.5 py-0.5 text-[10px] font-bold text-[#1B6572] border border-[#237F8E]/20">
                <CheckCircle2 className="h-3 w-3" />
                {isId ? 'Petak Terpilih' : 'Selected Plot'}
              </span>
              <span className="text-[11px] font-mono text-[#5F6B74]">Ref: {activeField.id}</span>
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-[#14232B]">{activeField.name}</h2>
            <p className="text-xs text-[#5F6B74]">
              Desa {activeField.village}, Kec. {activeField.district}, Kab. {activeField.regency}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition active:scale-95 cursor-pointer"
            aria-label="Tutup panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 4 Core Quantitative Metrics */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
          <div className="rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] p-3">
            <span className="text-[10px] font-semibold text-[#5F6B74] block uppercase">
              {isId ? 'Luas Lahan' : 'Plot Area'}
            </span>
            <p className="mt-1 text-base font-bold text-[#14232B] tabular-nums">
              {activeField.areaHectares} <span className="text-xs font-normal text-[#5F6B74]">ha</span>
            </p>
          </div>

          <div className="rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] p-3">
            <span className="text-[10px] font-semibold text-[#5F6B74] block uppercase">
              {isId ? 'Kemiringan Lereng' : 'Terrain Slope'}
            </span>
            <p className="mt-1 text-base font-bold text-[#14232B] tabular-nums">
              {activeField.soil.slope}% <span className="text-xs font-normal text-[#5F6B74]">({activeField.soil.erosionRisk})</span>
            </p>
          </div>

          <div className="rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] p-3">
            <span className="text-[10px] font-semibold text-[#5F6B74] block uppercase">
              {isId ? 'Ketinggian Elevasi' : 'Elevation'}
            </span>
            <p className="mt-1 text-base font-bold text-[#14232B] tabular-nums">
              {activeField.elevationMeters} <span className="text-xs font-normal text-[#5F6B74]">mdpl</span>
            </p>
          </div>

          <div className="rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] p-3">
            <span className="text-[10px] font-semibold text-[#5F6B74] block uppercase">
              {isId ? 'Kapasitas Air (AWC)' : 'Water Capacity'}
            </span>
            <p className="mt-1 text-base font-bold text-[#237F8E] tabular-nums">
              {activeField.soil.awc} <span className="text-xs font-normal text-[#5F6B74]">mm</span>
            </p>
          </div>
        </div>

        {/* Pedology & Soil Context */}
        <div className="mt-4 rounded-xl border border-[#E6EBF0] bg-white p-3.5 text-xs">
          <div className="flex items-center gap-1.5 text-[#237F8E] font-bold text-[11px] uppercase tracking-wider">
            <Layers className="h-3.5 w-3.5" />
            <span>{isId ? 'Karakteristik Pedologi Tanah' : 'Pedology Profile'}</span>
          </div>
          <div className="mt-2 space-y-1.5 text-[#5F6B74]">
            <p className="flex justify-between">
              <span>{isId ? 'Tekstur Tanah' : 'Texture'}:</span>
              <strong className="text-[#14232B]">{activeField.soil.texture}</strong>
            </p>
            <p className="flex justify-between">
              <span>{isId ? 'Tipe Ordo Tanah' : 'Soil Order'}:</span>
              <strong className="text-[#14232B]">{activeField.soil.type}</strong>
            </p>
            <p className="flex justify-between">
              <span>{isId ? 'Bahan Organik (C-Org)' : 'Organic Matter'}:</span>
              <strong className="text-[#14232B]">{activeField.soil.organicMatter}</strong>
            </p>
          </div>
        </div>

        {/* Current Crop Practice */}
        <div className="mt-3 rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] p-3.5 text-xs">
          <div className="flex items-center gap-1.5 text-[#1E5B4F] font-bold text-[11px] uppercase tracking-wider">
            <Sprout className="h-3.5 w-3.5" />
            <span>{isId ? 'Pola Tanam Eksisting (Baseline)' : 'Existing Crop Sequence'}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {activeField.currentRotation.map((crop, idx) => (
              <span
                key={`${crop}-${idx}`}
                className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-medium text-[#14232B] border border-[#E6EBF0]"
              >
                {crop}
              </span>
            ))}
          </div>
        </div>

        {/* NASA Observation Sensor Tag */}
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#E3F1F3]/60 p-2.5 text-[11px] text-[#1B6572]">
          <Satellite className="h-4 w-4 shrink-0 text-[#237F8E]" />
          <span>
            {isId
              ? 'NASA POWER 1991–2025, SRTM 30 m dan SoilGrids; NDVI HLS dan SMAP menyusul.'
              : 'NASA POWER 1991–2025, SRTM 30 m & SoilGrids; HLS NDVI and SMAP being added.'}
          </span>
        </div>

        {/* Primary CTA Button to Full Analysis */}
        <div className="mt-5 pt-3 border-t border-[#E6EBF0]">
          <button
            onClick={() => onOpenAnalysis(activeField)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#237F8E] to-[#1E5B4F] px-5 py-3.5 text-xs font-bold text-white shadow-xs transition hover:from-[#1B6572] hover:to-[#17463c] active:scale-[0.98] cursor-pointer"
          >
            <span>{isId ? 'Buka Analisis Lahan & Agroklimat Lanjutan' : 'Deep-Dive Soil & Climatology'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-1.5 text-center text-[10px] text-[#5F6B74]">
            {isId ? 'Optimasi rotasi panen, kendala petani, dan lembar PPL' : 'Rotation optimizer, farmer constraints, & PPL brief'}
          </p>
        </div>
      </div>
    </aside>
  );
};
