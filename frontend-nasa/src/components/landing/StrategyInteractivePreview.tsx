import { useState, useMemo } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Sprout,
  Sun,
  CloudRain,
  Activity,
} from 'lucide-react';
import type { Language } from '../../types/landing';
import { getPreviewStrategies } from '../../data/landingContent';

interface StrategyInteractivePreviewProps {
  currentLang: Language;
  onOpenWorkspace: () => void;
  onSelectEvidence: (strategyId: string) => void;
}

  export function StrategyInteractivePreview({
    currentLang,
    onOpenWorkspace,
    onSelectEvidence,
}: StrategyInteractivePreviewProps) {
  const isId = currentLang === 'id';
  const previewStrategies = getPreviewStrategies(currentLang);

  // Caution Slider (0 = Pure Average / Aggressive, 100 = 100% Worst-Year / Conservative)
  const [cautionLevel, setCautionLevel] = useState<number>(60);
  const [climatePhase, setClimatePhase] = useState<'el_nino' | 'normal' | 'la_nina'>('el_nino');

  // Compute live scores based on caution slider & climate phase
  const evaluatedStrategies = useMemo(() => {
    const cautionWeight = cautionLevel / 100;
    const avgWeight = 1 - cautionWeight;

      return previewStrategies.map((strat) => {
        let phasePenalty = 0;
        if (climatePhase === 'el_nino') {
          phasePenalty = strat.isBaseline ? -18 : strat.crops.some((c) => c.toLowerCase().includes('sorghum') || c.toLowerCase().includes('sorgum')) ? 5 : 2;
        } else if (climatePhase === 'la_nina') {
          phasePenalty = strat.isBaseline ? 10 : 0;
        }

        const rawAvg = Math.min(100, Math.max(10, strat.avgScore + phasePenalty));
        const rawWorst = Math.min(100, Math.max(10, strat.worstScore + (climatePhase === 'el_nino' && strat.isBaseline ? -8 : 0)));

        // Composite risk-adjusted score: (1 - caution) * Average + caution * WorstYear
        const compositeScore = Math.round(rawAvg * avgWeight + rawWorst * cautionWeight);

        return {
          ...strat,
          currentScore: compositeScore,
          computedAvg: rawAvg,
          computedWorst: rawWorst,
        };
      }).sort((a, b) => b.currentScore - a.currentScore);
  }, [cautionLevel, climatePhase, previewStrategies]);

  const getConfidenceBadge = (confidence: { level: string; label: string; reason: string }) => {
    switch (confidence.level) {
      case 'high':
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-[#2E7D4F] border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-[#2E7D4F]" />
            <span>● {confidence.label}</span>
          </div>
        );
      case 'medium':
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-[#B7791F] border border-amber-200">
            <AlertTriangle className="h-3 w-3 text-[#B7791F]" />
            <span>▲ {confidence.label}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-[#B4443A] border border-rose-200">
            <HelpCircle className="h-3 w-3 text-[#B4443A]" />
            <span>■ {confidence.label}</span>
          </div>
        );
    }
  };

  return (
    <section id="preview-strategi" className="py-16 sm:py-24 bg-white border-b border-[#E6EBF0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-8 border-b border-[#E6EBF0]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#237F8E]/20 bg-[#E3F1F3] px-3.5 py-1 text-[11px] font-bold tracking-wider text-[#237F8E] uppercase mb-3">
              <Activity className="h-3.5 w-3.5 text-[#237F8E]" />
              <span>✓ {isId ? 'SIMULASI LIVE ROTASI TANAMAN' : 'LIVE ROTATION RISK SIMULATOR'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#14232B]">
              {isId ? 'Bandingkan ≥ 3 Strategi Berdasarkan Risiko' : 'Compare ≥ 3 Strategies Across Climate Risks'}
            </h2>

            <p className="mt-2 text-sm text-[#5F6B74] leading-relaxed">
              {isId
                ? 'Tidak ada satu tombol rekomendasi mutlak. Geser slider kehati-hatian atau ubah skenario iklim untuk melihat bagaimana peringkat rotasi bergeser secara dinamis.'
                : 'No dogmatic black-box decree. Adjust the Caution Slider or seasonal climate phase to observe how rankings adapt dynamically to extreme risk.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenWorkspace()}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#237F8E] to-[#1E5B4F] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:from-[#1B6572] hover:to-[#17463c]"
            >
              <span>{isId ? 'Uji dengan Data Petakmu di Workspace' : 'Test on Your Plot in Workspace'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* CONTROLS BAR: Caution Slider & ENSO Phase Picker */}
        <div className="mt-8 rounded-2xl border border-[#E6EBF0] bg-[#F7F9FB] p-5 sm:p-6 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Caution Slider (7 cols) */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between text-xs font-bold text-[#14232B] mb-2">
                <span className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-[#237F8E]" />
                  <span>{isId ? 'Slider Kehati-hatian (Bobot Tahun Terburuk CVaR)' : 'Caution Slider (Worst-Year CVaR Weight)'}</span>
                </span>
                <span className="rounded-full bg-[#E3F1F3] px-2.5 py-0.5 text-[#1B6572] tabular-nums font-bold">
                  {cautionLevel}% {isId ? 'Hati-hati' : 'Caution'}
                </span>
              </div>

              <div className="relative pt-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cautionLevel}
                  onChange={(e) => setCautionLevel(Number(e.target.value))}
                  aria-label="Caution slider"
                  aria-valuetext={isId ? `Penilaian menimbang tahun terburuk sebesar ${cautionLevel}%` : `Weighing worst-case climate year by ${cautionLevel}%`}
                  className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#237F8E]"
                />
                <div className="flex justify-between text-[11px] text-[#5F6B74] mt-2 font-medium">
                  <span>{isId ? '0% (Berani / Rata-rata)' : '0% (Aggressive / Average)'}</span>
                  <span className="text-center text-[#237F8E] font-semibold">
                    {isId
                      ? `Penilaian menimbang tahun terburuk sebesar ${cautionLevel}%`
                      : `Weighing worst-case climate year by ${cautionLevel}%`}
                  </span>
                  <span>{isId ? '100% (Sangat Hati-hati)' : '100% (Conservative / Anti-Ruin)'}</span>
                </div>
              </div>
            </div>

            {/* Climate Phase Selector (5 cols) */}
            <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-[#E6EBF0] pt-4 lg:pt-0 lg:pl-6">
              <span className="block text-xs font-bold text-[#14232B] mb-2">
                {isId ? 'Skenario Iklim Musim Depan:' : 'Projected Climate Scenario:'}
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setClimatePhase('el_nino')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition ${climatePhase === 'el_nino'
                      ? 'border-rose-400 bg-rose-50 text-rose-800 ring-1 ring-rose-400'
                      : 'border-[#E6EBF0] bg-white text-[#5F6B74] hover:bg-gray-50'
                    }`}
                >
                  <Sun className="h-4 w-4 mb-0.5 text-rose-600" />
                  <span>El Niño</span>
                  <span className="text-[9px] font-normal text-rose-700/80">{isId ? 'Kering Ekstrem' : 'Extreme Drought'}</span>
                </button>

                <button
                  onClick={() => setClimatePhase('normal')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition ${climatePhase === 'normal'
                      ? 'border-[#237F8E] bg-[#E3F1F3] text-[#1B6572] ring-1 ring-[#237F8E]'
                      : 'border-[#E6EBF0] bg-white text-[#5F6B74] hover:bg-gray-50'
                    }`}
                >
                  <Sprout className="h-4 w-4 mb-0.5 text-[#237F8E]" />
                  <span>Normal</span>
                  <span className="text-[9px] font-normal text-gray-500">{isId ? 'Klimatologis' : 'Climatological'}</span>
                </button>

                <button
                  onClick={() => setClimatePhase('la_nina')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition ${climatePhase === 'la_nina'
                      ? 'border-sky-400 bg-sky-50 text-sky-800 ring-1 ring-sky-400'
                      : 'border-[#E6EBF0] bg-white text-[#5F6B74] hover:bg-gray-50'
                    }`}
                >
                  <CloudRain className="h-4 w-4 mb-0.5 text-sky-600" />
                  <span>La Niña</span>
                  <span className="text-[9px] font-normal text-sky-700/80">{isId ? 'Hujan Tinggi' : 'High Rainfall'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STRATEGY COMPARISON CARDS (At least 3 side-by-side) */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {evaluatedStrategies.map((strat, index) => {
            const isRank1 = index === 0;

            return (
              <div
                key={strat.id}
                className={`rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between ${strat.isDominated
                    ? 'border-2 border-dashed border-[#8A949B] bg-[#F7F9FB]/80'
                    : isRank1
                      ? 'border-2 border-[#237F8E] bg-white shadow-card ring-1 ring-[#237F8E]/20'
                      : 'border border-[#E6EBF0] bg-white shadow-xs hover:border-[#237F8E]/40'
                  }`}
              >
                <div>
                  {/* Top Status & Pareto Tag */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#E6EBF0]">
                    <div>
                      <span className="text-[10px] font-bold text-[#5F6B74] uppercase tracking-wider block">
                        {isId ? `Peringkat #${index + 1}` : `Rank #${index + 1}`}
                      </span>
                      <span
                        className={`inline-block mt-0.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${strat.isDominated
                            ? 'bg-gray-200 text-[#8A949B]'
                            : strat.isBaseline
                              ? 'bg-[#E3F1F3] text-[#1B6572]'
                              : 'bg-emerald-50 text-[#2E7D4F] border border-emerald-200'
                          }`}
                      >
                        {strat.badge}
                      </span>
                    </div>

                    {getConfidenceBadge(strat.confidence)}
                  </div>

                  {/* Pareto Dominated Tag Warning */}
                  {strat.isDominated && (
                    <div className="mt-3 rounded-xl border border-dashed border-gray-300 bg-gray-100 p-2 text-center text-[11px] font-bold text-[#8A949B]">
                      ⚠ {isId ? 'Kalah di Semua Aspek (Pareto Dominated)' : 'Dominated on All Objectives (Pareto Inferior)'}
                    </div>
                  )}

                  {/* Strategy Title & Crops Sequence */}
                  <h3 className="mt-4 text-base font-bold text-[#14232B] leading-snug">
                    {strat.name}
                  </h3>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {strat.crops.map((crop, cIdx) => (
                      <span
                        key={cIdx}
                        className="rounded-lg bg-[#F7F9FB] border border-[#E6EBF0] px-2 py-0.5 text-[10px] font-medium text-[#14232B]"
                      >
                        {cIdx + 1}. {crop}
                      </span>
                    ))}
                  </div>

                  {/* Big Score Display */}
                  <div className="mt-5 rounded-2xl bg-[#F7F9FB] p-4 border border-[#E6EBF0] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#5F6B74] uppercase tracking-wider block">
                        {isId ? 'Skor Bobot Risiko' : 'Composite Risk Score'}
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span
                          className={`text-3xl font-extrabold tabular-nums ${strat.isDominated ? 'text-[#8A949B]' : 'text-[#237F8E]'
                            }`}
                        >
                          {strat.currentScore}
                        </span>
                        <span className="text-xs text-[#5F6B74]">/ 100</span>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <div className="text-[#5F6B74]">
                        <span>{isId ? 'Rata-rata: ' : 'Mean: '}</span>
                        <strong className="text-[#14232B] tabular-nums font-semibold">{strat.computedAvg}</strong>
                      </div>
                      <div className="mt-0.5">
                        <span className="text-[#B4443A] font-medium">{isId ? 'Th. Terburuk: ' : 'Worst Year: '}</span>
                        <strong className="text-[#B4443A] tabular-nums font-bold">{strat.computedWorst}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Mini Metric Bars */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-[#5F6B74]">
                      <span>{isId ? 'Kebutuhan Air:' : 'Water Demand:'}</span>
                      <strong className="text-[#14232B]">{strat.metrics.waterDemand}</strong>
                    </div>
                    <div className="flex justify-between text-[#5F6B74]">
                      <span>{isId ? 'Hari Stres Tanaman:' : 'Crop Stress Days:'}</span>
                      <strong className="text-[#14232B]">{strat.metrics.stressDays}</strong>
                    </div>
                    <div className="flex justify-between text-[#5F6B74]">
                      <span>{isId ? 'Kesehatan Tanah:' : 'Soil Health Index:'}</span>
                      <strong className="text-[#1E5B4F]">{strat.metrics.soilHealth}</strong>
                    </div>
                    <div className="flex justify-between text-[#5F6B74]">
                      <span>{isId ? 'Tutupan Hijau:' : 'Ground Cover Days:'}</span>
                      <strong className="text-[#14232B]">{strat.metrics.coverDays}</strong>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-[#5F6B74] leading-relaxed italic border-t border-[#E6EBF0] pt-3">
                    &ldquo;{strat.summary}&rdquo;
                  </p>
                </div>

                {/* Evidence Trigger Button */}
                <div className="mt-6 pt-3 border-t border-[#E6EBF0]">
                  <button
                    onClick={() => onSelectEvidence(strat.id)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#E6EBF0] bg-white p-2.5 text-xs font-bold text-[#237F8E] hover:border-[#237F8E] hover:bg-[#E3F1F3]/50 transition"
                  >
                    <span>{isId ? 'Lihat Bukti Satelit →' : 'Inspect Satellite Evidence →'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Helper Note */}
        <div className="mt-6 text-center text-xs text-[#5F6B74]">
          <span>
            {isId
              ? '💡 Catatan: Skor Conditional Value at Risk (CVaR) merefleksikan 10% tahun terburuk dalam 25 tahun rekaman NASA POWER.'
              : '💡 Note: Conditional Value at Risk (CVaR) score reflects the worst 10% climate years across 25 years of NASA POWER records.'}
          </span>
        </div>
      </div>
    </section>
  );
}
export default StrategyInteractivePreview;
