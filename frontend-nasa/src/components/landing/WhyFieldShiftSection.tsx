import { useRef, useState, useEffect } from 'react';
import {
  Satellite,
  CloudSun,
  FlaskConical,
  Sprout,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import { ScrollReveal } from '../common/ScrollReveal';

interface WhyFieldShiftSectionProps {
  onOpenWorkspace: () => void;
}

interface ValueCard {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Satellite;
  tags: string[];
  desc: string;
  isDark?: boolean;
}

const CARDS: ValueCard[] = [
  {
    id: 'nasa-data',
    title: 'NASA Earth Data',
    subtitle: 'Spaceborne Ingestion',
    icon: Satellite,
    tags: ['NASA POWER', 'SRTM', 'HLS NDVI (in progress)', 'SMAP L4 (in progress)', 'ONI / DMI'],
    desc: 'NASA POWER daily climate since 1991, SRTM terrain and ENSO/IOD indices drive the analysis today; HLS NDVI and SMAP soil moisture are being added through NASA AppEEARS.',
    isDark: false,
  },
  {
    id: 'climate-aware',
    title: 'Climate-Aware Modeling',
    subtitle: 'Worst-Year Stress Testing',
    icon: CloudSun,
    tags: ['El Niño Stress', 'La Niña Phases', 'IOD Index', 'Drought Baseline', 'Pareto Matrix'],
    desc: 'Every rotation strategy is stress-tested against historical ENSO climate shocks. We weight worst-year drought scenarios so your farm plan survives the seasons that break monocultures.',
    isDark: false,
  },
  {
    id: 'evidence-based',
    title: 'Evidence-Based & Open',
    subtitle: 'Auditable Science',
    icon: FlaskConical,
    tags: ['Pareto Optimal', 'Auditable Weights', 'Stated Limitations', '100% Open Data', 'Open Source'],
    desc: 'No black-box AI scores. Every weight and confidence interval is transparent, documented with its assumptions and limits, and reproducible from open NASA and USDA data.',
    isDark: false,
  },
  {
    id: 'farmer-impact',
    title: 'Direct Farmer Impact',
    subtitle: 'Field-Ready Delivery',
    icon: Sprout,
    tags: ['3 Demo Plots', 'Banyumas Basin', 'Evidence Cards', 'Extension Ready'],
    desc: 'Translated into actionable planting calendars and water efficiency guidelines ready for field extension workers and farmer cooperatives on the ground.',
    isDark: false,
  },
];

export function WhyFieldShiftSection({ onOpenWorkspace }: WhyFieldShiftSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const current = scrollRef.current;
    if (current) {
      current.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (current) {
        current.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 380;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <section id="why-field-shift" className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Outer Curved Container in Unified Field Shift Surface Palette */}
        <ScrollReveal direction="up">
          <div className="rounded-[36px] sm:rounded-[44px] bg-[#F4F7FA] border border-[#E6EBF0] p-7 sm:p-12 lg:p-14 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* ============================================================== */}
            {/* LEFT COLUMN: EDITORIAL HEADING & CIRCULAR NAVIGATION ARROWS    */}
            {/* ============================================================== */}
            <div className="lg:col-span-4 flex flex-col justify-between h-full space-y-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#237F8E] mb-2">
                  Core Foundations
                </p>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#14232B] leading-[1.18]">
                  Built on science, which we{' '}
                  <span className="text-[#237F8E] font-medium">
                    adhere to:
                  </span>
                </h2>

                <p className="mt-4 text-xs sm:text-sm text-[#5F6B74] leading-relaxed max-w-sm">
                  Transparent algorithms, open NASA satellite observations, and climate-weighted agronomy designed to protect every harvest.
                </p>
              </div>

              {/* Navigation Arrows with Real Functional States and Harmonized Styling */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border transition active:scale-95 shadow-2xs ${
                    canScrollLeft
                      ? 'border-slate-300 bg-white hover:border-[#237F8E] text-[#14232B] hover:text-[#237F8E] hover:bg-[#E3F1F3]/50 cursor-pointer'
                      : 'border-slate-200 bg-slate-100/70 text-slate-300 cursor-not-allowed opacity-40'
                  }`}
                  aria-label="Scroll left"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border transition active:scale-95 shadow-2xs ${
                    canScrollRight
                      ? 'border-slate-300 bg-white hover:border-[#237F8E] text-[#14232B] hover:text-[#237F8E] hover:bg-[#E3F1F3]/50 cursor-pointer'
                      : 'border-slate-200 bg-slate-100/70 text-slate-300 cursor-not-allowed opacity-40'
                  }`}
                  aria-label="Scroll right"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ============================================================== */}
            {/* RIGHT COLUMN: HORIZONTAL CAROUSEL CARDS WITH TAG CLUSTERS      */}
            {/* ============================================================== */}
            <div className="lg:col-span-8 overflow-hidden">
              <div
                ref={scrollRef}
                className="flex items-stretch gap-5 overflow-x-auto scroll-smooth pb-3 snap-x snap-mandatory scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {CARDS.map((card) => {
                  const Icon = card.icon;

                  return (
                    <div
                      key={card.id}
                      className="min-w-[280px] sm:min-w-[340px] max-w-[380px] rounded-3xl bg-white text-[#14232B] p-6 sm:p-7 shadow-sm border border-slate-200/90 flex flex-col justify-between snap-start hover:shadow-md hover:border-[#237F8E]/40 transition-all duration-300"
                    >
                      <div>
                        {/* Card Header with Brand Teal Icon Badge */}
                        <div className="flex items-center gap-2.5 mb-5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E3F1F3] text-[#237F8E] border border-[#237F8E]/25">
                            <Icon className="h-4 w-4" />
                          </span>
                          <h3 className="font-bold text-base sm:text-lg text-[#14232B]">
                            {card.title}
                          </h3>
                        </div>

                        {/* Chips Cluster (Light Mode) */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {card.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="rounded-lg bg-slate-50 hover:bg-[#E3F1F3] border border-slate-200 hover:border-[#237F8E]/30 px-2.5 py-1 text-[11px] font-medium text-[#14232B] hover:text-[#1B6572] transition"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Description */}
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs text-[#5F6B74] leading-relaxed">
                          {card.desc}
                        </p>
                        <button
                          type="button"
                          onClick={onOpenWorkspace}
                          className="mt-3.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#237F8E] hover:text-[#1B6572] transition cursor-pointer"
                        >
                          <span>Explore Architecture</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
  );
}

export default WhyFieldShiftSection;
