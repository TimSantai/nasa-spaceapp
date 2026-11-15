import { useState } from 'react';
import { AlertTriangle, Droplets, Sun, ArrowUpRight } from 'lucide-react';
import type { Language } from '../../types/landing';
import { getProblemPoints } from '../../data/landingContent';

interface ProblemSectionProps {
  currentLang: Language;
  onOpenDataSources: () => void;
}

  export function ProblemSection({ currentLang, onOpenDataSources }: ProblemSectionProps) {
    const isId = currentLang === 'id';
    const [activeScenario, setActiveScenario] = useState<'normal' | 'elnino'>('elnino');
    const problemPoints = getProblemPoints(currentLang);

    return (
      <section id="masalah" className="py-16 sm:py-24 bg-white border-y border-[#E6EBF0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Eyebrow & Header */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B4443A]/20 bg-rose-50 px-3.5 py-1 text-[11px] font-bold tracking-wider text-[#B4443A] uppercase mb-3">
              <AlertTriangle className="h-3.5 w-3.5 text-[#B4443A]" />
              <span>✓ {isId ? 'MASALAH DI LAPANGAN' : 'THE REAL-WORLD DILEMMA'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#14232B]">
              {isId ? (
                <>
                  Data ada, tapi tersebar di <br className="hidden sm:inline" />
                  <span className="text-[#237F8E]">puluhan portal ilmiah.</span>
                </>
              ) : (
                <>
                  Abundant satellite data, yet <br className="hidden sm:inline" />
                  <span className="text-[#237F8E]">trapped in scientific silos.</span>
                </>
              )}
            </h2>

            <p className="mt-3 text-sm sm:text-base text-[#5F6B74] leading-relaxed">
              {isId
                ? 'Petani dan penyuluh di Jawa Tengah dan kawasan tropis lainnya sering kali terjebak dalam monokultur padi rentan kekeringan, tanpa alat yang dapat menerjemahkan peta satelit 30m menjadi rencana rotasi berketahanan iklim.'
              : 'Smallholder farmers and agronomists face extreme climate volatility, yet lack accessible tools to translate 30m spaceborne observations into resilient rotation strategies.'}
            </p>
          </div>

          {/* Split Section: Checklist Points & Interactive Visual Box */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: 4 Problem Points (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
                {
                  problemPoints.map((pt, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-[#E6EBF0] bg-[#F7F9FB] p-5 hover:border-[#237F8E]/40 hover:bg-white transition duration-150"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[#B4443A] font-bold text-xs">
                          0{idx + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm sm:text-base text-[#14232B]">{pt.title}</h3>
                          <p className="mt-1.5 text-xs sm:text-sm text-[#5F6B74] leading-relaxed">{pt.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))
                }

                < div className = "pt-2" >
                <button
                  onClick={onOpenDataSources}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#237F8E] hover:text-[#1B6572] transition"
                >
                  <span>{isId ? 'Lihat bagaimana kami menyatukan 26 sumber data' : 'Inspect how we assimilate 26 audited data sources'}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
            </div>
          </div>

          {/* Right Column: Visual Case Study / Real Satellite Reality Card (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-[#E6EBF0] bg-white p-6 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6EBF0]">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#237F8E]" />
                <span className="text-xs font-bold text-[#14232B]">
                  {isId ? 'Studi Kasus: Lembah Serayu, Banyumas' : 'Pilot Field: Serayu Basin, Banyumas'}
                </span>
              </div>
              <span className="text-[10px] text-[#5F6B74] font-medium">NASA POWER & SRTM</span>
            </div>

            {/* Scenario Switcher Tabs */}
            <div className="mt-4 flex rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] p-1 text-xs font-semibold">
              <button
                onClick={() => setActiveScenario('normal')}
                className={`flex-1 py-1.5 rounded-lg transition ${activeScenario === 'normal'
                    ? 'bg-white text-[#2E7D4F] shadow-xs font-bold'
                    : 'text-[#5F6B74] hover:text-[#14232B]'
                  }`}
              >
                {isId ? 'Tahun Normal / Basah' : 'Normal / Wet Year'}
              </button>
              <button
                onClick={() => setActiveScenario('elnino')}
                className={`flex-1 py-1.5 rounded-lg transition ${activeScenario === 'elnino'
                    ? 'bg-white text-[#B4443A] shadow-xs font-bold'
                    : 'text-[#5F6B74] hover:text-[#14232B]'
                  }`}
              >
                {isId ? 'El Niño Ekstrem (2015/23)' : 'Extreme El Niño (2015/23)'}
              </button>
            </div>

            {/* Visual Box Simulated Map Tile */}
            <div className="mt-4 rounded-xl border border-[#E6EBF0] overflow-hidden bg-slate-900 text-white relative h-48 flex flex-col justify-end p-4">
              {/* Background gradient representation */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${activeScenario === 'elnino'
                    ? 'bg-gradient-to-tr from-amber-950 via-stone-800 to-amber-900/60'
                    : 'bg-gradient-to-tr from-emerald-950 via-teal-900 to-slate-800'
                  }`}
              />

              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
                  backgroundSize: '24px 24px',
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${activeScenario === 'elnino' ? 'bg-rose-500/80 text-white' : 'bg-emerald-500/80 text-white'
                      }`}
                  >
                    {activeScenario === 'elnino' ? (
                      <>
                        <Sun className="h-3 w-3" />
                        <span>{isId ? 'Stres Air Kritis (ESI < 0.3)' : 'Critical Water Stress (ESI < 0.3)'}</span>
                      </>
                    ) : (
                      <>
                        <Droplets className="h-3 w-3" />
                        <span>{isId ? 'Air Irigasi Cukup (ESI > 0.7)' : 'Adequate Water Supply (ESI > 0.7)'}</span>
                      </>
                    )}
                  </span>
                  <span className="text-[10px] text-gray-300 tabular-nums font-mono">7.51°S, 109.28°E</span>
                </div>

                <p className="mt-2 text-xs font-semibold text-white">
                  {activeScenario === 'elnino'
                    ? isId
                      ? 'Pola Padi-Padi-Bera: Petak kering retak di MK2. Saluran primer turun debit 70%.'
                    : 'Paddy–Paddy–Fallow: Heavy clay cracked in dry season 2. Irrigation flow collapsed 70%.'
                    : isId
                  ? 'Pola Padi-Padi-Kacang Hijau: Kanopi menutup tanah, kelembapan tersisa dimanfaatkan penuh.'
                      : 'Paddy–Paddy–Mungbean: Green canopy preserved soil moisture; zero irrigation stress.'}
                </p>
              </div>
            </div>

            {/* Metrics breakdown */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-[#F7F9FB] p-2.5 border border-[#E6EBF0]">
                <span className="block text-[10px] text-[#5F6B74]">{isId ? 'Defisit Air' : 'Water Deficit'}</span>
                <span
                  className={`text-sm font-bold tabular-nums ${activeScenario === 'elnino' ? 'text-[#B4443A]' : 'text-[#2E7D4F]'
                    }`}
                >
                  {activeScenario === 'elnino' ? '-480 mm' : '-45 mm'}
                </span>
              </div>
              <div className="rounded-xl bg-[#F7F9FB] p-2.5 border border-[#E6EBF0]">
                <span className="block text-[10px] text-[#5F6B74]">{isId ? 'Hari Bera Kosong' : 'Fallow Days'}</span>
                <span className="text-sm font-bold text-[#14232B] tabular-nums">
                  {activeScenario === 'elnino' ? '92 days' : '28 days'}
                </span>
              </div>
              <div className="rounded-xl bg-[#F7F9FB] p-2.5 border border-[#E6EBF0]">
                <span className="block text-[10px] text-[#5F6B74]">{isId ? 'Risiko Gagal' : 'Failure Risk'}</span>
                <span
                  className={`text-sm font-bold tabular-nums ${activeScenario === 'elnino' ? 'text-[#B4443A]' : 'text-[#2E7D4F]'
                    }`}
                >
                  {activeScenario === 'elnino' ? '64%' : '< 5%'}
                </span>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-[#5F6B74] text-center">
              {isId
                ? 'Field Shift mereduksi risiko ini dengan mengidentifikasi palawija yang tepat.'
                : 'Field Shift mitigates this by identifying optimal cover crops before monsoon onset.'}
            </p>
          </div>
        </div>
      </div>
    </section >
  );
}
export default ProblemSection;
