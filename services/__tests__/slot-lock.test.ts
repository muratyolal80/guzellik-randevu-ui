import { describe, it, expect, vi, beforeEach } from 'vitest';
import { acquireSlotLock, releaseSlotLock } from '@/services/slot-lock';

// Mock @supabase/ssr
const mockRpc = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    rpc: mockRpc,
    from: mockFrom,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  // Default env vars (vitest doesn't load .env)
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:8000';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

  // Default chain: from().delete().eq() returns { error: null }
  mockEq.mockResolvedValue({ error: null });
  mockDelete.mockReturnValue({ eq: mockEq });
  mockFrom.mockReturnValue({ delete: mockDelete });
});

describe('acquireSlotLock', () => {
  const baseParams = {
    salonId: 'salon-1',
    staffId: 'staff-1',
    serviceId: 'svc-1',
    slotStart: new Date('2026-07-15T10:00:00Z'),
    slotEnd: new Date('2026-07-15T11:00:00Z'),
  };

  it('returns reservationId on successful RPC call', async () => {
    mockRpc.mockResolvedValueOnce({ data: 'reservation-uuid-123', error: null });

    const result = await acquireSlotLock(baseParams);

    expect(result).toEqual({ reservationId: 'reservation-uuid-123' });
    expect(mockRpc).toHaveBeenCalledWith('acquire_slot_lock', {
      p_salon_id: 'salon-1',
      p_staff_id: 'staff-1',
      p_service_id: 'svc-1',
      p_slot_start: '2026-07-15T10:00:00.000Z',
      p_slot_end: '2026-07-15T11:00:00.000Z',
      p_user_id: null,
      p_session_id: null,
    });
  });

  it('passes optional userId and sessionId', async () => {
    mockRpc.mockResolvedValueOnce({ data: 'res-1', error: null });

    await acquireSlotLock({
      ...baseParams,
      userId: 'user-42',
      sessionId: 'sess-xyz',
    });

    expect(mockRpc).toHaveBeenCalledWith(
      'acquire_slot_lock',
      expect.objectContaining({
        p_user_id: 'user-42',
        p_session_id: 'sess-xyz',
      })
    );
  });

  it('returns reason="taken" when RPC returns null data (slot busy)', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: null });

    const result = await acquireSlotLock(baseParams);

    expect(result).toEqual({ reservationId: null, reason: 'taken' });
  });

  it('returns reason="error" on RPC error', async () => {
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'DB unreachable' },
    });

    const result = await acquireSlotLock(baseParams);

    expect(result).toEqual({ reservationId: null, reason: 'error' });
  });

  it('returns reason="error" on thrown exception', async () => {
    mockRpc.mockRejectedValueOnce(new Error('network down'));

    const result = await acquireSlotLock(baseParams);

    expect(result).toEqual({ reservationId: null, reason: 'error' });
  });

  it('handles null staffId and serviceId (Any Staff flow)', async () => {
    mockRpc.mockResolvedValueOnce({ data: 'res-2', error: null });

    await acquireSlotLock({ ...baseParams, staffId: null, serviceId: null });

    expect(mockRpc).toHaveBeenCalledWith(
      'acquire_slot_lock',
      expect.objectContaining({
        p_staff_id: null,
        p_service_id: null,
      })
    );
  });
});

describe('releaseSlotLock', () => {
  it('returns true on successful delete', async () => {
    mockEq.mockResolvedValueOnce({ error: null });

    const result = await releaseSlotLock('reservation-uuid-123');

    expect(result).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('slot_reservations');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('id', 'reservation-uuid-123');
  });

  it('returns false on delete error', async () => {
    mockEq.mockResolvedValueOnce({ error: { message: 'permission denied' } });

    const result = await releaseSlotLock('res-bad');

    expect(result).toBe(false);
  });

  it('returns false on thrown exception', async () => {
    mockEq.mockRejectedValueOnce(new Error('network'));

    const result = await releaseSlotLock('res-throw');

    expect(result).toBe(false);
  });

  it('does not throw on null reservationId (defensive)', async () => {
    mockEq.mockResolvedValueOnce({ error: null });

    // @ts-expect-error testing edge case
    const result = await releaseSlotLock(null);

    expect(typeof result).toBe('boolean');
  });
});
