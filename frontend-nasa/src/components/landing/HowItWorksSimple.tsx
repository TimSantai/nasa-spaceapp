import { useState } from 'react';
import {
  MapPin,
  BarChart3,
  GitCompareArrows,
  CalendarCheck,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
} from 'lucide-react';
import { ScrollReveal } from '../common/ScrollReveal';

interface HowItWorksSectionProps {
  onOpenWorkspace: () => void;
}

interface StepItem {
  id: string;
  num: string;
  badge: string;
  title: string;
  shortTitle: string;
  desc: string;
  icon: typeof MapPin;
  image: string;
  alt: string;
  metric: string;
}

const STEPS: StepItem[] = [
  {
    id: 'select',
    num: '01',
    badge: 'Step 01 · Location Lock',
    title: 'Select Your Farmland Basin',
    shortTitle: 'Select Land',
    desc: 'Pick your study plot on the interactive satellite map, search by Indonesian regency, or pinpoint WGS84 GPS coordinates to lock onto your exact farm perimeter.',
    icon: MapPin,
    image:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    alt: 'Aerial view of agricultural plots and green terraced basins',
    metric: '30m WGS84 Grid',
  },
  {
    id: 'analyze',
    num: '02',
    badge: 'Step 02 · NASA Ingestion',
    title: 'Analyze Agro-Climatic Conditions',
    shortTitle: 'Analyze Telemetry',
    desc: 'Field Shift combines NASA POWER daily climate (1991–2025), SRTM slope, SoilGrids soil texture and ENSO/IOD indices; HLS NDVI and SMAP soil moisture are being added.',
    icon: BarChart3,
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
    alt: 'Satellite remote sensing data overlaying farm topography',
    metric: '35 years of NASA POWER',
  },
  {
    id: 'compare',
    num: '03',
    badge: 'Step 03 · Simulation Engine',
    title: 'Simulate Adaptive Crop Rotation',
    shortTitle: 'Compare & Decide',
    desc: 'Simulate alternative rotation paths against historical worst-case El Niño and drought seasons. Identify Pareto-optimal crop sequences that balance irrigation need, living soil cover and erosion.',
    icon: GitCompareArrows,
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
    alt: 'Interactive risk-weighted crop rotation comparison matrix',
    metric: '96% vs 67% living cover',
  },
  {
    id: 'execute',
    num: '04',
    badge: 'Step 04 · Farmer Action',
    title: 'Export Actionable Planting Plan',
    shortTitle: 'Export Plan',
    desc: 'Generate field-ready agronomic rotation sheets with planting dates, irrigation cutoffs, and soil moisture thresholds ready for field extension workers and farmer groups.',
    icon: CalendarCheck,
    image:
      'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1000&q=80',
    alt: 'Farmer inspecting crop harvest in productive field',
    metric: 'Verified Field Plan',
  },
];

export function HowItWorksSection({ onOpenWorkspace }: HowItWorksSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeStep = STEPS[activeIndex];
  const StepIcon = activeStep.icon;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? STEPS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === STEPS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* ============================================================== */}
        {/* SECTION HEADER                                                 */}
        {/* ============================================================== */}
        <ScrollReveal direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-[#237F8E] mb-2">
                The 4-Step Pipeline
              </p>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#14232B] leading-[1.14]">
                From satellite data to{' '}
                <span className="text-[#237F8E] font-medium">
                  farm-ready decisions
                </span>
              </h2>

              <p className="mt-4 text-sm sm:text-base text-[#5F6B74] leading-relaxed">
                Explore how raw NASA Earth observations convert into climate-resilient crop rotation
                strategies tailored for your field.
              </p>
            </div>

            {/* Desktop Navigation Arrows */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 hover:border-[#237F8E] bg-white hover:bg-[#E3F1F3]/50 text-slate-700 hover:text-[#237F8E] transition active:scale-95 shadow-2xs cursor-pointer"
                aria-label="Previous step"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 hover:border-[#237F8E] bg-white hover:bg-[#E3F1F3]/50 text-slate-700 hover:text-[#237F8E] transition active:scale-95 shadow-2xs cursor-pointer"
                aria-label="Next step"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* ============================================================== */}
        {/* EXPANDABLE CAROUSEL ACCORDION (MATCHING GOLF / BRIGHTLY STYLE)  */}
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
                        {step.badge}
                      </span>
                    </div>

                    {/* Metric pill on bottom of image */}
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-xs text-white">
                      <span className="font-mono text-[11px] font-bold bg-[#14232B]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                        {step.metric}
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
                        onClick={onOpenWorkspace}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#237F8E] to-[#1E5B4F] hover:from-[#1B6572] hover:to-[#17463c] text-white transition active:scale-95 shadow-xs hover:shadow cursor-pointer"
                        title="Open in Workspace"
                      >
                        <ArrowUpRight className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Text Details with High Contrast */}
                    <div className="my-auto py-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-[#14232B] leading-snug">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-xs sm:text-sm text-[#5F6B74] leading-relaxed font-normal">
                        {step.desc}
                      </p>
                    </div>

                    {/* Bottom Launch App CTA */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[#5F6B74]">Ready to test this step?</span>
                      <button
                        type="button"
                        onClick={onOpenWorkspace}
                        className="inline-flex items-center gap-1.5 text-[#237F8E] hover:text-[#1B6572] font-bold transition cursor-pointer"
                      >
                        <span>Launch Simulator</span>
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
                aria-label={`View step ${step.num}: ${step.shortTitle}`}
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
                    Click to View
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-[#237F8E] transition-colors leading-tight">
                    {step.shortTitle}
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
              onClick={onOpenWorkspace}
              aria-label="Launch Field Shift Workspace"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-[#237F8E] transition"
            >
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <span className="font-medium text-[#14232B]">
              Click any card to expand details or launch directly in the simulation studio
            </span>
          </div>

          {/* Quick Pagination Dots */}
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${activeIndex === i ? 'w-6 bg-[#237F8E]' : 'w-2 bg-slate-300 hover:bg-slate-400'
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
