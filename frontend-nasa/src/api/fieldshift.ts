/**
 * Field Shift backend client + adapters to the UI domain types.
 * Every number shown in the app comes from the backend rotation engine or from an offline
 * snapshot of its real output (src/api/mock/snapshot.json) when the backend is unreachable.
 */
import type { components } from './schema';
import type {
  ClimatePhase,
  ClimateScenario,
  DataSource,
  FieldProfile,
  ScoreSet,
  Strategy,
} from '../types/domain';

type ComparisonOut = components['schemas']['ComparisonOut'];
type StrategyOut = components['schemas']['StrategyOut'];
type FieldProfileOut = components['schemas']['FieldProfileOut'];

const BASE = ((import.meta.env?.VITE_API_BASE_URL as string | undefined) || 'http://localhost:8000').replace(/\/$/, '');
const TIMEOUT_MS = 8000;

interface Envelope<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = (await res.json()) as Envelope<T>;
  if (!res.ok || !body.success || body.data === null) {
    throw new Error(body.error?.message ?? `HTTP ${res.status}`);
  }
  return body.data;
}

export const toEnsoPhase = (phase: ClimatePhase): 'el_nino' | 'la_nina' | 'neutral' =>
  phase === 'normal' ? 'neutral' : phase;

/** Backend site key for a field (only Banyumas fields exist in the UI today). */
export const siteOf = (field: FieldProfile): string =>
  field.regency.toLowerCase().includes('banyumas') ? 'banyumas' : 'nevada_mason_valley';

export function toField(f: FieldProfileOut): FieldProfile {
  return { ...f, coordinates: [f.coordinates[0], f.coordinates[1]] } as FieldProfile;
}

export const SEASON_LABEL: Record<string, string> = {
  MT1_wet: 'MT1 Nov–Feb',
  MT2_wet_dry: 'MT2 Mar–Jun',
  MT3_dry: 'MT3 Jul–Oct',
  winter_recharge: 'Winter Nov–Mar',
  growing: 'Growing Apr–Sep',
};

function cropSequence(s: StrategyOut): string[] {
  if (s.sequence.length === 1) {
    return Object.entries(s.sequence[0]).map(([season, crop]) => `${SEASON_LABEL[season] ?? season}: ${crop}`);
  }
  // multi-year rotation: group identical consecutive years
  const out: string[] = [];
  let prev = '';
  let run = 0;
  const flush = () => {
    if (run) out.push(run > 1 ? `${prev} ×${run} yr` : prev);
  };
  for (const year of s.sequence) {
    const label = Array.from(new Set(Object.values(year))).join(' / ');
    if (label === prev) run += 1;
    else {
      flush();
      prev = label;
      run = 1;
    }
  }
  flush();
  return out;
}

const SOURCE_INFO: Record<string, Omit<DataSource, 'id' | 'name'>> = {
  'NASA POWER': { resolution: '0.5° daily, 1991–2025', type: 'Reanalysis', role: 'Rainfall, temperature, ET0 (Hargreaves) and root-zone soil wetness per season', url: 'https://power.larc.nasa.gov/' },
  'NOAA ONI': { resolution: 'Monthly index', type: 'Agro Model', role: 'ENSO / IOD phase labels (Aug–Oct) to select analog years', url: 'https://www.cpc.ncep.noaa.gov/' },
  SRTM: { resolution: '30 m', type: 'Satellite', role: 'Slope share used in the erosion-exposure index', url: 'https://lpdaac.usgs.gov/products/srtmgl1v003/' },
  'USDA CDL': { resolution: '30 m annual', type: 'Satellite', role: 'Observed rotation baseline (US site)', url: 'https://croplandcros.scinet.usda.gov/' },
};

function dataSources(sources: string[]): DataSource[] {
  return sources.map((name, i) => {
    const key = Object.keys(SOURCE_INFO).find((k) => name.includes(k));
    const info = key ? SOURCE_INFO[key] : { resolution: '—', type: 'Agro Model' as const, role: 'Input' };
    return { id: `src-${i}`, name, ...info };
  });
}

const relative = (value: number, all: number[]): number => {
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  return hi === lo ? 100 : Math.round((100 * (hi - value)) / (hi - lo)); // lower is better
};

/** Convert one /rotations/compare response into UI strategies. */
export function toStrategies(c: ComparisonOut, sources: string[]): Strategy[] {
  const means = c.strategies.map((s) => s.metrics.irrigation_mean_mm);
  const worst = c.strategies.map((s) => s.metrics.irrigation_cvar_mm);
  const w = c.weights;
  const wSum = Object.values(w).reduce((a, b) => a + b, 0) || 1;

  return c.strategies.map((s) => {
    const u = s.utilities;
    // Bounded indicators are shown as absolute values; erosion (unbounded index) is relative.
    const shared = {
      soilHealth: Math.round(s.metrics.soil_health * 100),
      coverDays: Math.round(s.metrics.cover_share * 100),
      erosionControl: Math.round(u.erosion * 100),
      pestBreak: Math.round(s.metrics.pest_break_share * 100),
    };
    const overall = (water: number) =>
      Math.round(
        (w.water * water + w.soil_health * shared.soilHealth + w.erosion * shared.erosionControl + w.pest_break * shared.pestBreak) / wSum,
      );
    const meanWater = relative(s.metrics.irrigation_mean_mm, means);
    const worstWater = relative(s.metrics.irrigation_cvar_mm, worst);
    const mean: ScoreSet = { waterEfficiency: meanWater, ...shared, overall: overall(meanWater) };
    const worstCase: ScoreSet = { waterEfficiency: worstWater, ...shared, overall: overall(worstWater) };
    const dryCrop = s.sequence.some((y) => (y.MT3_dry ?? 'fallow') !== 'fallow');

    return {
      id: s.key,
      name: s.name,
      cropSequence: cropSequence(s),
      isBaseline: s.kind === 'baseline',
      paretoStatus: !s.pareto_optimal ? 'Dominated' : s.rank === 1 ? 'Optimal' : 'Tradeoff',
      confidence: s.card.confidence === 'high' ? 'HIGH' : s.card.confidence === 'medium' ? 'MODERATE' : 'LOW',
      confidenceReason: s.card.confidence_reasons.join(' '),
      scores: { mean, worstCase },
      constraintRequirements: {
        requiresIrrigationDrySeason: dryCrop,
        requiresMechanization: false,
        requiresSpecializedMarket: false,
      },
      evidence: {
        reasoning: s.card.why,
        evidence: s.card.evidence,
        dataSources: dataSources(sources),
        benefits: s.card.benefits,
        dataGaps: s.card.gaps,
        localChecks: s.card.risks_for_local_review,
      },
      metrics: {
        irrigationMeanMm: s.metrics.irrigation_mean_mm,
        irrigationWorstMm: s.metrics.irrigation_cvar_mm,
        coverShare: s.metrics.cover_share,
        legumeShare: s.metrics.legume_share,
        erosionIndex: s.metrics.erosion_index,
        analogYears: c.analogs.years,
        analogGrouping: `${c.analogs.grouping} = ${c.analogs.phase}`,
      },
    };
  });
}

export const BANYUMAS_SEASONS = ['MT1_wet', 'MT2_wet_dry', 'MT3_dry'];
/** Crops offered in the Banyumas baseline editor (temperate US crops are left out). */
export const BANYUMAS_CROPS = ['rice', 'maize', 'soybean', 'groundnut', 'chili', 'tomato', 'onion'];

const LABEL_TO_CROP: [RegExp, string][] = [
  [/fallow|bera/i, 'fallow'],
  [/paddy|padi|rice/i, 'rice'],
  [/chili|cabai|horti/i, 'chili'],
  [/tomato|tomat/i, 'tomato'],
  [/maize|corn|jagung/i, 'maize'],
  [/soy|kedelai/i, 'soybean'],
  [/groundnut|peanut|kacang tanah/i, 'groundnut'],
];

/** Initial baseline from the field's free-text rotation (one label per season, in order). */
export function baselineFromRotation(field: FieldProfile, seasons: string[] = BANYUMAS_SEASONS): Record<string, string> {
  return Object.fromEntries(
    seasons.map((season, i) => {
      const label = field.currentRotation[i] ?? '';
      const hit = LABEL_TO_CROP.find(([re]) => re.test(label));
      return [season, hit ? hit[1] : 'fallow'];
    }),
  );
}

export async function fetchFields(site = 'banyumas'): Promise<FieldProfile[]> {
  const data = await call<FieldProfileOut[]>(`/api/v1/fields?site=${encodeURIComponent(site)}`);
  return data.map(toField);
}

type SiteInfo = components['schemas']['SiteInfo'];
let sitesCache: Record<string, SiteInfo> | null = null;

export async function fetchSiteInfo(site: string): Promise<SiteInfo | undefined> {
  if (!sitesCache) {
    const sites = await call<SiteInfo[]>('/api/v1/rotations/sites');
    sitesCache = Object.fromEntries(sites.map((s) => [s.key, s]));
  }
  return sitesCache[site];
}

async function siteSources(site: string): Promise<string[]> {
  return (await fetchSiteInfo(site))?.sources ?? [];
}

export async function fetchStrategies(
  site: string,
  phase: ClimatePhase,
  fieldId?: string,
  scenario?: ClimateScenario,
  baseline?: Record<string, string>,
): Promise<Strategy[]> {
  const body = {
    site,
    enso_phase: toEnsoPhase(phase),
    ...(fieldId ? { field_id: fieldId } : {}),
    ...(baseline ? { baseline: [baseline] } : {}),
    scenario: {
      rain_anomaly_pct: scenario?.rainfallAnomalyPercent ?? 0,
      temp_delta_c: scenario?.temperatureAnomalyDelta ?? 0,
    },
  };
  const [comparison, sources] = await Promise.all([
    call<ComparisonOut>('/api/v1/rotations/compare', { method: 'POST', body: JSON.stringify(body) }),
    siteSources(site),
  ]);
  return toStrategies(comparison, sources);
}
