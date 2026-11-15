import type { PriorityWeights, ScoreSet, Strategy } from '../types/domain';

/** Weighted 0-100 score of one score set with the farmer's priority weights. */
export function weightedOverall(s: ScoreSet, w: PriorityWeights): number {
  const total = w.waterEfficiency + w.soilHealth + w.coverDays + w.erosionControl + w.pestBreak || 1;
  const sum =
    s.waterEfficiency * w.waterEfficiency +
    s.soilHealth * w.soilHealth +
    s.coverDays * w.coverDays +
    s.erosionControl * w.erosionControl +
    s.pestBreak * w.pestBreak;
  return Math.round(sum / total);
}

/** Recompute mean / worst-case overall scores with the weights chosen in the UI. */
export function applyWeights(strategies: Strategy[], w: PriorityWeights): Strategy[] {
  return strategies.map((s) => ({
    ...s,
    scores: {
      mean: { ...s.scores.mean, overall: weightedOverall(s.scores.mean, w) },
      worstCase: { ...s.scores.worstCase, overall: weightedOverall(s.scores.worstCase, w) },
    },
  }));
}

export const DEFAULT_CAUTION = 0.4;

/** Blend of average and worst-case scores (0 = average only, 1 = worst case only). */
export const blendedScore = (s: Strategy, caution = DEFAULT_CAUTION): number =>
  Math.round((1 - caution) * s.scores.mean.overall + caution * s.scores.worstCase.overall);
