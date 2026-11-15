import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FieldProfile } from '../types/domain';
import {
  findNearestField,
  sortFieldsByProximity,
  isWithinObservationalBasin,
  type FieldWithDistance,
} from '../lib/geoDistance';

export interface UserCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export type GeolocationStatus =
  | 'idle'
  | 'prompting'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'error'
  | 'unsupported';

interface UseGeolocationOptions {
  fields?: FieldProfile[];
  autoPrompt?: boolean;
  lang?: 'id' | 'en';
}

interface UseGeolocationReturn {
  coords: UserCoordinates | null;
  status: GeolocationStatus;
  error: string | null;
  nearestField: FieldProfile | null;
  distanceKm: number | null;
  isWithinBasin: boolean;
  sortedFields: FieldWithDistance[];
  isPromptVisible: boolean;
  requestLocation: () => void;
  dismissPrompt: () => void;
}

const STORAGE_DISMISSED_KEY = 'fieldshift_geo_prompt_dismissed';

export function useGeolocation({
  fields = [],
  autoPrompt = true,
  lang = 'id',
}: UseGeolocationOptions = {}): UseGeolocationReturn {
  const [coords, setCoords] = useState<UserCoordinates | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return 'unsupported';
    }
    try {
      const dismissed = localStorage.getItem(STORAGE_DISMISSED_KEY);
      if (autoPrompt && !dismissed) {
        return 'prompting';
      }
    } catch {
      // Ignore storage access errors
    }
    return 'idle';
  });
  const [error, setError] = useState<string | null>(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return lang === 'id'
        ? 'Geolokasi tidak didukung pada peramban ini.'
        : 'Geolocation is not supported by this browser.';
    }
    return null;
  });
  const [isPromptVisible, setIsPromptVisible] = useState(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return false;
    }
    try {
      const dismissed = localStorage.getItem(STORAGE_DISMISSED_KEY);
      return Boolean(autoPrompt && !dismissed);
    } catch {
      return false;
    }
  });

  const executeGeolocationRequest = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setStatus('unsupported');
      return;
    }

    setStatus('requesting');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextCoords: UserCoordinates = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setCoords(nextCoords);
        setStatus('granted');
        setIsPromptVisible(false);
      },
      (err) => {
        let msg: string;
        if (err.code === 1) {
          setStatus('denied');
          msg =
            lang === 'id'
              ? 'Izin akses lokasi ditolak oleh pengguna.'
              : 'Location permission was denied.';
        } else if (err.code === 2) {
          setStatus('error');
          msg =
            lang === 'id'
              ? 'Posisi lokasi saat ini tidak dapat diperoleh.'
              : 'Position unavailable.';
        } else if (err.code === 3) {
          setStatus('error');
          msg =
            lang === 'id'
              ? 'Waktu permintaan lokasi habis (timeout).'
              : 'Location request timed out.';
        } else {
          setStatus('error');
          msg = err.message;
        }
        setError(msg);
        setIsPromptVisible(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  }, [lang]);

  // Check initial browser capability and permission state
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return;
    }

    // Check navigator.permissions query if supported
    if ('permissions' in navigator && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((permissionStatus) => {
          if (permissionStatus.state === 'granted') {
            setIsPromptVisible(false);
            executeGeolocationRequest();
          } else if (permissionStatus.state === 'denied') {
            setIsPromptVisible(false);
            setStatus('denied');
          } else if (permissionStatus.state === 'prompt') {
            try {
              const dismissed = localStorage.getItem(STORAGE_DISMISSED_KEY);
              if (autoPrompt && !dismissed) {
                setIsPromptVisible(true);
                setStatus('prompting');
              }
            } catch {
              // Ignore storage errors
            }
          }

          permissionStatus.onchange = () => {
            if (permissionStatus.state === 'granted') {
              setIsPromptVisible(false);
              executeGeolocationRequest();
            } else if (permissionStatus.state === 'denied') {
              setIsPromptVisible(false);
              setStatus('denied');
              setCoords(null);
            }
          };
        })
        .catch(() => {
          // Permissions API query unsupported or blocked; prompt state initialized via useState
        });
    }
  }, [autoPrompt, executeGeolocationRequest]);

  const requestLocation = useCallback(() => {
    executeGeolocationRequest();
  }, [executeGeolocationRequest]);

  const dismissPrompt = useCallback(() => {
    setIsPromptVisible(false);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_DISMISSED_KEY, 'true');
      } catch {
        // Gracefully handle storage errors
      }
    }
    if (status === 'prompting') {
      setStatus('idle');
    }
  }, [status]);

  // Compute nearest field
  const nearestResult = useMemo(() => {
    if (!coords || fields.length === 0) return null;
    return findNearestField(coords.latitude, coords.longitude, fields);
  }, [coords, fields]);

  // Sort fields by proximity if coords available
  const sortedFields = useMemo(() => {
    if (!coords || fields.length === 0) {
      return fields.map((f) => ({ ...f, distanceKm: 0 }));
    }
    return sortFieldsByProximity(coords.latitude, coords.longitude, fields);
  }, [coords, fields]);

  const nearestField = nearestResult ? nearestResult.field : null;
  const distanceKm = nearestResult ? nearestResult.distanceKm : null;
  const isWithinBasin = distanceKm !== null ? isWithinObservationalBasin(distanceKm) : false;

  return {
    coords,
    status,
    error,
    nearestField,
    distanceKm,
    isWithinBasin,
    sortedFields,
    isPromptVisible,
    requestLocation,
    dismissPrompt,
  };
}
