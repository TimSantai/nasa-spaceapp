import { Layers, Compass, CalendarRange, GitFork, ShieldAlert, FileCheck, ArrowRight } from 'lucide-react';
import type { Language } from '../../types/landing';
import { getPipelineSteps } from '../../data/landingContent';

interface HowItWorksSectionProps {
  currentLang: Language;
  onOpenWorkspace: () => void;
}

  export function HowItWorksSection({ currentLang, onOpenWorkspace }: HowItWorksSectionProps) {
    const isId = currentLang === 'id';
    const pipelineSteps = getPipelineSteps(currentLang);

    const getStepIcon = (name: string) => {
      switch (name) {
        case 'Layers':
          return <Layers className="h-5 w-5 text-[#237F8E]" />;
        case 'Compass':
          return <Compass className="h-5 w-5 text-[#237F8E]" />;
        case 'CalendarRange':
          return <CalendarRange className="h-5 w-5 text-[#237F8E]" />;
        case 'GitFork':
          return <GitFork className="h-5 w-5 text-[#237F8E]" />;
        case 'ShieldAlert':
          return <ShieldAlert className="h-5 w-5 text-[#237F8E]" />;
        case 'FileCheck':
        default:
          return <FileCheck className="h-5 w-5 text-[#237F8E]" />;
      }
    };

    return (
      <section id="cara-kerja" className="py-16 sm:py-24 bg-[#F4F7FA]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Eyebrow & Header */}
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#237F8E]/30 bg-[#E3F1F3] px-3.5 py-1 text-[11px] font-bold tracking-wider text-[#1B6572] uppercase mb-3">
              <span>✓ {isId ? 'ALUR KERJA PIPELINE' : '6-STAGE SCIENTIFIC PIPELINE'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#14232B]">
              {isId ? '6 Langkah dari Satelit ke Keputusan Lapangan' : '6 Steps from Orbit to the Padi Furrow'}
            </h2>

            <p className="mt-3 text-sm sm:text-base text-[#5F6B74] leading-relaxed max-w-2xl mx-auto">
              {isId
                ? 'Bagaimana data mentah multi-sensor diproses menjadi kartu bukti rotasi tanaman yang transparan, teruji risiko iklim, dan dapat diverifikasi langsung di lapangan.'
                : 'How raw spaceborne observations are processed into transparent, climate-conditioned rotation evidence cards verified for on-the-ground extension.'}
            </p>
          </div>

          {/* 6 Numbered Tiles in Bento Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {
                pipelineSteps.map((step) => (
                  <div
                    key={step.number}
                    className="group relative rounded-2xl border border-[#E6EBF0] bg-white p-6 shadow-sm hover:shadow-md hover:border-[#237F8E]/50 transition duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Step Header with Number and Icon */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#E6EBF0]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E3F1F3] text-[#237F8E] font-bold text-xs tabular-nums">
                          {step.number}
                        </span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7F9FB] text-[#237F8E] group-hover:bg-[#E3F1F3] transition">
                          {getStepIcon(step.iconName)}
                        </div>
                      </div>

                      {/* Step Title & Description */}
                      <h3 className="mt-4 text-base font-bold text-[#14232B] group-hover:text-[#237F8E] transition">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 text-xs font-semibold text-[#1E5B4F]">
                        {step.shortDesc}
                      </p>
                      <p className="mt-2 text-xs text-[#5F6B74] leading-relaxed">
                        {step.detail}
                      </p>
                    </div>

                    {/* Sensor Chips at bottom of card */}
                    <div className="mt-5 pt-3 border-t border-[#E6EBF0]/60">
                      <span className="text-[10px] font-bold text-[#5F6B74] uppercase tracking-wider block mb-1.5">
                        {isId ? 'Dataset Terkait:' : 'Datasets Applied:'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {step.sensors.map((sensor, sIdx) => (
                          <span
                            key={sIdx}
                            className="rounded-full bg-[#F7F9FB] border border-[#E6EBF0] px-2 py-0.5 text-[10px] font-semibold text-[#14232B]"
                          >
                            {sensor}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              }
        </div>

          {/* Bottom Banner Trigger */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={onOpenWorkspace}
              className="flex items-center gap-2 rounded-full border border-[#237F8E] bg-white px-6 py-2.5 text-xs font-bold text-[#237F8E] shadow-xs transition hover:bg-[#E3F1F3] active:scale-95"
            >
              <span>{isId ? 'Coba Seluruh Pipeline di Workspace' : 'Launch Full Pipeline in Workspace'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    );
}
export default HowItWorksSection;
