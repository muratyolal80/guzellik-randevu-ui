import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit } from '../rate-limit';

describe('rateLimit (in-memory)', () => {
  beforeEach(() => {
    // memory map izolasyonu için unique key kullanıyoruz
  });

  it('limit altındaki istekleri geçirir', async () => {
    const key = `test-pass-${Math.random()}`;
    const a = await rateLimit(key, 3, 60_000);
    const b = await rateLimit(key, 3, 60_000);
    const c = await rateLimit(key, 3, 60_000);
    expect(a.success).toBe(true);
    expect(b.success).toBe(true);
    expect(c.success).toBe(true);
  });

  it('limiti aşan istekleri reddeder', async () => {
    const key = `test-block-${Math.random()}`;
    await rateLimit(key, 2, 60_000);
    await rateLimit(key, 2, 60_000);
    const blocked = await rateLimit(key, 2, 60_000);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('window dolduğunda counter sıfırlanır', async () => {
    const key = `test-reset-${Math.random()}`;
    await rateLimit(key, 1, 1); // 1ms window
    await new Promise(r => setTimeout(r, 5));
    const after = await rateLimit(key, 1, 60_000);
    expect(after.success).toBe(true);
  });
});
