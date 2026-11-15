import { Sprout, ArrowRight, ShieldCheck } from 'lucide-react';
import { ScrollReveal } from '../common/ScrollReveal';
import type { Language } from '../../types/landing';

interface CtaFooterSectionProps {
  onOpenWorkspace: () => void;
  currentLang?: Language;
}

export function CtaFooterSection({ onOpenWorkspace, currentLang = 'en' }: CtaFooterSectionProps) {
  const isId = currentLang === 'id';

  return (
    <section className="relative overflow-hidden bg-white pt-16 sm:pt-24 pb-10">
      {/* ============================================================== */}
      {/* ROLLING GREEN AGRICULTURAL HILLS BACKGROUND (LIKE HERO SECTION) */}
      {/* ============================================================== */}
      <div className="absolute bottom-0 inset-x-0 h-[480px] sm:h-[540px] pointer-events-none z-0 overflow-hidden">
        {/* Rolling Farmland Hills Photography */}
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80"
          alt="Rolling green agricultural farmland and fertile hills"
          className="absolute inset-0 w-full h-full object-cover object-bottom brightness-[0.98] contrast-[1.03]"
        />

        {/* Soft Organic Mist Transition from Pure White to Farmland Landscape */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white" />

        {/* Top Organic Contour Wave Transition */}
        <div className="absolute top-0 inset-x-0 h-16 pointer-events-none">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full fill-white">
            <path d="M0,35 C240,10 480,50 720,20 C960,55 1200,15 1440,30 L1440,0 L0,0 Z" />
          </svg>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FLOATING CTA CONTENT CONTAINER OVER THE LANDSCAPE              */}
      {/* ============================================================== */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal direction="up">
          <div className="rounded-[32px] sm:rounded-[40px] border border-slate-200/90 bg-white/92 backdrop-blur-xl p-8 sm:p-14 lg:p-16 shadow-[0_20px_50px_rgba(15,23,42,0.08)] mb-14 sm:mb-16">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            
            {/* Left Copy */}
            <div className="max-w-2xl text-center lg:text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-[#237F8E] mb-2">
                {isId ? 'Mulai Eksplorasi Sekarang' : 'Start Exploring Today'}
              </p>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#14232B] leading-[1.14]">
                {isId ? (
                  <>
                    Siap mengambil keputusan pertanian{' '}
                    <span className="text-[#237F8E] font-medium">
                      yang lebih cerdas?
                    </span>
                  </>
                ) : (
                  <>
                    Ready to make smarter{' '}
                    <span className="text-[#237F8E] font-medium">
                      agricultural decisions?
                    </span>
                  </>
                )}
              </h2>

              <p className="mt-4 text-sm sm:text-base text-[#5F6B74] leading-relaxed max-w-xl mx-auto lg:mx-0">
                {isId
                  ? 'Kunci basin lahan pertanian Anda, eksplorasi wawasan satelit NASA waktu nyata, dan simulasikan rotasi tanaman adaptif — semua dalam satu ruang kerja terpadu.'
                  : 'Lock onto your farmland basin, explore real-time NASA satellite insights, and simulate climate-resilient crop rotations — all in one unified workspace.'}
              </p>

              {/* Quick Trust Badges */}
              <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#237F8E]" />
                  <span>{isId ? '26 Lapisan Satelit NASA' : '26 Audited NASA Feeds'}</span>
                </span>
                <span className="text-slate-300">&middot;</span>
                <span>{isId ? 'Sains Terbuka & Gratis' : 'Free & Open Science'}</span>
                <span className="text-slate-300">&middot;</span>
                <span>{isId ? 'Grid Global WGS84 30m' : 'WGS84 30m Global Grid'}</span>
              </div>
            </div>

            {/* Right Action Button */}
            <div className="shrink-0 w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenWorkspace()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#237F8E] to-[#1E5B4F] hover:from-[#1B6572] hover:to-[#17463c] text-white px-8 py-4 text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition active:scale-[0.98] cursor-pointer"
              >
                <span>{isId ? 'Buka Field Shift Workspace' : 'Launch Field Shift Workspace'}</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>

          </div>
        </div>
        </ScrollReveal>

        {/* ============================================================== */}
        {/* COMPACT FOOTER ANCHORED OVER THE GREEN HILLS                   */}
        {/* ============================================================== */}
        <ScrollReveal direction="up" delayMs={100}>
          <footer className="rounded-2xl bg-white/95 backdrop-blur-xl px-6 py-4 border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E3F1F3] text-[#237F8E] border border-[#237F8E]/25 shadow-2xs">
                <Sprout className="h-4 w-4" />
              </div>
              <span className="text-sm font-extrabold tracking-tight text-[#14232B]">
                FIELD <span className="text-[#237F8E]">SHIFT</span>
              </span>
              <span className="text-[11px] font-semibold text-[#5F6B74]">
                &middot; NASA Space Apps
              </span>
            </div>

            {/* Attribution & Copyright */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-[#5F6B74] font-medium text-[11px] sm:text-xs">
              <span>{isId ? 'Didukung oleh NASA POWER, SRTM & AppEEARS (HLS, SMAP, ECOSTRESS)' : 'Powered by NASA POWER, SRTM & AppEEARS (HLS, SMAP, ECOSTRESS)'}</span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span>&copy; {new Date().getFullYear()} FIELD SHIFT. {isId ? 'Inisiatif Data Terbuka.' : 'Open Data Initiative.'}</span>
            </div>
          </footer>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default CtaFooterSection;
