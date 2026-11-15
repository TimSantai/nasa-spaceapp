import { Eye, CloudSun, ShieldCheck, HelpCircle, Check } from 'lucide-react';
import type { Language } from '../../types/landing';
import { getDifferentiators } from '../../data/landingContent';

interface DifferentiatorsSectionProps {
  currentLang: Language;
}

  export function DifferentiatorsSection({ currentLang }: DifferentiatorsSectionProps) {
    const isId = currentLang === 'id';
    const differentiators = getDifferentiators(currentLang);

    const getDifferentiatorIcon = (name: string) => {
      switch (name) {
        case 'Eye':
          return <Eye className="h-6 w-6 text-[#237F8E]" />;
        case 'CloudSun':
          return <CloudSun className="h-6 w-6 text-[#237F8E]" />;
        case 'ShieldCheck':
          return <ShieldCheck className="h-6 w-6 text-[#237F8E]" />;
        case 'HelpCircle':
        default:
          return <HelpCircle className="h-6 w-6 text-[#237F8E]" />;
      }
    };

    return (
      <section id="pembeda" className="py-16 sm:py-24 bg-white border-b border-[#E6EBF0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Eyebrow & Header */}
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6BA544]/30 bg-[#6BA544]/10 px-3.5 py-1 text-[11px] font-bold tracking-wider text-[#1E5B4F] uppercase mb-3">
              <span className="flex h-2 w-2 rounded-full bg-[#6BA544]" />
              <span>✓ {isId ? '4 PILAR PEMBEDA UTAMA' : '4 CORE NOVELTY PILLARS'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#14232B]">
              {isId ? 'Empat Pembeda yang Mengutamakan Fakta' : 'Four Pillars That Prioritize Scientific Truth'}
            </h2>

            <p className="mt-3 text-sm sm:text-base text-[#5F6B74] leading-relaxed max-w-2xl mx-auto">
              {isId
                ? 'Kebanyakan aplikasi memberi satu rekomendasi mutlak dan menyembunyikan ketidakpastian. Field Shift dibangun di atas 4 pilar transparansi sains antariksa.'
                : 'While standard apps output a single black-box decree, Field Shift is engineered on four pillars of spaceborne scientific transparency.'}
            </p>
          </div>

          {/* 4 Columns Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {
                differentiators.map((diff, idx) => (
                  <div
                    key={diff.id}
                    className="relative rounded-2xl border border-[#E6EBF0] bg-[#F7F9FB] p-6 shadow-xs hover:border-[#237F8E] hover:bg-white hover:shadow-md transition duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Icon & Badge */}
                      <div className="flex items-center justify-between pb-4 border-b border-[#E6EBF0]">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E3F1F3] shadow-xs">
                          {getDifferentiatorIcon(diff.iconName)}
                        </div>
                        <span className="rounded-full bg-white border border-[#E6EBF0] px-2.5 py-0.5 text-[10px] font-bold text-[#237F8E]">
                          {isId ? `Pilar 0${idx + 1}` : `Pillar 0${idx + 1}`}
                        </span>
                      </div>

                      <div className="mt-4">
                        <span className="inline-block rounded-full bg-[#E3F1F3] px-2.5 py-0.5 text-[10px] font-bold text-[#1B6572] mb-2">
                          {diff.tag}
                        </span>
                        <h3 className="text-base font-bold text-[#14232B]">{diff.title}</h3>
                        <p className="mt-1 text-xs font-semibold text-[#1E5B4F]">{diff.subtitle}</p>
                        <p className="mt-2.5 text-xs text-[#5F6B74] leading-relaxed">{diff.desc}</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-3 border-t border-[#E6EBF0] flex items-center gap-1.5 text-[11px] font-semibold text-[#237F8E]">
                      <Check className="h-3.5 w-3.5 text-[#6BA544]" />
                      <span>{isId ? 'Teruji di Pilot Banyumas' : 'Validated in Banyumas Pilot'}</span>
                    </div>
                  </div>
                ))
              }
        </div>
        </div>
      </section>
    );
}
export default DifferentiatorsSection;
