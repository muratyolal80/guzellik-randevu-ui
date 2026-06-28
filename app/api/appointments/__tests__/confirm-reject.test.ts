import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase-admin (service_role bypass)
const mockAdminFrom = vi.fn();
vi.mock('@/lib/supabase-admin', () => ({
    supabaseAdmin: {
        from: (...args: any[]) => mockAdminFrom(...args),
    },
}));

// Mock @supabase/ssr (server client)
const mockGetUser = vi.fn();
vi.mock('@supabase/ssr', () => ({
    createServerClient: () => ({
        auth: { getUser: mockGetUser },
    }),
}));

// Mock SMS
const mockSendSMS = vi.fn();
vi.mock('@/lib/messaging/sms', () => ({
    sendAppointmentSMS: (...args: any[]) => mockSendSMS(...args),
}));

// Test helpers
function chainResult(result: any) {
    const fn = vi.fn().mockResolvedValue(result);
    // Chain: .select().eq().maybeSingle() vb. — her seviyede aynı objeyi return
    const chain: any = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        update: vi.fn(() => chain),
        insert: vi.fn(() => chain),
        single: () => fn(),
        maybeSingle: () => fn(),
    };
    // Top-level await chain → result (örn. UPDATE().eq().eq() doğrudan promise)
    Object.defineProperty(chain, 'then', { value: (resolve: any) => resolve(result) });
    return chain;
}

beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:8000';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
});

describe('appointment approval flow — confirm/reject business rules', () => {
    describe('confirm endpoint logic', () => {
        it('rejects unauthenticated user with 401', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

            const { POST } = await import('@/app/api/appointments/[id]/confirm/route');
            const req = new Request('http://localhost/api/appointments/x/confirm', {
                method: 'POST',
            }) as any;
            req.cookies = { getAll: () => [] };

            const res = await POST(req, { params: Promise.resolve({ id: 'apt-1' }) });
            expect(res.status).toBe(401);
            const json = await res.json();
            expect(json.error).toContain('Oturum');
        });

        it('returns 404 when appointment not found', async () => {
            mockGetUser.mockResolvedValue({
                data: { user: { id: 'user-1' } },
                error: null,
            });
            mockAdminFrom.mockReturnValue(chainResult({ data: null, error: null }));

            const { POST } = await import('@/app/api/appointments/[id]/confirm/route');
            const req = new Request('http://localhost/api/appointments/x/confirm', {
                method: 'POST',
            }) as any;
            req.cookies = { getAll: () => [] };

            const res = await POST(req, { params: Promise.resolve({ id: 'apt-1' }) });
            expect(res.status).toBe(404);
        });

        it('returns 409 when appointment already CONFIRMED', async () => {
            mockGetUser.mockResolvedValue({
                data: { user: { id: 'user-1' } },
                error: null,
            });
            mockAdminFrom.mockReturnValue(
                chainResult({
                    data: {
                        id: 'apt-1',
                        status: 'CONFIRMED',
                        salon_id: 'salon-1',
                        salon: { name: 'X', owner_id: 'owner-1' },
                    },
                    error: null,
                })
            );

            const { POST } = await import('@/app/api/appointments/[id]/confirm/route');
            const req = new Request('http://localhost/api/appointments/x/confirm', {
                method: 'POST',
            }) as any;
            req.cookies = { getAll: () => [] };

            const res = await POST(req, { params: Promise.resolve({ id: 'apt-1' }) });
            expect(res.status).toBe(409);
            const json = await res.json();
            expect(json.error).toContain('CONFIRMED');
        });
    });

    describe('reject endpoint logic', () => {
        it('rejects unauthenticated user with 401', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

            const { POST } = await import('@/app/api/appointments/[id]/reject/route');
            const req = new Request('http://localhost/api/appointments/x/reject', {
                method: 'POST',
                body: JSON.stringify({ reason: 'test' }),
            }) as any;
            req.cookies = { getAll: () => [] };
            req.json = async () => ({ reason: 'test' });

            const res = await POST(req, { params: Promise.resolve({ id: 'apt-1' }) });
            expect(res.status).toBe(401);
        });

        it('returns 409 when appointment already CANCELLED', async () => {
            mockGetUser.mockResolvedValue({
                data: { user: { id: 'user-1' } },
                error: null,
            });
            mockAdminFrom.mockReturnValue(
                chainResult({
                    data: {
                        id: 'apt-1',
                        status: 'CANCELLED',
                        salon_id: 'salon-1',
                        salon: { name: 'X', owner_id: 'owner-1' },
                    },
                    error: null,
                })
            );

            const { POST } = await import('@/app/api/appointments/[id]/reject/route');
            const req = new Request('http://localhost/api/appointments/x/reject', {
                method: 'POST',
            }) as any;
            req.cookies = { getAll: () => [] };
            req.json = async () => ({});

            const res = await POST(req, { params: Promise.resolve({ id: 'apt-1' }) });
            expect(res.status).toBe(409);
        });
    });
});
