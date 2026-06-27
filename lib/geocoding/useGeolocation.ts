'use client';

import { useCallback, useState } from 'react';

/**
 * Sprint C (K2) — Tarayıcı geolocation API wrapper.
 * Türkiye sınırları içinde kalmasını sağlar (35-43 lat, 25-46 lng).
 */

export type GeolocationStatus = 'idle' | 'pending' | 'ok' | 'denied' | 'unsupported' | 'error';

export interface GeolocationState {
  status: GeolocationStatus;
  lat: number | null;
  lng: number | null;
  accuracyM: number | null;
  error: string | null;
  fetchedAt: number | null;
}

const INITIAL: GeolocationState = {
  status: 'idle',
  lat: null,
  lng: null,
  accuracyM: null,
  error: null,
  fetchedAt: null,
};

function inTurkeyBounds(lat: number, lng: number): boolean {
  return lat >= 35 && lat <= 43 && lng >= 25 && lng <= 46;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(INITIAL);

  const request = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setState((s) => ({ ...s, status: 'unsupported', error: 'Tarayıcı konum desteklemiyor' }));
      return;
    }

    setState((s) => ({ ...s, status: 'pending', error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (!inTurkeyBounds(lat, lng)) {
          setState({
            status: 'error',
            lat,
            lng,
            accuracyM: pos.coords.accuracy,
            error: 'Konumunuz Türkiye sınırları dışında görünüyor',
            fetchedAt: Date.now(),
          });
          return;
        }
        setState({
          status: 'ok',
          lat,
          lng,
          accuracyM: pos.coords.accuracy,
          error: null,
          fetchedAt: Date.now(),
        });
      },
      (err) => {
        let status: GeolocationStatus = 'error';
        let message = 'Konum alınamadı';
        if (err.code === err.PERMISSION_DENIED) { status = 'denied'; message = 'Konum izni reddedildi'; }
        else if (err.code === err.POSITION_UNAVAILABLE) { message = 'Konum bilgisi alınamadı'; }
        else if (err.code === err.TIMEOUT) { message = 'Konum sorgusu zaman aşımına uğradı'; }
        setState((s) => ({ ...s, status, error: message }));
      },
      { enableHighAccuracy: false, maximumAge: 5 * 60 * 1000, timeout: 8000 }
    );
  }, []);

  const reset = useCallback(() => setState(INITIAL), []);

  return { ...state, request, reset };
}

/**
 * Haversine (km). PostGIS yoksa frontend fallback.
 */
export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
