import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({ supabase: {}, supabaseUrl: 'http://localhost:8000' }));

import { SalonDataService } from '../db/db_salon';

describe('SalonDataService.mapSalonDetail', () => {
  it('city_name objesini string olarak normalize eder', () => {
    const out = SalonDataService.mapSalonDetail({
      id: '1', name: 'Test',
      city_name: { name: 'İstanbul' },
      district_name: 'Beşiktaş',
    });
    expect(out.city_name).toBe('İstanbul');
    expect(out.district_name).toBe('Beşiktaş');
  });

  it('eksik description için boş string döner', () => {
    const out = SalonDataService.mapSalonDetail({ id: '1', name: 'X' });
    expect(out.description).toBe('');
  });

  it('features array stringify edilir, obje varsa name alınır', () => {
    const out = SalonDataService.mapSalonDetail({
      id: '1', name: 'X',
      features: ['Wi-Fi', { name: 'Otopark' }, { name: 'Klima' }],
    });
    expect(out.features).toEqual(['Wi-Fi', 'Otopark', 'Klima']);
  });

  it('working_hours dizi yoksa boş döner', () => {
    const out = SalonDataService.mapSalonDetail({ id: '1', name: 'X' });
    expect(out.working_hours).toEqual([]);
  });

  it('coordinates lat/lng numerik olur', () => {
    const out = SalonDataService.mapSalonDetail({
      id: '1', name: 'X',
      geo_latitude: '41.0082', geo_longitude: '28.9784',
    });
    expect(out.coordinates.lat).toBeCloseTo(41.0082);
    expect(out.coordinates.lng).toBeCloseTo(28.9784);
  });

  it('null girdi için null döner', () => {
    expect(SalonDataService.mapSalonDetail(null as any)).toBeNull();
  });

  it('rating average_rating fallback', () => {
    const out = SalonDataService.mapSalonDetail({ id: '1', name: 'X', average_rating: 4.5 });
    expect(out.rating).toBe(4.5);
  });
});
