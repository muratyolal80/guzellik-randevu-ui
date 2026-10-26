import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Fake otp_codes table: one active row, updates recorded
let row: { id: string; code: string; attempts: number } | null;
const updates: Record<string, unknown>[] = [];

vi.mock('../supabase-admin', () => {
  const select = () => {
    const chain = {
      eq: () => chain,
      gt: () => chain,
      order: () => chain,
      limit: () => chain,
      maybeSingle: async () => ({ data: row, error: null }),
    };
    return chain;
  };
  return {
    supabaseAdmin: {
      from: () => ({
        select,
        update: (patch: Record<string, unknown>) => ({
          eq: async () => {
            updates.push(patch);
            if (row && typeof patch.attempts === 'number') row.attempts = patch.attempts;
            return { error: null };
          },
        }),
      }),
    },
  };
});

import { verifyOTP, isOtpDemoMode, OTP_MAX_ATTEMPTS } from '../auth/otp';

const env = { ...process.env };
beforeEach(() => {
  row = { id: 'otp-1', code: '482913', attempts: 0 };
  updates.length = 0;
  delete process.env.OTP_DEMO_MODE;
});
afterEach(() => { process.env = { ...env }; });

describe('verifyOTP', () => {
  it('accepts the right code and burns it', async () => {
    expect(await verifyOTP('5551112233', '482913')).toBe(true);
    expect(updates).toContainEqual({ used: true });
  });

  it('counts wrong guesses and burns the code at the limit', async () => {
    for (let i = 1; i < OTP_MAX_ATTEMPTS; i++) {
      expect(await verifyOTP('5551112233', '000000')).toBe(false);
      expect(updates.at(-1)).toEqual({ attempts: i, used: false });
    }
    expect(await verifyOTP('5551112233', '000000')).toBe(false);
    expect(updates.at(-1)).toEqual({ attempts: OTP_MAX_ATTEMPTS, used: true });
  });

  it('rejects even the right code once attempts are exhausted', async () => {
    row!.attempts = OTP_MAX_ATTEMPTS;
    expect(await verifyOTP('5551112233', '482913')).toBe(false);
  });
});

describe('isOtpDemoMode', () => {
  it('is off in production unless explicitly allowed', () => {
    process.env.OTP_DEMO_MODE = 'true';
    (process.env as Record<string, string>).NODE_ENV = 'production';
    expect(isOtpDemoMode()).toBe(false);
    process.env.OTP_DEMO_ALLOW_IN_PRODUCTION = 'true';
    expect(isOtpDemoMode()).toBe(true);
  });
});
