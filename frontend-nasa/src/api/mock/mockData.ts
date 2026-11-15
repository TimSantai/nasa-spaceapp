/**
 * Offline fallback data. Not hand-written: it is a snapshot of the real Field Shift API output
 * (snapshot.json, regenerated from backend-nasa) so the UI stays honest when the backend is down.
 */
import type { ClimatePhase, FieldProfile, Strategy } from '../../types/domain';
import type { components } from '../schema';
import { toEnsoPhase, toField, toStrategies } from '../fieldshift';
import snapshot from './snapshot.json';

interface Snapshot {
  generatedAt: string;
  sites: components['schemas']['SiteInfo'][];
  fields: components['schemas']['FieldProfileOut'][];
  compare: Record<'el_nino' | 'neutral' | 'la_nina', components['schemas']['ComparisonOut']>;
}

const SNAP = snapshot as unknown as Snapshot;
const BANYUMAS_SOURCES = SNAP.sites.find((s) => s.key === 'banyumas')?.sources ?? [];

export const SNAPSHOT_DATE = SNAP.generatedAt;

/** Crop key -> label for the Banyumas baseline editor (used until /sites responds). */
export const SNAPSHOT_CROP_LABELS: Record<string, string> =
  SNAP.sites.find((s) => s.key === 'banyumas')?.crop_labels ?? {};

export const MOCK_FIELDS: FieldProfile[] = SNAP.fields.map(toField);

export function snapshotStrategies(phase: ClimatePhase): Strategy[] {
  return toStrategies(SNAP.compare[toEnsoPhase(phase)], BANYUMAS_SOURCES);
}

/** Strategies per field id (site-level climate analogs are shared by all Banyumas fields). */
export const MOCK_STRATEGIES: Record<string, Strategy[]> = Object.fromEntries(
  MOCK_FIELDS.map((f) => [f.id, snapshotStrategies('normal')]),
);
