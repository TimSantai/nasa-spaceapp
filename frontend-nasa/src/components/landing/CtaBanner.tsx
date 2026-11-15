import { Sprout, ArrowRight, Layers } from 'lucide-react';
import type { Language } from '../../types/landing';

interface CtaBannerProps {
  currentLang: Language;
  onOpenWorkspace: () => void;
  onOpenDataSources: () => void;
}

  export function CtaBanner({
    currentLang,
    onOpenWorkspace,
    onOpenDataSources,
}: CtaBannerProps) {
  const isId = currentLang === 'id';

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#1B6572] via-[#237F8E] to-[#1E5B4F] p-8 sm:p-12 text-white shadow-xl">
          {/* Subtle background pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, white 1.5px, transparent 1.5px), radial-gradient(circle at 80% 80%, white 1.5px, transparent 1.5px)`,
              backgroundSize: '28px 28px',
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-start gap-5 max-w-2xl">
              <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md text-white border border-white/20">
                <Sprout className="h-7 w-7" />
              </div>
              <div>
                <span className="inline-block rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-bold tracking-wider uppercase text-emerald-100 mb-2">
                  {isId ? 'MULAI SEKARANG' : 'GET STARTED TODAY'}
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  {isId ? 'Bandingkan rotasi tanaman untuk lahanmu' : 'Compare crop rotations for your farm'}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-white/95 leading-relaxed font-normal">
                  {isId
                    ? 'Pilih petak sawah di pilot Banyumas, eksplorasi kurva fenologi NDVI dan neraca air NASA POWER, lalu susun rencana rotasi berketahanan iklim bersama penyuluh pertanian.'
                    : 'Select study plots across Banyumas, explore NDVI and NASA POWER water balance, and formulate resilient crop rotation sheets.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                onClick={onOpenWorkspace}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-xs sm:text-sm font-bold text-[#1B6572] shadow-lg transition hover:bg-emerald-50 active:scale-95"
              >
                <span>{isId ? 'Buka Workspace Peta' : 'Launch Workspace'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onOpenDataSources}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-xs transition hover:bg-white/20 active:scale-95"
              >
                <Layers className="h-4 w-4" />
                <span>{isId ? 'Sumber Data 26' : '26 Data Audit'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default CtaBanner;
