import React, { useState } from 'react';
import type { Strategy, PriorityWeights, ClimatePhase, FarmerConstraints, ClimateScenario } from '../../types/domain';
import { ShieldCheck, FileText, Award, ArrowUpDown, Droplets, Sprout, TrendingUp, ArrowRight, AlertTriangle } from 'lucide-react';

interface StrategyBoardProps {
  strategies: Strategy[];
  weights: PriorityWeights;
  climatePhase: ClimatePhase;
  constraints: FarmerConstraints;
  scenario: ClimateScenario;
  onOpenEvidence: (strategy: Strategy) => void;
}

export const StrategyBoard: React.FC<StrategyBoardProps> = ({
  strategies,
  weights,
  constraints,
  onOpenEvidence,
}) => {
  // Caution slider: 0 = Pure Mean, 1 = Pure CVaR (Worst Case)
  const [cautionLevel, setCautionLevel] = useState<number>(0.4);

  // Check which constraints a strategy violates
  const getViolations = (strat: Strategy): string[] => {
    const list: string[] = [];
    if (!constraints.irrigationAccess && strat.constraintRequirements?.requiresIrrigationDrySeason) {
      list.push('Irigasi Air Terkendala');
    }
    if (!constraints.machineryAccess && strat.constraintRequirements?.requiresMechanization) {
      list.push('Alat Traktor Terkendala');
    }
    if (!constraints.marketAccess && strat.constraintRequirements?.requiresSpecializedMarket) {
      list.push('Akses Pasar Terbatas');
    }
    return list;
  };

  // Compute composite score for a strategy given weights, caution level, climate phase, and scenario
  const computeCompositeScore = (strat: Strategy) => {
    const totalWeight =
      weights.waterEfficiency +
      weights.soilHealth +
      weights.coverDays +
      weights.erosionControl +
      weights.pestBreak || 1;

    const calcWeighted = (scores: typeof strat.scores.mean) => {
      const weightedSum =
        scores.waterEfficiency * weights.waterEfficiency +
        scores.soilHealth * weights.soilHealth +
        scores.coverDays * weights.coverDays +
        scores.erosionControl * weights.erosionControl +
        scores.pestBreak * weights.pestBreak;
      return weightedSum / totalWeight;
    };

    const meanScore = calcWeighted(strat.scores.mean);
    const worstScore = calcWeighted(strat.scores.worstCase);

    // The ENSO phase is already applied by the backend (phase-specific analog years).
    // Rainfall/temperature scenarios and field soil/slope are computed by the backend engine;
    // here only the farmer's weights and caution level are applied to the engine scores.
    const blended = (1 - cautionLevel) * meanScore + cautionLevel * worstScore;
    return Math.max(0, Math.min(100, Math.round(blended)));
  };

  // Strategies the farmer cannot run (constraints) are listed after feasible ones, not re-scored
  const sortedStrategies = [...strategies].sort((a, b) => {
    const infeasible = Number(getViolations(a).length > 0) - Number(getViolations(b).length > 0);
    return infeasible !== 0 ? infeasible : computeCompositeScore(b) - computeCompositeScore(a);
  });

  return (
    <div className="space-y-6">
      {/* Risk Horizon Controller */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#1a7a6d]" />
              <h3 className="font-bold text-gray-900 text-base">
                Risk-Aware Decision Optimizer (Pareto + CVaR)
              </h3>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Interpolasikan antara hasil rata-rata multi-tahun dan risiko tahun terburuk (analogi 15% musim kering terekstrem)
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-gray-800">Tingkat Kehati-hatian:</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(cautionLevel * 100)}
              onChange={(e) => setCautionLevel(Number(e.target.value) / 100)}
              className="h-2 w-32 cursor-pointer appearance-none rounded-full bg-gray-200 accent-[#1a7a6d]"
            />
            <span className="font-mono text-xs font-bold text-[#1a7a6d] tabular-nums">
              {Math.round(cautionLevel * 100)}%
            </span>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-gray-500">
          Efisiensi Air dan Perlindungan Erosi relatif terhadap strategi yang dibandingkan (100 = terbaik di antaranya); Kesehatan Tanah, Tutupan Lahan dan Pemutus Siklus Hama bernilai absolut (0–100). Fase ENSO, skenario hujan/suhu, lereng dan kapasitas air tanah petak dihitung ulang oleh engine backend.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3 gap-2">
          <span>0% = Rata-Rata Hasil Murni</span>
          <span className="text-[#1a7a6d] font-semibold bg-[#e8f5f2] px-3.5 py-0.5 rounded-full border border-[#bfe3db]">
            Mode: {cautionLevel > 0.6 ? 'Perlindungan Risiko Terburuk (CVaR)' : cautionLevel < 0.3 ? 'Hasil Agresif' : 'Ketahanan Iklim Seimbang'}
          </span>
          <span>100% = Proteksi Risiko Bencana (Worst-Case)</span>
        </div>
      </div>

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {sortedStrategies.map((strat, rankIndex) => {
          const score = computeCompositeScore(strat);
          const isWinner = rankIndex === 0;
          const violations = getViolations(strat);
          const hasConstraints = violations.length > 0;

          return (
            <div
              key={strat.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 transition duration-200 ${
                isWinner && !hasConstraints
                  ? 'border-[#1a7a6d] bg-[#f0f9f6]/40 shadow-card ring-1 ring-[#1a7a6d]'
                  : hasConstraints
                  ? 'border-amber-300 bg-amber-50/20 shadow-xs'
                  : 'border-gray-200 bg-white shadow-xs hover:border-gray-300'
              }`}
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between">
                  <div>
                    {isWinner && !hasConstraints && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#1a7a6d] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        <Award className="h-3 w-3" /> Rekomendasi Terpilih
                      </span>
                    )}
                    {isWinner && hasConstraints && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        <AlertTriangle className="h-3 w-3" /> Rekomendasi Bersyarat
                      </span>
                    )}
                    {!isWinner && strat.isBaseline && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-[10px] font-semibold text-gray-600">
                        Praktik Sekarang (Baseline)
                      </span>
                    )}
                    {!isWinner && !strat.isBaseline && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-[10px] font-semibold text-gray-600">
                        Opsi Alternatif
                      </span>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      strat.paretoStatus === 'Optimal'
                        ? 'bg-[#e8f5f2] text-[#1a7a6d] border border-[#bfe3db]'
                        : strat.paretoStatus === 'Tradeoff'
                        ? 'bg-cyan-50 text-[#0891b2] border border-cyan-200'
                        : 'bg-red-50 text-[#dc2626] border border-red-200'
                    }`}
                  >
                    {strat.paretoStatus}
                  </span>
                </div>

                {/* Constraint Warning Banner if violated */}
                {hasConstraints && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
                    <p className="font-bold flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                      Terkendala Sumber Daya Lapangan:
                    </p>
                    <ul className="mt-1 list-disc pl-4 text-[11px] text-amber-800 space-y-0.5">
                      {violations.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Title */}
                <h4 className="mt-3 text-lg font-bold text-gray-900 leading-snug">
                  {strat.name}
                </h4>

                {/* Chronological Crop Sequence */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
                  {strat.cropSequence.map((crop, i) => (
                    <React.Fragment key={i}>
                      <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-800">
                        {crop}
                      </span>
                      {i < strat.cropSequence.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-gray-400 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Score Summary */}
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-gray-500 font-medium">Ketahanan Komposit</span>
                    <span className="text-2xl font-black text-gray-900 font-mono tabular-nums">{score}/100</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 75 ? 'bg-[#1a7a6d]' : score >= 55 ? 'bg-[#0891b2]' : 'bg-[#dc2626]'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] text-gray-500 tabular-nums font-medium">
                    <span>Worst-Case CVaR: {strat.scores.worstCase.overall}</span>
                    <span>Rata-Rata Normal: {strat.scores.mean.overall}</span>
                  </div>
                </div>

                {/* Criteria Metrics */}
                <div className="mt-5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <TrendingUp className="h-3.5 w-3.5 text-[#1a7a6d]" /> Perlindungan Erosi
                    </span>
                    <span className="font-mono font-semibold text-gray-900 tabular-nums">
                      {strat.scores.mean.erosionControl}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Droplets className="h-3.5 w-3.5 text-[#0891b2]" /> Efisiensi Air
                    </span>
                    <span className="font-mono font-semibold text-gray-900 tabular-nums">
                      {strat.scores.mean.waterEfficiency}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sprout className="h-3.5 w-3.5 text-[#d97706]" /> Kesehatan Tanah Organik
                    </span>
                    <span className="font-mono font-semibold text-gray-900 tabular-nums">
                      {strat.scores.mean.soilHealth}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#16a34a]" /> Tutupan Lahan (Hari)
                    </span>
                    <span className="font-mono font-semibold text-gray-900 tabular-nums">
                      {strat.scores.mean.coverDays}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" /> Pemutus Siklus Hama
                    </span>
                    <span className="font-mono font-semibold text-gray-900 tabular-nums">
                      {strat.scores.mean.pestBreak}%
                    </span>
                  </div>

                  {strat.metrics && (
                    <p className="pt-2 text-[11px] leading-relaxed text-gray-500 border-t border-gray-100">
                      Kebutuhan irigasi: <strong className="font-mono text-gray-800">{Math.round(strat.metrics.irrigationMeanMm)} mm/th</strong>
                      {' '}(tahun terkering 20%: <strong className="font-mono text-gray-800">{Math.round(strat.metrics.irrigationWorstMm)} mm</strong>)
                      &middot; indeks erosi <strong className="font-mono text-gray-800">{Math.round(strat.metrics.erosionIndex)}</strong>
                      {' '}&middot; {strat.metrics.analogYears.length} tahun analog ({strat.metrics.analogGrouping})
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => onOpenEvidence(strat)}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-800 shadow-xs transition hover:border-[#1a7a6d] hover:text-[#1a7a6d]"
                >
                  <FileText className="h-4 w-4 text-[#1a7a6d]" />
                  <span>Lihat Bukti Sensor & Verifikasi PPL</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
