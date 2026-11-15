import React from 'react';
import { Compass, X, Sparkles, Loader2 } from 'lucide-react';
import type { Language } from '../../types/landing';

interface GeolocationBannerProps {
  isOpen: boolean;
  onAllow: () => void;
  onDismiss: () => void;
  isLoading?: boolean;
  currentLang?: Language;
}

export const GeolocationBanner: React.FC<GeolocationBannerProps> = ({
  isOpen,
  onAllow,
  onDismiss,
  isLoading = false,
  currentLang = 'id',
}) => {
  if (!isOpen) return null;

  const isId = currentLang === 'id';

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label={isId ? 'Permintaan izin lokasi' : 'Location permission prompt'}
      className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-[calc(100vw-3rem)] rounded-2xl border border-[#237F8E]/20 bg-white/95 p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="flex items-start gap-3.5">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E3F1F3] text-[#237F8E]">
          <Compass className="h-5 w-5 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#237F8E] opacity-60" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#237F8E]" />
          </span>
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-[#14232B]">
              {isId ? 'Deteksi Lahan Terdekat' : 'Detect Nearby Farmland'}
            </h4>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[#E3F1F3] px-1.5 py-0.5 text-[9px] font-semibold text-[#1B6572]">
              <Sparkles className="h-2.5 w-2.5" />
              {isId ? 'Otomatis' : 'Auto'}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-[#5F6B74]">
            {isId
              ? 'Izinkan akses lokasi perangkat untuk menemukan data agroklimat dan rekomendasi petak observasi terdekat dengan Anda.'
              : 'Allow device location access to automatically find agroclimate data and observation plots closest to you.'}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={onAllow}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#237F8E] px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#1B6572] focus:outline-none focus:ring-2 focus:ring-[#237F8E]/40 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>{isId ? 'Mendeteksi...' : 'Detecting...'}</span>
                </>
              ) : (
                <span>{isId ? 'Izinkan Lokasi' : 'Allow Location'}</span>
              )}
            </button>
            <button
              onClick={onDismiss}
              className="rounded-lg border border-[#E6EBF0] px-2.5 py-1.5 text-xs font-semibold text-[#5F6B74] transition hover:bg-[#F4F7FA] hover:text-[#14232B]"
            >
              {isId ? 'Nanti Saja' : 'Not Now'}
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="rounded-lg p-1 text-[#5F6B74] hover:bg-gray-100 hover:text-[#14232B] transition"
          aria-label={isId ? 'Tutup pemberitahuan' : 'Close notification'}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
