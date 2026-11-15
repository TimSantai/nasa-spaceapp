import type { FieldProfile } from '../types/domain';

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates great-circle distance between two GPS coordinates using Haversine formula.
 * Returns distance in kilometers, rounded to 1 decimal place.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 10) / 10;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export interface FieldWithDistance extends FieldProfile {
  distanceKm: number;
  isNearest?: boolean;
}

/**
 * Finds the nearest observation field to given user coordinates.
 */
export function findNearestField(
  userLat: number,
  userLon: number,
  fields: FieldProfile[]
): { field: FieldProfile; distanceKm: number } | null {
  if (!fields.length) return null;

  let minDistance = Infinity;
  let nearestField: FieldProfile = fields[0];

  for (const field of fields) {
    const [fieldLat, fieldLon] = field.coordinates;
    const dist = calculateHaversineDistance(userLat, userLon, fieldLat, fieldLon);
    if (dist < minDistance) {
      minDistance = dist;
      nearestField = field;
    }
  }

  return { field: nearestField, distanceKm: minDistance };
}

/**
 * Sorts fields by distance to user coordinates in ascending order.
 */
export function sortFieldsByProximity(
  userLat: number,
  userLon: number,
  fields: FieldProfile[]
): FieldWithDistance[] {
  const withDistance: FieldWithDistance[] = fields.map((f) => {
    const [lat, lon] = f.coordinates;
    const distanceKm = calculateHaversineDistance(userLat, userLon, lat, lon);
    return { ...f, distanceKm };
  });

  withDistance.sort((a, b) => a.distanceKm - b.distanceKm);

  if (withDistance.length > 0) {
    withDistance[0] = { ...withDistance[0], isNearest: true };
  }

  return withDistance;
}

/**
 * Formats distance with localized units.
 */
export function formatDistance(distanceKm: number, lang: 'id' | 'en' = 'id'): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `< 1 km (${meters} m)`;
  }
  return `${distanceKm.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} km`;
}

/**
 * Checks if user is within the agricultural observation basin (default 100 km).
 */
export function isWithinObservationalBasin(
  distanceKm: number,
  thresholdKm = 100
): boolean {
  return distanceKm <= thresholdKm;
}
