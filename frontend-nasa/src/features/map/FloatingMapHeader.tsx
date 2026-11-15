import React from 'react';
import { Sprout, BookOpen, Home, Layers, Globe } from 'lucide-react';
import type { Language } from '../../types/landing';

interface FloatingMapHeaderProps {
  currentLang?: Language;
  onToggleLang?: () => void;
  onOpenGlossary: () => void;
  onOpenDataSources: () => void;
  onBackToLanding: () => void;
  selectedVillage: string;
  dataMode?: 'live' | 'snapshot';
}

export const FloatingMapHeader: React.FC<FloatingMapHeaderProps> = ({
  currentLang = 'id',
  onToggleLang,
  onOpenGlossary,
  onOpenDataSources,
  onBackToLanding,
  selectedVillage,
  dataMode = 'snapshot',
}) => {
  const isId = currentLang === 'id';

  return (
    <header className="pointer-events-none fixed top-4 right-4 left-4 z-40 flex flex-wrap items-center justify-between gap-3">
      {/* Brand Card (Glassmorphic) */}
      <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-[#E6EBF0] bg-white/95 px-4 py-2.5 shadow-float backdrop-blur-md">
        <button
          onClick={onBackToLanding}
          className="group flex items-center gap-2.5 text-left"
          title={isId ? 'Kembali ke Beranda' : 'Back to Home'}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F1F3] text-[#237F8E] transition group-hover:bg-[#237F8E] group-hover:text-white">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-[#14232B]">
                FIELD <span className="text-[#237F8E]">SHIFT</span>
              </span>
              <span className="rounded-full bg-[#E3F1F3] px-2 py-0.5 text-[10px] font-bold text-[#1B6572] border border-[#237F8E]/20">
                3D Map Hub
              </span>
            </div>
            <p className="text-[11px] text-[#5F6B74]">
              {selectedVillage} &middot; <span className="underline decoration-dotted text-[#237F8E]">{isId ? 'Beranda' : 'Home'}</span>
            </p>
          </div>
        </button>
      </div>

      {/* Floating Utilities */}
      <div className="pointer-events-auto flex items-center gap-2">
        {/* Real-time backend & NASA Satellite Sync status indicator */}
        <button
          onClick={onOpenDataSources}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-float backdrop-blur-md transition-all duration-150 active:scale-95 cursor-pointer ${
            dataMode === 'live'
              ? 'border-emerald-200 bg-emerald-50/95 text-emerald-800 hover:bg-emerald-100'
              : 'border-sky-200 bg-sky-50/95 text-sky-800 hover:bg-sky-100'
          }`}
          title={
            dataMode === 'live'
              ? (isId ? 'Terhubung live ke backend & satelit NASA' : 'Connected live to backend & NASA satellites')
              : (isId ? 'Menggunakan data snapshot NASA POWER & SoilGrids terarsip' : 'Using cached NASA POWER & SoilGrids snapshot')
          }
        >
          <span className="relative flex h-2 w-2">
            {dataMode === 'live' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                dataMode === 'live' ? 'bg-emerald-500' : 'bg-sky-500'
              }`}
            />
          </span>
          <span className="text-[11px] font-bold">
            {dataMode === 'live' ? 'NASA Live' : 'NASA Cache'}
          </span>
        </button>

        <button
          onClick={onOpenDataSources}
          className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#E6EBF0] bg-white/95 px-3.5 py-2 text-xs font-semibold text-[#14232B] shadow-float backdrop-blur-md transition-all duration-150 active:scale-95 hover:border-[#237F8E] hover:text-[#237F8E] cursor-pointer motion-reduce:transition-none"
        >
          <Layers className="h-3.5 w-3.5 text-[#237F8E]" />
          <span>{isId ? 'Katalog Data (26)' : 'Data Catalog (26)'}</span>
        </button>

        <button
          onClick={onOpenGlossary}
          className="hidden md:flex items-center gap-1.5 rounded-full border border-[#E6EBF0] bg-white/95 px-3.5 py-2 text-xs font-semibold text-[#14232B] shadow-float backdrop-blur-md transition-all duration-150 active:scale-95 hover:border-[#237F8E] hover:text-[#237F8E] cursor-pointer motion-reduce:transition-none"
        >
          <BookOpen className="h-3.5 w-3.5 text-[#237F8E]" />
          <span>{isId ? 'Glosarium' : 'Glossary'}</span>
        </button>

        {onToggleLang && (
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 rounded-full border border-[#E6EBF0] bg-white/95 px-3 py-2 text-xs font-bold text-[#14232B] shadow-float backdrop-blur-md hover:border-[#237F8E] transition-all duration-150 active:scale-95 cursor-pointer motion-reduce:transition-none"
            title={isId ? 'Ganti Bahasa' : 'Switch Language'}
          >
            <Globe className="h-3.5 w-3.5 text-[#237F8E]" />
            <span className="uppercase">{currentLang}</span>
          </button>
        )}

        <button
          onClick={onBackToLanding}
          className="flex items-center gap-1.5 rounded-full bg-[#237F8E] px-4 py-2 text-xs font-bold text-white shadow-float transition-all duration-150 active:scale-95 hover:bg-[#1B6572] cursor-pointer motion-reduce:transition-none"
        >
          <Home className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{isId ? 'Beranda' : 'Home'}</span>
        </button>
      </div>
    </header>
  );
};
