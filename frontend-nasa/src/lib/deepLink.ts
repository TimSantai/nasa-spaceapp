import type { FieldProfile } from '../types/domain';

export interface DeepLinkState {
  viewMode: 'landing' | 'workspace' | 'analysis';
  fieldId: string | null;
  matchedField: FieldProfile | null;
  query: string;
}

/**
 * Parses URL hash (e.g. #workspace?field=banyumas-sumbang-02&q=Kotayasa) into structured state.
 */
export function parseHash(hash: string, fields: FieldProfile[] = []): DeepLinkState {
  if (!hash) {
    return { viewMode: 'landing', fieldId: null, matchedField: null, query: '' };
  }

  const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
  const [routePart, queryPart] = cleanHash.split('?');
  const route = (routePart || '').toLowerCase();

  let viewMode: 'landing' | 'workspace' | 'analysis' = 'landing';
  if (route.includes('analysis')) {
    viewMode = 'analysis';
  } else if (route.includes('workspace') || route.includes('app')) {
    viewMode = 'workspace';
  }

  let fieldId: string | null = null;
  let query = '';
  let matchedField: FieldProfile | null = null;

  if (queryPart) {
    const params = new URLSearchParams(queryPart);
    const rawField = params.get('field');
    const rawQ = params.get('q');

    if (rawField) {
      fieldId = rawField.trim();
      matchedField = fields.find((f) => f.id.toLowerCase() === fieldId?.toLowerCase()) || null;
    }

    if (rawQ) {
      query = rawQ.trim();
      if (!matchedField && query) {
        const qLower = query.toLowerCase();
        matchedField =
          fields.find(
            (f) =>
              f.name.toLowerCase().includes(qLower) ||
              f.village.toLowerCase().includes(qLower) ||
              f.district.toLowerCase().includes(qLower) ||
              f.id.toLowerCase().includes(qLower)
          ) || null;
      }
    }
  }

  return { viewMode, fieldId, matchedField, query };
}

/**
 * Builds hash URL for workspace navigation with optional field and query parameters.
 */
export function buildWorkspaceHash(fieldId?: string | null, query?: string | null): string {
  const params = new URLSearchParams();
  if (fieldId) {
    params.set('field', fieldId);
  }
  if (query && query.trim()) {
    params.set('q', query.trim());
  }

  const qs = params.toString();
  return qs ? `#workspace?${qs}` : '#workspace';
}

/**
 * Filters observation catalog plots by keyword matching name, village, district, soil, and crop rotations.
 */
export function searchCatalogPlots(query: string, fields: FieldProfile[]): FieldProfile[] {
  const q = query.trim().toLowerCase();
  if (!q) return fields;

  return fields.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.village.toLowerCase().includes(q) ||
      f.district.toLowerCase().includes(q) ||
      f.regency.toLowerCase().includes(q) ||
      f.soil.texture.toLowerCase().includes(q) ||
      f.soil.type.toLowerCase().includes(q) ||
      f.currentRotation.some((r) => r.toLowerCase().includes(q))
  );
}
