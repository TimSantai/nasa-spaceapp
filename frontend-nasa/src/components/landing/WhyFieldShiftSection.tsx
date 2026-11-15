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
import type { Language } from '../../types/landing';

interface WhyFieldShiftSectionProps {
  onOpenWorkspace: () => void;
  currentLang?: Language;
}

interface ValueCard {
  id: string;
  titleEn: string;
  titleId: string;
  subtitleEn: string;
  subtitleId: string;
  icon: typeof Satellite;
  tagsEn: string[];
  tagsId: string[];
  descEn: string;
  descId: string;
  isDark?: boolean;
}

const CARDS: ValueCard[] = [
  {
    id: 'nasa-data',
    titleEn: 'NASA Earth Data',
    titleId: 'Data Satelit NASA',
    subtitleEn: 'Spaceborne Ingestion',
    subtitleId: 'Ingesti Antariksa',
    icon: Satellite,
    tagsEn: ['NASA POWER', 'SRTM', 'SoilGrids', 'HLS NDVI', 'SMAP Radar', 'ONI / DMI'],
    tagsId: ['NASA POWER', 'SRTM', 'SoilGrids', 'HLS NDVI', 'Radar SMAP', 'ONI / DMI'],
    descEn: 'NASA POWER daily climate since 1991, SRTM terrain and ENSO/IOD indices drive the analysis today; HLS NDVI and SMAP soil moisture are being added through NASA AppEEARS.',
    descId: 'Iklim harian NASA POWER sejak 1991, medan SRTM, dan indeks ENSO/IOD menjadi pendorong analisis kami; HLS NDVI dan lengas tanah SMAP diintegrasikan via NASA AppEEARS.',
    isDark: false,
  },
  {
    id: 'climate-aware',
    titleEn: 'Climate-Aware Modeling',
    titleId: 'Model Waspada Iklim',
    subtitleEn: 'Worst-Year Stress Testing',
    subtitleId: 'Uji Stres Tahun Terburuk',
    icon: CloudSun,
    tagsEn: ['El Niño Stress', 'La Niña Phases', 'IOD Index', 'Drought Baseline', 'Pareto Matrix'],
    tagsId: ['Stres El Niño', 'Fase La Niña', 'Indeks IOD', 'Kekeringan Ekstrem', 'Matriks Pareto'],
    descEn: 'Every rotation strategy is stress-tested against historical ENSO climate shocks. We weight worst-year drought scenarios so your farm plan survives the seasons that break monocultures.',
    descId: 'Setiap skenario rotasi diuji ketahanan terhadap goncangan iklim ENSO historis. Kami memperhitungkan skenario kekeringan terburuk agar rencana tanam bertahan saat monokultur gagal.',
    isDark: false,
  },
  {
    id: 'evidence-based',
    titleEn: 'Evidence-Based & Open',
    titleId: 'Berbasis Bukti & Terbuka',
    subtitleEn: 'Auditable Science',
    subtitleId: 'Sains yang Dapat Diaudit',
    icon: FlaskConical,
    tagsEn: ['Pareto Optimal', 'Auditable Weights', 'Stated Limitations', '100% Open Data', 'Open Source'],
    tagsId: ['Pareto Optimal', 'Bobot Terbuka', 'Batasan Transparan', '100% Sains Terbuka', 'Open Source'],
    descEn: 'No black-box AI scores. Every weight and confidence interval is transparent, documented with its assumptions and limits, and reproducible from open NASA and USDA data.',
    descId: 'Bukan skor AI black-box. Setiap bobot dan rentang keyakinan transparan, terdokumentasi lengkap dengan batasan ilmiahnya, serta dapat direproduksi dari data terbuka NASA.',
    isDark: false,
  },
  {
    id: 'farmer-impact',
    titleEn: 'Direct Farmer Impact',
    titleId: 'Dampak Langsung Petani',
    subtitleEn: 'Field-Ready Delivery',
    subtitleId: 'Penyampaian Siap Lapangan',
    icon: Sprout,
    tagsEn: ['7 Banyumas Plots', 'Evidence Cards', 'PPL Consultation', 'Extension Ready'],
    tagsId: ['7 Petak Banyumas', 'Kartu Bukti', 'Konsultasi PPL', 'Siap Penyuluh'],
    descEn: 'Translated into actionable planting calendars and water efficiency guidelines ready for field extension workers (PPL) and farmer groups on the ground.',
    descId: 'Diterjemahkan menjadi kalender tanam siap aksi dan panduan efisiensi air untuk penyuluh pertanian lapangan (PPL) dan kelompok tani.',
    isDark: false,
  },
];

export function WhyFieldShiftSection({ onOpenWorkspace, currentLang = 'en' }: WhyFieldShiftSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isId = currentLang === 'id';

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
    <section id="why-field-shift" className="pt-4 sm:pt-6 pb-16 sm:pb-24 bg-white">
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
                  {isId ? 'Fondasi Utama' : 'Core Foundations'}
                </p>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#14232B] leading-[1.18]">
                  {isId ? (
                    <>
                      Berlandaskan sains yang kami{' '}
                      <span className="text-[#237F8E] font-medium">
                        pegang teguh:
                      </span>
                    </>
                  ) : (
                    <>
                      Built on science, which we{' '}
                      <span className="text-[#237F8E] font-medium">
                        adhere to:
                      </span>
                    </>
                  )}
                </h2>

                <p className="mt-4 text-xs sm:text-sm text-[#5F6B74] leading-relaxed max-w-sm">
                  {isId
                    ? 'Algoritma transparan, observasi satelit NASA terbuka, dan agronomi berbobot iklim dirancang untuk melindungi setiap musim panen.'
                    : 'Transparent algorithms, open NASA satellite observations, and climate-weighted agronomy designed to protect every harvest.'}
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
                      ? 'border-transparent bg-[#1E5B4F] text-white hover:bg-[#17463c] shadow-xs cursor-pointer'
                      : 'border-slate-200 bg-white text-slate-300 cursor-not-allowed opacity-50'
                  }`}
                  aria-label={isId ? 'Gulir ke kiri' : 'Scroll left'}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border transition active:scale-95 shadow-2xs ${
                    canScrollRight
                      ? 'border-transparent bg-[#1E5B4F] text-white hover:bg-[#17463c] shadow-xs cursor-pointer'
                      : 'border-slate-200 bg-white text-slate-300 cursor-not-allowed opacity-50'
                  }`}
                  aria-label={isId ? 'Gulir ke kanan' : 'Scroll right'}
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
                            {isId ? card.titleId : card.titleEn}
                          </h3>
                        </div>

                        {/* Chips Cluster */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {(isId ? card.tagsId : card.tagsEn).map((tag, i) => (
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
                          {isId ? card.descId : card.descEn}
                        </p>
                        <button
                          type="button"
                          onClick={() => onOpenWorkspace()}
                          className="mt-3.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#237F8E] hover:text-[#1B6572] transition cursor-pointer"
                        >
                          <span>{isId ? 'Pelajari Arsitektur' : 'Explore Architecture'}</span>
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
