import { useState } from 'react';
import { ScrollReveal } from '../common/ScrollReveal';

interface AboutSectionProps {
  onOpenWorkspace: () => void;
}

interface FeatureCard {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  alt: string;
  tag: string;
}

const CARDS: FeatureCard[] = [
  {
    id: 'spaceborne',
    title: 'Spaceborne Telemetry',
    subtitle: 'NASA POWER climate 1991–2025, SRTM terrain & SoilGrids',
    image:
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
    alt: 'Agricultural drone surveying green tea and rice terraces',
    tag: 'Payload & Ingestion',
  },
  {
    id: 'adaptive',
    title: 'Adaptive Crop Rotation',
    subtitle: 'Stress-tested against El Niño drought scenarios',
    image:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    alt: 'Symmetrical golden crop furrows stretching to the horizon',
    tag: 'Climate Resilience',
  },
  {
    id: 'precision',
    title: 'Precision Field Impact',
    subtitle: 'Erosion exposure ~8× lower than rice–rice–fallow (engine output, Banyumas)',
    image:
      'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80',
    alt: 'Precision drone spraying over fertile green farmland',
    tag: 'Field Execution',
  },
];

export function AboutSection({ onOpenWorkspace }: AboutSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="about" className="relative py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* ============================================================== */}
        {/* TOP HEADER ROW: BOLD HEADLINE + OUTLINE CTA PILL               */}
        {/* ============================================================== */}
        <ScrollReveal direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 sm:pb-14 border-b border-slate-200">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-[#237F8E] mb-2">
                Field Shift System
              </p>

              {/* Headline matching user design reference */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#14232B] leading-[1.12]">
                Elevates agricultural operations to{' '}
                <span className="text-[#237F8E] font-medium">
                  new heights
                </span>
              </h2>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={onOpenWorkspace}
                className="rounded-xl border border-slate-300 hover:border-[#237F8E] bg-white hover:bg-[#E3F1F3]/50 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-800 hover:text-[#1B6572] transition active:scale-[0.98] shadow-2xs cursor-pointer"
              >
                Explore Solutions
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* ============================================================== */}
        {/* CONTENT ROW: LEFT PARAGRAPH + ARROWS | RIGHT 3-CARD GALLERY   */}
        {/* ============================================================== */}
        <div className="pt-10 sm:pt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Descriptive Text */}
          <ScrollReveal direction="left" className="lg:col-span-4 flex flex-col justify-start h-full space-y-6">
            <div>
              <p className="text-sm sm:text-base text-[#5F6B74] leading-relaxed font-normal">
                Field Shift pairs high-resolution NASA satellite telemetry with regional agronomic risk models to direct resilient crop rotation schedules derived from Earth orbit data.
              </p>
            </div>
          </ScrollReveal>

          {/* Right Column: 3 Rounded Cards with Photography & Labels Below */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              {CARDS.map((card, idx) => {
                const isActive = activeIndex === idx;

                return (
                  <ScrollReveal key={card.id} direction="up" delayMs={idx * 120}>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`View ${card.title}`}
                      onClick={() => setActiveIndex(idx)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveIndex(idx);
                        }
                      }}
                      className="flex flex-col cursor-pointer group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#237F8E] rounded-3xl"
                    >
                      {/* Rounded Image Container */}
                      <div
                        className={`relative aspect-[3/4] rounded-3xl overflow-hidden shadow-sm transition-all duration-300 ${
                          isActive
                            ? 'ring-2 ring-[#237F8E] ring-offset-2 shadow-md'
                            : 'group-hover:shadow-md'
                        }`}
                      >
                        <img
                          src={card.image}
                          alt={card.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-[0.98] contrast-[1.02]"
                        />

                        {/* Floating badge on image */}
                        <div className="absolute top-3.5 left-3.5">
                          <span className="rounded-lg bg-slate-900/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-white border border-white/20">
                            {card.tag}
                          </span>
                        </div>
                      </div>

                      {/* Label & Details Underneath */}
                      <div className="pt-3 px-1">
                        <h3 className="font-bold text-sm sm:text-base text-[#14232B] group-hover:text-[#237F8E] transition">
                          {card.title}
                        </h3>
                        <p className="text-xs text-[#5F6B74] mt-0.5 leading-snug">
                          {card.subtitle}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
