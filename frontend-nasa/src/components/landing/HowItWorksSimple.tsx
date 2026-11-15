import { useState } from 'react';
import {
  MapPin,
  BarChart3,
  GitCompareArrows,
  CalendarCheck,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import { ScrollReveal } from '../common/ScrollReveal';
import type { Language } from '../../types/landing';

interface HowItWorksSectionProps {
  onOpenWorkspace: () => void;
  currentLang?: Language;
}

interface StepItem {
  id: string;
  num: string;
  badgeEn: string;
  badgeId: string;
  titleEn: string;
  titleId: string;
  shortTitleEn: string;
  shortTitleId: string;
  descEn: string;
  descId: string;
  icon: typeof MapPin;
  image: string;
  alt: string;
  metricEn: string;
  metricId: string;
}

const STEPS: StepItem[] = [
  {
    id: 'select',
    num: '01',
    badgeEn: 'Step 01 · Location Lock',
    badgeId: 'Langkah 01 · Kunci Lokasi',
    titleEn: 'Select Your Farmland Basin',
    titleId: 'Pilih Basin Lahan Pertanian Anda',
    shortTitleEn: 'Select Land',
    shortTitleId: 'Pilih Lahan',
    descEn: 'Pick your study plot on the interactive satellite map, search by Indonesian regency, or pinpoint WGS84 GPS coordinates to lock onto your exact farm perimeter.',
    descId: 'Pilih petak lahan Anda di peta satelit interaktif, cari berdasarkan kabupaten di Indonesia, atau tentukan koordinat GPS WGS84 untuk mengunci batas lahan secara presisi.',
    icon: MapPin,
    image:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    alt: 'Aerial view of agricultural plots and green terraced basins',
    metricEn: '30m WGS84 Grid',
    metricId: 'Grid WGS84 30m',
  },
  {
    id: 'analyze',
    num: '02',
    badgeEn: 'Step 02 · NASA Ingestion',
    badgeId: 'Langkah 02 · Ingesti Satelit NASA',
    titleEn: 'Analyze Agro-Climatic Conditions',
    titleId: 'Analisis Kondisi Agro-Klimatik',
    shortTitleEn: 'Analyze Telemetry',
    shortTitleId: 'Analisis Telemetri',
    descEn: 'Field Shift combines NASA POWER daily climate (1991–2025), SRTM slope, SoilGrids soil texture and ENSO/IOD indices with HLS NDVI into a unified dashboard.',
    descId: 'Field Shift memadukan iklim harian NASA POWER (1991–2025), lereng SRTM, tekstur tanah SoilGrids, dan indeks ENSO/IOD dengan HLS NDVI dalam satu dasbor.',
    icon: BarChart3,
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
    alt: 'Satellite remote sensing data overlaying farm topography',
    metricEn: '35 Years NASA POWER',
    metricId: '35 Tahun NASA POWER',
  },
  {
    id: 'compare',
    num: '03',
    badgeEn: 'Step 03 · Simulation Engine',
    badgeId: 'Langkah 03 · Mesin Simulasi',
    titleEn: 'Simulate Adaptive Crop Rotation',
    titleId: 'Simulasikan Rotasi Tanaman Adaptif',
    shortTitleEn: 'Compare & Decide',
    shortTitleId: 'Bandingkan & Putuskan',
    descEn: 'Simulate alternative rotation paths against historical worst-case El Niño and drought seasons. Identify Pareto-optimal crop sequences that balance irrigation need, living soil cover and erosion.',
    descId: 'Simulasikan jalur rotasi alternatif terhadap skenario historis terburuk El Niño dan kekeringan. Identifikasi urutan tanaman Pareto-optimal yang menyeimbangkan irigasi, tutupan tanah, dan erosi.',
    icon: GitCompareArrows,
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
    alt: 'Interactive risk-weighted crop rotation comparison matrix',
    metricEn: '96% vs 67% Living Cover',
    metricId: '96% vs 67% Tutupan Hidup',
  },
  {
    id: 'execute',
    num: '04',
    badgeEn: 'Step 04 · Farmer Action',
    badgeId: 'Langkah 04 · Aksi Petani',
    titleEn: 'Export Actionable Planting Plan',
    titleId: 'Ekspor Rencana Tanam Siap Pakai',
    shortTitleEn: 'Export Plan',
    shortTitleId: 'Ekspor Rencana',
    descEn: 'Generate field-ready agronomic rotation sheets with planting dates, irrigation cutoffs, and soil moisture thresholds ready for field extension workers and farmer groups.',
    descId: 'Hasilkan lembar rotasi agronomi siap lapangan lengkap dengan tanggal tanam, jadwal irigasi, dan ambang batas kelembapan tanah untuk penyuluh dan kelompok tani.',
    icon: CalendarCheck,
    image:
      'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1000&q=80',
    alt: 'Farmer inspecting crop harvest in productive field',
    metricEn: 'Verified Field Plan',
    metricId: 'Rencana Terverifikasi',
  },
];

export function HowItWorksSection({ onOpenWorkspace, currentLang = 'en' }: HowItWorksSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isId = currentLang === 'id';

  const activeStep = STEPS[activeIndex];
  const StepIcon = activeStep.icon;

  return (
    <section id="how-it-works" className="pt-16 sm:pt-20 pb-10 sm:pb-12 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* ============================================================== */}
        {/* SECTION HEADER                                                 */}
        {/* ============================================================== */}
        <ScrollReveal direction="up">
          <div className="max-w-3xl mb-10 sm:mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#237F8E] mb-2">
              {isId ? 'Alur 4 Langkah' : 'The 4-Step Pipeline'}
            </p>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#14232B] leading-[1.14]">
              {isId ? (
                <>
                  Dari data satelit menjadi{' '}
                  <span className="text-[#237F8E] font-medium">
                    keputusan siap tanam
                  </span>
                </>
              ) : (
                <>
                  From satellite data to{' '}
                  <span className="text-[#237F8E] font-medium">
                    farm-ready decisions
                  </span>
                </>
              )}
            </h2>

            <p className="mt-4 text-sm sm:text-base text-[#5F6B74] leading-relaxed">
              {isId
                ? 'Pelajari bagaimana data observasi satelit NASA diubah menjadi strategi rotasi tanaman tahan iklim yang disesuaikan untuk lahan Anda.'
                : 'Explore how raw NASA Earth observations convert into climate-resilient crop rotation strategies tailored for your field.'}
            </p>
          </div>
        </ScrollReveal>

        {/* ============================================================== */}
        {/* EXPANDABLE CAROUSEL ACCORDION                                  */}
        {/* ============================================================== */}
        <ScrollReveal direction="up" delayMs={150}>
          <div className="flex flex-col lg:flex-row gap-5 items-stretch min-h-[440px] sm:min-h-[460px]">
            {STEPS.map((step, idx) => {
              const isActive = activeIndex === idx;

              if (isActive) {
                /* ACTIVE EXPANDED LIGHT CARD WITH HIGH CONTRAST */
                return (
                  <div
                    key={step.id}
                    className="flex-[1.6] rounded-[28px] sm:rounded-[32px] bg-white text-[#14232B] p-5 sm:p-7 shadow-[0_16px_45px_rgba(15,23,42,0.08)] border border-slate-200/90 flex flex-col md:flex-row gap-6 items-stretch justify-between transition-all duration-500 ease-out"
                  >
                    {/* Left inner: Rounded Featured Image */}
                    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden md:w-[50%] min-h-[220px] md:min-h-full shadow-sm">
                      <img
                        src={step.image}
                        alt={step.alt}
                        className="w-full h-full object-cover brightness-[0.98] contrast-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Step pill on image */}
                      <div className="absolute top-3.5 left-3.5">
                        <span className="rounded-lg bg-white/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-[#14232B] border border-white/80 shadow-2xs">
                          {isId ? step.badgeId : step.badgeEn}
                        </span>
                      </div>

                      {/* Metric pill on bottom of image */}
                      <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-xs text-white">
                        <span className="font-mono text-[11px] font-bold bg-[#14232B]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                          {isId ? step.metricId : step.metricEn}
                        </span>
                      </div>
                    </div>

                    {/* Right inner: Text Details & Action Buttons */}
                    <div className="md:w-[50%] flex flex-col justify-between py-1">
                      {/* Top Action Buttons */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3F1F3] text-[#237F8E] border border-[#237F8E]/25 shadow-2xs">
                            <StepIcon className="h-5 w-5" />
                          </div>
                          <span className="font-mono text-xs font-bold text-[#1B6572] tracking-wider">
                            PHASE {step.num}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onOpenWorkspace()}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#237F8E] to-[#1E5B4F] hover:from-[#1B6572] hover:to-[#17463c] text-white transition active:scale-95 shadow-xs hover:shadow cursor-pointer"
                          title={isId ? 'Buka di Workspace' : 'Open in Workspace'}
                        >
                          <ArrowUpRight className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Text Details with High Contrast */}
                      <div className="my-auto py-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-[#14232B] leading-snug">
                          {isId ? step.titleId : step.titleEn}
                        </h3>
                        <p className="mt-3 text-xs sm:text-sm text-[#5F6B74] leading-relaxed font-normal">
                          {isId ? step.descId : step.descEn}
                        </p>
                      </div>

                      {/* Bottom Launch App CTA */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[#5F6B74]">
                          {isId ? 'Siap menguji langkah ini?' : 'Ready to test this step?'}
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenWorkspace()}
                          className="inline-flex items-center gap-1.5 text-[#237F8E] hover:text-[#1B6572] font-bold transition cursor-pointer"
                        >
                          <span>{isId ? 'Buka Simulator' : 'Launch Simulator'}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              /* INACTIVE COMPACT PORTRAIT CARD (EXPANDS ON CLICK) */
              return (
                <div
                  key={step.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`View step ${step.num}: ${isId ? step.shortTitleId : step.shortTitleEn}`}
                  onClick={() => setActiveIndex(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveIndex(idx);
                    }
                  }}
                  className="flex-1 min-w-[160px] sm:min-w-[180px] rounded-[28px] sm:rounded-[32px] overflow-hidden relative cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-500 ease-out border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#237F8E]"
                >
                  {/* Background Full Bleed Photo */}
                  <img
                    src={step.image}
                    alt={step.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.82] group-hover:brightness-[0.92]"
                  />

                  {/* Dark Gradient Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20 group-hover:via-slate-950/20 transition-all duration-300" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="rounded-lg bg-white/20 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white border border-white/20 shadow-xs">
                      {step.num}
                    </span>
                  </div>

                  {/* Bottom Title & Indicator */}
                  <div className="absolute bottom-5 left-4 right-4">
                    <span className="text-[10px] font-mono text-[#237F8E] font-semibold block mb-0.5">
                      {isId ? 'Klik untuk Melihat' : 'Click to View'}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-[#237F8E] transition-colors leading-tight">
                      {isId ? step.shortTitleId : step.shortTitleEn}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        {/* ============================================================== */}
        {/* BOTTOM SUBTLE TRIGGER BAR                                      */}
        {/* ============================================================== */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/70 text-xs text-[#5F6B74]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenWorkspace()}
              aria-label={isId ? 'Buka Field Shift Workspace' : 'Launch Field Shift Workspace'}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#237F8E] text-white hover:bg-[#1B6572] transition shadow-2xs"
            >
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <span className="font-medium text-[#14232B]">
              {isId
                ? 'Klik kartu mana saja untuk melihat detail atau buka langsung di studio simulasi'
                : 'Click any card to expand details or launch directly in the simulation studio'}
            </span>
          </div>

          {/* Quick Pagination Dots */}
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === i ? 'w-6 bg-[#237F8E]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Jump to step ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
