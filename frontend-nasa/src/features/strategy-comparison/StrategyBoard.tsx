import React, { useState } from 'react';
import type { Strategy, PriorityWeights, ClimatePhase, FarmerConstraints, ClimateScenario } from '../../types/domain';
import type { Language } from '../../types/landing';
import { DEFAULT_CAUTION } from '../../lib/scoring';
import { formatStrategyTitle } from '../../lib/cropTranslation';
import { CropSequencePill } from '../../components/stickers/CropSequencePill';
import {
  ShieldCheck,
  FileText,
  Award,
  ArrowUpDown,
  Droplets,
  Sprout,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  Radar as RadarIcon,
  LayoutGrid,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend as RechartsLegend,
  Tooltip as RechartsTooltip,
} from 'recharts';

interface StrategyBoardProps {
  strategies: Strategy[];
  weights: PriorityWeights;
  climatePhase: ClimatePhase;
  constraints: FarmerConstraints;
  scenario: ClimateScenario;
  onOpenEvidence: (strategy: Strategy) => void;
  isCalculating?: boolean;
  currentLang?: Language;
}

export const StrategyBoard: React.FC<StrategyBoardProps> = ({
  strategies,
  weights,
  constraints,
  onOpenEvidence,
  isCalculating = false,
  currentLang = 'id',
}) => {
  const isId = currentLang === 'id';
  // Caution slider: 0 = Pure Mean, 1 = Pure CVaR (Worst Case)
  const [cautionLevel, setCautionLevel] = useState<number>(DEFAULT_CAUTION);
  const [viewMode, setViewMode] = useState<'cards' | 'radar'>('cards');

  // Check which constraints a strategy violates
  const getViolations = (strat: Strategy): string[] => {
    const list: string[] = [];
    if (!constraints.irrigationAccess && strat.constraintRequirements?.requiresIrrigationDrySeason) {
      list.push(isId ? 'Irigasi Air Terkendala' : 'Dry Season Irrigation Constrained');
    }
    if (!constraints.machineryAccess && strat.constraintRequirements?.requiresMechanization) {
      list.push(isId ? 'Alat Traktor Terkendala' : 'Mechanization / Tractor Constrained');
    }
    if (!constraints.marketAccess && strat.constraintRequirements?.requiresSpecializedMarket) {
      list.push(isId ? 'Akses Pasar Terbatas' : 'Specialized Market Access Constrained');
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

  const topStrategy = sortedStrategies[0] || strategies[0];
  const baselineStrategy = strategies.find((s) => s.isBaseline) || strategies[strategies.length - 1];

  const radarData = [
    {
      subject: isId ? 'Efisiensi Air' : 'Water Efficiency',
      winner: topStrategy?.scores.mean.waterEfficiency ?? 0,
      baseline: baselineStrategy?.scores.mean.waterEfficiency ?? 0,
      fullMark: 100,
    },
    {
      subject: isId ? 'Kesehatan Tanah' : 'Soil Health',
      winner: topStrategy?.scores.mean.soilHealth ?? 0,
      baseline: baselineStrategy?.scores.mean.soilHealth ?? 0,
      fullMark: 100,
    },
    {
      subject: isId ? 'Tutupan Lahan' : 'Ground Cover',
      winner: topStrategy?.scores.mean.coverDays ?? 0,
      baseline: baselineStrategy?.scores.mean.coverDays ?? 0,
      fullMark: 100,
    },
    {
      subject: isId ? 'Kontrol Erosi' : 'Erosion Control',
      winner: topStrategy?.scores.mean.erosionControl ?? 0,
      baseline: baselineStrategy?.scores.mean.erosionControl ?? 0,
      fullMark: 100,
    },
    {
      subject: isId ? 'Pemutus Hama' : 'Pest Break',
      winner: topStrategy?.scores.mean.pestBreak ?? 0,
      baseline: baselineStrategy?.scores.mean.pestBreak ?? 0,
      fullMark: 100,
    },
  ];

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
              {isId
                ? 'Interpolasikan antara hasil rata-rata multi-tahun dan risiko tahun terburuk (rata-rata 20% tahun analog terburuk, CVaR20)'
                : 'Interpolate between multi-year average outcomes and worst-case ruin risk (mean of driest 20% analog years, CVaR20)'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Caution Slider */}
            <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 self-start sm:self-auto">
              <span className="text-xs font-semibold text-gray-800">
                {isId ? 'Tingkat Kehati-hatian:' : 'Caution Level:'}
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(cautionLevel * 100)}
                onChange={(e) => setCautionLevel(Number(e.target.value) / 100)}
                className="h-2 w-32 cursor-pointer appearance-none rounded-full bg-gray-200 accent-[#237F8E]"
              />
              <span className="font-mono text-xs font-bold text-[#237F8E] tabular-nums">
                {Math.round(cautionLevel * 100)}%
              </span>
            </div>

            {/* View Mode Switcher: Cards vs Radar */}
            <div className="flex items-center rounded-full border border-gray-200 bg-gray-50 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition cursor-pointer ${viewMode === 'cards'
                    ? 'bg-white text-[#237F8E] shadow-2xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>{isId ? 'Kartu Strategi' : 'Strategy Cards'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('radar')}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition cursor-pointer ${viewMode === 'radar'
                    ? 'bg-white text-[#237F8E] shadow-2xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <RadarIcon className="h-3.5 w-3.5" />
                <span>{isId ? 'Radar Multi-Objektif' : 'Multi-Objective Radar'}</span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-gray-500">
          {isId
            ? 'Efisiensi Air dan Perlindungan Erosi relatif terhadap strategi yang dibandingkan (100 = terbaik di antaranya); Kesehatan Tanah, Tutupan Lahan dan Pemutus Siklus Hama bernilai absolut (0–100). Fase ENSO, skenario hujan/suhu, lereng dan kapasitas air tanah petak dihitung ulang oleh engine backend.'
            : 'Water Efficiency and Erosion Control are relative to compared strategies (100 = best among them); Soil Health, Canopy Cover, and Pest Cycle Break are absolute indicators (0–100). ENSO phase, rain/temp scenarios, slope, and soil water capacity are recalculated by the backend engine.'}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3 gap-2">
          <span>{isId ? '0% = Rata-Rata Hasil Murni' : '0% = Pure Mean Outcome'}</span>
          <div className="flex items-center gap-2">
            {isCalculating && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E3F1F3] text-[#1B6572] border border-[#237F8E]/30 animate-pulse motion-reduce:animate-none">
                <span className="h-1.5 w-1.5 rounded-full bg-[#237F8E] animate-ping motion-reduce:animate-none" />
                <span>{isId ? 'Menghitung Pareto...' : 'Calculating Pareto...'}</span>
              </span>
            )}
            <span className="text-[#237F8E] font-semibold bg-[#E3F1F3] px-3.5 py-0.5 rounded-full border border-[#237F8E]/25">
              Mode:{' '}
              {cautionLevel > 0.6
                ? isId
                  ? 'Perlindungan Risiko Terburuk (CVaR)'
                  : 'Worst-Case Protection (CVaR)'
                : cautionLevel < 0.3
                  ? isId
                    ? 'Hasil Agresif'
                    : 'Aggressive Yield'
                  : isId
                    ? 'Ketahanan Iklim Seimbang'
                    : 'Balanced Climate Resilience'}
            </span>
          </div>
          <span>{isId ? '100% = Proteksi Risiko Bencana (Worst-Case)' : '100% = Disaster Ruin Protection (Worst-Case)'}</span>
        </div>
      </div>

      {/* Radar Chart View (when viewMode === 'radar') */}
      {viewMode === 'radar' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <RadarIcon className="h-5 w-5 text-[#237F8E]" />
              {isId
                ? 'Visualisasi Trade-off 5-Sumbu (Rekomendasi Terpilih vs Praktik Baseline)'
                : '5-Axis Trade-off Visualization (Selected Recommendation vs Baseline Practice)'}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {isId
                ? 'Membandingkan keseimbangan multi-tujuan: efisiensi air, kesehatan tanah, tutupan lahan, kontrol erosi, dan pemutus siklus hama'
                : 'Comparing multi-objective balance: water efficiency, soil health, canopy cover, erosion control, and pest break'}
            </p>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#E6EBF0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#14232B', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94A3B8" tick={{ fontSize: 10 }} />
                <Radar
                  name={
                    isId
                      ? `Rekomendasi: ${formatStrategyTitle(topStrategy?.name ?? 'Optimal', 'id')}`
                      : `Recommended: ${formatStrategyTitle(topStrategy?.name ?? 'Optimal', 'en')}`
                  }
                  dataKey="winner"
                  stroke="#237F8E"
                  fill="#237F8E"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
                <Radar
                  name={formatStrategyTitle(
                    baselineStrategy?.name ?? (isId ? 'Pola Eksisting' : 'Current Baseline'),
                    currentLang,
                  )}
                  dataKey="baseline"
                  stroke="#8A949B"
                  fill="#8A949B"
                  fillOpacity={0.2}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
                <RechartsLegend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                <RechartsTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Strategy Grid */}
      <div
        className={`grid grid-cols-1 gap-6 lg:grid-cols-3 transition-opacity duration-300 ${isCalculating ? 'opacity-75' : 'opacity-100'
          }`}
      >
        {sortedStrategies.map((strat, rankIndex) => {
          const score = computeCompositeScore(strat);
          const isWinner = rankIndex === 0;
          const violations = getViolations(strat);
          const hasConstraints = violations.length > 0;

          return (
            <div
              key={strat.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 transition duration-200 ${isWinner && !hasConstraints
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
                        <Award className="h-3 w-3" />
                        {isId ? 'Rekomendasi Terpilih' : 'Top Recommendation'}
                      </span>
                    )}
                    {isWinner && hasConstraints && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        <AlertTriangle className="h-3 w-3" />
                        {isId ? 'Rekomendasi Bersyarat' : 'Conditional Recommendation'}
                      </span>
                    )}
                    {!isWinner && strat.isBaseline && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-[10px] font-semibold text-gray-600">
                        {isId ? 'Praktik Sekarang (Baseline)' : 'Current Practice (Baseline)'}
                      </span>
                    )}
                    {!isWinner && !strat.isBaseline && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-[10px] font-semibold text-gray-600">
                        {isId ? 'Opsi Alternatif' : 'Alternative Option'}
                      </span>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${strat.paretoStatus === 'Optimal'
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
                      {isId ? 'Terkendala Sumber Daya Lapangan:' : 'Field Resource Constraints:'}
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
                  {formatStrategyTitle(strat.name, currentLang)}
                </h4>

                {/* Chronological Crop Sequence with friendly stickers */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
                  {strat.cropSequence.map((crop, i) => (
                    <React.Fragment key={i}>
                      <CropSequencePill item={crop} currentLang={currentLang} />
                      {i < strat.cropSequence.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-gray-400 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Score Summary */}
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-gray-500 font-medium">
                      {isId ? 'Ketahanan Komposit' : 'Composite Resilience'}
                    </span>
                    <span className="text-2xl font-black text-gray-900 font-mono tabular-nums">{score}/100</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${score >= 75 ? 'bg-[#1a7a6d]' : score >= 55 ? 'bg-[#0891b2]' : 'bg-[#dc2626]'
                        }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] text-gray-500 tabular-nums font-medium">
                    <span>Worst-Case CVaR: {strat.scores.worstCase.overall}</span>
                    <span>{isId ? 'Rata-Rata Normal:' : 'Normal Average:'} {strat.scores.mean.overall}</span>
                  </div>
                </div>

                {/* Criteria Metrics */}
                <div className="mt-5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <TrendingUp className="h-3.5 w-3.5 text-[#1a7a6d]" />
                      {isId ? 'Perlindungan Erosi' : 'Erosion Protection'}
                    </span>
                    <span className="font-mono font-semibold text-gray-900 tabular-nums">
                      {strat.scores.mean.erosionControl}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Droplets className="h-3.5 w-3.5 text-[#0891b2]" />
                      {isId ? 'Efisiensi Air' : 'Water Efficiency'}
                    </span>
                    <span className="font-mono font-semibold text-gray-900 tabular-nums">
                      {strat.scores.mean.waterEfficiency}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sprout className="h-3.5 w-3.5 text-[#d97706]" />
                      {isId ? 'Kesehatan Tanah Organik' : 'Soil Organic Health'}
                    </span>
                    <span className="font-mono font-semibold text-gray-900 tabular-nums">
                      {strat.scores.mean.soilHealth}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#16a34a]" />
                      {isId ? 'Tutupan Lahan (Hari)' : 'Canopy Cover (Days)'}
                    </span>
                    <span className="font-mono font-semibold text-gray-900 tabular-nums">
                      {strat.scores.mean.coverDays}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
                      {isId ? 'Pemutus Siklus Hama' : 'Pest Cycle Break'}
                    </span>
                    <span className="font-mono font-semibold text-gray-900 tabular-nums">
                      {strat.scores.mean.pestBreak}%
                    </span>
                  </div>

                  {strat.metrics && (
                    <p className="pt-2 text-[11px] leading-relaxed text-gray-500 border-t border-gray-100">
                      {isId ? 'Kebutuhan irigasi: ' : 'Irrigation demand: '}
                      <strong className="font-mono text-gray-800">
                        {Math.round(strat.metrics.irrigationMeanMm)} mm/{isId ? 'th' : 'yr'}
                      </strong>
                      {' '}
                      ({isId ? 'tahun terkering 20%: ' : 'driest 20% years: '}
                      <strong className="font-mono text-gray-800">
                        {Math.round(strat.metrics.irrigationWorstMm)} mm
                      </strong>
                      ) &middot; {isId ? 'indeks erosi ' : 'erosion index '}
                      <strong className="font-mono text-gray-800">
                        {Math.round(strat.metrics.erosionIndex)}
                      </strong>
                      {' '}&middot; {strat.metrics.analogYears.length}{' '}
                      {isId ? 'tahun analog' : 'analog years'} ({strat.metrics.analogGrouping})
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => onOpenEvidence(strat)}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-800 shadow-xs transition hover:border-[#1a7a6d] hover:text-[#1a7a6d] cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-[#1a7a6d]" />
                  <span>
                    {isId ? 'Lihat Bukti Sensor & Verifikasi PPL' : 'View Sensor Evidence & PPL Dossier'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
