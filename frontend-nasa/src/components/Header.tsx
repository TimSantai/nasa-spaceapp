import React from 'react';
import { Sprout, BookOpen, Home, Layers, Globe } from 'lucide-react';
import type { Language } from '../types/landing';

interface HeaderProps {
  activeTab: 'map' | 'profile' | 'comparison' | 'export';
  onTabChange: (tab: 'map' | 'profile' | 'comparison' | 'export') => void;
  onOpenGlossary: () => void;
  onOpenDataSources?: () => void;
  onBackToLanding?: () => void;
  selectedVillage: string;
  currentLang?: Language;
  onToggleLang?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenGlossary,
  onOpenDataSources,
  onBackToLanding,
  selectedVillage,
  currentLang = 'id',
  onToggleLang,
}) => {
  const isId = currentLang === 'id';

  return (
    <header className="sticky top-0 z-40 border-b border-[#E6EBF0] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand & Landing Link */}
        <div className="flex items-center gap-3">
          {onBackToLanding ? (
            <button
              onClick={onBackToLanding}
              className="group flex items-center gap-2 rounded-2xl p-1 -ml-1 text-left hover:bg-[#F7F9FB] transition"
              title={isId ? 'Kembali ke Beranda Landing Page' : 'Back to Home Landing Page'}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E3F1F3] text-[#237F8E] shadow-xs group-hover:bg-[#237F8E] group-hover:text-white transition">
                <Sprout className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-[#14232B]">
                    FIELD <span className="text-[#237F8E]">SHIFT</span>
                  </span>
                  <span className="rounded-full bg-[#E3F1F3] px-2 py-0.5 text-[10px] font-bold text-[#1B6572] border border-[#237F8E]/20">
                    Workspace
                  </span>
                </div>
                <p className="text-[11px] text-[#5F6B74]">
                  ← <span className="underline decoration-dotted">{isId ? 'Kembali ke Beranda' : 'Back to Home'}</span> &middot; <span className="font-semibold text-[#14232B]">{selectedVillage}</span>
                </p>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E3F1F3] text-[#237F8E] shadow-xs">
                <Sprout className="h-5 w-5" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-[#14232B]">
                  FIELD <span className="text-[#237F8E]">SHIFT</span>
                </span>
                <p className="text-xs text-[#5F6B74]">{selectedVillage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs - AgriPluse Pill Switcher */}
        <nav className="flex items-center rounded-full border border-[#E6EBF0] bg-[#F7F9FB] p-1 text-xs font-semibold">
          <button
            onClick={() => onTabChange('map')}
            className={`rounded-full px-4 py-1.5 transition duration-150 ${
              activeTab === 'map'
                ? 'bg-[#237F8E] text-white shadow-xs font-bold'
                : 'text-[#5F6B74] hover:text-[#14232B]'
            }`}
          >
            {isId ? 'Peta & Petak' : 'Map & Plots'}
          </button>
          <button
            onClick={() => onTabChange('profile')}
            className={`rounded-full px-4 py-1.5 transition duration-150 ${
              activeTab === 'profile'
                ? 'bg-[#237F8E] text-white shadow-xs font-bold'
                : 'text-[#5F6B74] hover:text-[#14232B]'
            }`}
          >
            {isId ? 'Profil Lahan & Iklim' : 'Soil & Climatology'}
          </button>
          <button
            onClick={() => onTabChange('comparison')}
            className={`rounded-full px-4 py-1.5 transition duration-150 ${
              activeTab === 'comparison'
                ? 'bg-[#237F8E] text-white shadow-xs font-bold'
                : 'text-[#5F6B74] hover:text-[#14232B]'
            }`}
          >
            {isId ? 'Optimasi Rotasi' : 'Rotation Optimizer'}
          </button>
          <button
            onClick={() => onTabChange('export')}
            className={`rounded-full px-4 py-1.5 transition duration-150 ${
              activeTab === 'export'
                ? 'bg-[#237F8E] text-white shadow-xs font-bold'
                : 'text-[#5F6B74] hover:text-[#14232B]'
            }`}
          >
            {isId ? 'Lembar Penyuluh' : 'Consultation Brief'}
          </button>
        </nav>

        {/* Right CTA Buttons */}
        <div className="flex items-center gap-2">
          {onOpenDataSources && (
            <button
              onClick={onOpenDataSources}
              className="hidden md:flex items-center gap-1.5 rounded-full border border-[#E6EBF0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#14232B] shadow-xs transition hover:border-[#237F8E] hover:text-[#237F8E]"
            >
              <Layers className="h-3.5 w-3.5 text-[#237F8E]" />
              <span>{isId ? 'Katalog Data (26)' : 'Data Catalog (26)'}</span>
            </button>
          )}

          <button
            onClick={onOpenGlossary}
            className="flex items-center gap-1.5 rounded-full border border-[#E6EBF0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#14232B] shadow-xs transition hover:border-[#237F8E] hover:text-[#237F8E]"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#237F8E]" />
            <span>{isId ? 'Glosarium' : 'Glossary'}</span>
          </button>

          {onToggleLang && (
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 rounded-full border border-[#E6EBF0] bg-white px-3 py-1.5 text-xs font-bold text-[#14232B] shadow-xs hover:border-[#237F8E] transition"
              aria-label="Ganti Bahasa"
              title={isId ? 'Ganti ke Bahasa Inggris' : 'Switch to Indonesian'}
            >
              <Globe className="h-3.5 w-3.5 text-[#237F8E]" />
              <span className="tabular-nums uppercase">{currentLang}</span>
            </button>
          )}

          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-1.5 rounded-full bg-[#E3F1F3] px-3.5 py-1.5 text-xs font-bold text-[#1B6572] shadow-xs hover:bg-[#237F8E] hover:text-white transition"
            >
              <Home className="h-3.5 w-3.5" />
              <span>{isId ? 'Beranda' : 'Home'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
