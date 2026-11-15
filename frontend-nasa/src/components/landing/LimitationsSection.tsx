import { Info, ShieldAlert, CheckCircle } from 'lucide-react';
import type { Language } from '../../types/landing';
import { getHonestLimitations } from '../../data/landingContent';

interface LimitationsSectionProps {
  currentLang: Language;
}

  export function LimitationsSection({ currentLang }: LimitationsSectionProps) {
    const isId = currentLang === 'id';
    const honestLimitations = getHonestLimitations(currentLang);

    return (
      <section id="batasan" className="py-16 sm:py-24 bg-[#F4F7FA]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Eyebrow & Header */}
          <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#237F8E]/20 bg-[#E3F1F3] px-3.5 py-1 text-[11px] font-bold tracking-wider text-[#1B6572] uppercase mb-3">
                <Info className="h-3.5 w-3.5 text-[#237F8E]" />
                <span>✓ {isId ? 'ETIKA & TRANSPARANSI ILMIAH' : 'ETHICAL TRANSPARENCY & LIMITATIONS'}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#14232B]">
                {isId ? 'Komitmen Kejujuran: Batasan yang Harus Diketahui' : 'Our Transparency Commitment: Explicit Boundaries'}
              </h2>

              <p className="mt-3 text-sm sm:text-base text-[#5F6B74] leading-relaxed max-w-2xl mx-auto">
                {isId
                  ? 'Sesuai mandat NASA Space Apps Challenge: teknologi ini tidak menjanjikan keajaiban mutlak. Kami secara aktif mengungkapkan batasan data dan asumsi model agronomi.'
              : 'True to the NASA Space Apps ethos: we offer grounded science, not magical illusions. We disclose observational gaps and agronomic boundaries as first-class citizens.'}
              </p>
            </div>

            {/* Featured Limitations Card (Section 7.12 specification) */}
            <div className="mt-12 rounded-2xl border border-[#237F8E]/25 bg-[#F7F9FB] p-6 sm:p-8 shadow-card">
              <div className="flex items-center gap-3 pb-4 border-b border-[#E6EBF0]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E3F1F3] text-[#237F8E]">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#14232B]">
                    {isId ? '5 Batasan Fundamental Sistem Field Shift' : '5 Fundamental Operational Boundaries'}
                  </h3>
                  <p className="text-xs text-[#5F6B74]">
                    {isId
                      ? 'Wajib dibaca oleh petani, penyuluh PPL, dan juri sebelum mengambil keputusan agronomi'
                      : 'Mandatory reading for agronomists, extension officers, and evaluators'}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                  {
                    honestLimitations.map((limit, idx) => (
                      <div
                        key={limit.id}
                        className="flex items-start gap-3.5 rounded-xl bg-white p-4 border border-[#E6EBF0] shadow-xs"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E3F1F3] text-[#237F8E] font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#14232B]">{limit.title}</h4>
                          <p className="mt-1 text-xs text-[#5F6B74] leading-relaxed">{limit.desc}</p>
                        </div>
                      </div>
                    ))
                  }
          </div>

              <div className="mt-6 pt-4 border-t border-[#E6EBF0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5F6B74]">
                <span className="flex items-center gap-1.5 text-[#1E5B4F] font-semibold">
                  <CheckCircle className="h-4 w-4 text-[#6BA544]" />
                  <span>{isId ? 'Penyuluh dan petani adalah pengambil keputusan akhir.' : 'Farmers and local agronomists hold the ultimate decision authority.'}</span>
                </span>
                <span className="text-[11px] text-[#5F6B74]">
                  {isId ? 'Standar Evaluasi Algoritma: ISO/IEC 25010 & FAO Guidelines' : 'Evaluation Standards: ISO/IEC 25010 & FAO Guidelines'}
                </span>
              </div>
            </div>
          </div>
      </section>
    );
}
export default LimitationsSection;
