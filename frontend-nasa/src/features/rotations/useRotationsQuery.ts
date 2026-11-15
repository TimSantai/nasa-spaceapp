import { useQuery } from '@tanstack/react-query';
import { useDebounce } from './useDebounce';
import {
  fetchFields,
  fetchSiteInfo,
  fetchStrategies,
} from '../../api/fieldshift';
import {
  MOCK_FIELDS,
  SNAPSHOT_CROP_LABELS,
  snapshotStrategies,
} from '../../api/mock/mockData';
import type {
  ClimatePhase,
  ClimateScenario,
  FieldProfile,
  Strategy,
} from '../../types/domain';

export interface UseFieldsQueryResult {
  fields: FieldProfile[];
  dataMode: 'live' | 'snapshot';
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

export function useFieldsQuery(site = 'banyumas'): UseFieldsQueryResult {
  const query = useQuery({
    queryKey: ['fields', site],
    queryFn: async () => {
      try {
        const live = await fetchFields(site);
        if (live && live.length > 0) {
          return { fields: live, dataMode: 'live' as const };
        }
      } catch {
        // Fallback gracefully to offline snapshot
      }
      return { fields: MOCK_FIELDS, dataMode: 'snapshot' as const };
    },
    initialData: { fields: MOCK_FIELDS, dataMode: 'snapshot' as const },
    initialDataUpdatedAt: 0,
    staleTime: 1000 * 60 * 5,
  });

  return {
    fields: query.data.fields,
    dataMode: query.data.dataMode,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: () => {
      void query.refetch();
    },
  };
}

export interface UseSiteInfoQueryResult {
  cropLabels: Record<string, string>;
  sources: string[];
  isLoading: boolean;
}

export function useSiteInfoQuery(site = 'banyumas'): UseSiteInfoQueryResult {
  const query = useQuery({
    queryKey: ['siteInfo', site],
    queryFn: async () => {
      try {
        const info = await fetchSiteInfo(site);
        if (info) {
          return {
            cropLabels: info.crop_labels ?? SNAPSHOT_CROP_LABELS,
            sources: info.sources ?? [],
          };
        }
      } catch {
        // Fallback to snapshot labels
      }
      return {
        cropLabels: SNAPSHOT_CROP_LABELS,
        sources: ['NASA POWER daily (1991-2025)', 'NOAA ONI / DMI', 'SRTM 1 arc-second'],
      };
    },
    initialData: {
      cropLabels: SNAPSHOT_CROP_LABELS,
      sources: ['NASA POWER daily (1991-2025)', 'NOAA ONI / DMI', 'SRTM 1 arc-second'],
    },
    initialDataUpdatedAt: 0,
    staleTime: 1000 * 60 * 30,
  });

  return {
    cropLabels: query.data.cropLabels,
    sources: query.data.sources,
    isLoading: query.isLoading,
  };
}

export interface UseStrategiesQueryParams {
  site: string;
  phase: ClimatePhase;
  fieldId?: string;
  scenario?: ClimateScenario;
  baseline?: Record<string, string>;
}

export interface UseStrategiesQueryResult {
  strategies: Strategy[];
  dataMode: 'live' | 'snapshot';
  isLoading: boolean;
  isFetching: boolean;
  isPlaceholderData: boolean;
  refetch: () => void;
}

export function useStrategiesQuery({
  site,
  phase,
  fieldId,
  scenario,
  baseline,
}: UseStrategiesQueryParams): UseStrategiesQueryResult {
  // Debounce scenario sliders (300ms) to prevent flooding backend on dragging
  const debouncedRain = useDebounce(scenario?.rainfallAnomalyPercent ?? 0, 300);
  const debouncedTemp = useDebounce(scenario?.temperatureAnomalyDelta ?? 0, 300);
  const baselineKey = JSON.stringify(baseline ?? {});
  const debouncedBaselineKey = useDebounce(baselineKey, 300);

  const fallback = {
    strategies: snapshotStrategies(phase),
    dataMode: 'snapshot' as const,
  };

  const query = useQuery({
    queryKey: [
      'strategies',
      site,
      phase,
      fieldId ?? 'all',
      debouncedRain,
      debouncedTemp,
      debouncedBaselineKey,
    ],
    queryFn: async () => {
      const parsedBaseline =
        debouncedBaselineKey && debouncedBaselineKey !== '{}'
          ? (JSON.parse(debouncedBaselineKey) as Record<string, string>)
          : undefined;
      const activeScenario: ClimateScenario = {
        rainfallAnomalyPercent: debouncedRain,
        temperatureAnomalyDelta: debouncedTemp,
      };

      try {
        const live = await fetchStrategies(
          site,
          phase,
          fieldId,
          activeScenario,
          parsedBaseline,
        );
        if (live && live.length > 0) {
          return { strategies: live, dataMode: 'live' as const };
        }
      } catch {
        // Fallback to snapshot on error / offline
      }
      return fallback;
    },
    placeholderData: (previousData) => previousData ?? fallback,
    staleTime: 1000 * 60 * 5,
  });

  const currentData = query.data ?? fallback;

  return {
    strategies: currentData.strategies,
    dataMode: currentData.dataMode,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    refetch: () => {
      void query.refetch();
    },
  };
}
