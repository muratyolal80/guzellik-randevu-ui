import { describe, it, expect } from 'vitest';
import {
  validatePassword,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
} from '@/lib/auth/password';

describe('validatePassword', () => {
  describe('valid passwords', () => {
    it('accepts password meeting all requirements', () => {
      const r = validatePassword('Hello123');
      expect(r.valid).toBe(true);
      expect(r.errors).toHaveLength(0);
    });

    it('accepts long password', () => {
      const r = validatePassword('ThisIsAVeryLongPassword123');
      expect(r.valid).toBe(true);
    });

    it('accepts password with special chars', () => {
      const r = validatePassword('Hello123!@#');
      expect(r.valid).toBe(true);
    });
  });

  describe('invalid passwords', () => {
    it('rejects too short', () => {
      const r = validatePassword('Ab1');
      expect(r.valid).toBe(false);
      expect(r.errors).toContain(`En az ${PASSWORD_MIN_LENGTH} karakter olmalı`);
    });

    it('rejects missing lowercase', () => {
      const r = validatePassword('PASSWORD123');
      expect(r.valid).toBe(false);
      expect(r.errors).toContain('En az 1 küçük harf içermeli');
    });

    it('rejects missing uppercase', () => {
      const r = validatePassword('password123');
      expect(r.valid).toBe(false);
      expect(r.errors).toContain('En az 1 büyük harf içermeli');
    });

    it('rejects missing digit', () => {
      const r = validatePassword('PasswordOnly');
      expect(r.valid).toBe(false);
      expect(r.errors).toContain('En az 1 rakam içermeli');
    });

    it('rejects empty string', () => {
      const r = validatePassword('');
      expect(r.valid).toBe(false);
      expect(r.errors.length).toBeGreaterThan(0);
    });

    it('lists ALL violations not just first', () => {
      const r = validatePassword('a');
      expect(r.errors.length).toBeGreaterThan(1);
    });
  });

  describe('strength meter', () => {
    it('rates short password as zayif', () => {
      // 'a' is < 8 chars → score 0 → zayif
      expect(validatePassword('a').strength).toBe('zayif');
    });

    it('rates medium-strong password as orta', () => {
      // 'Hello123' = 8 chars (1) + has lower+upper (1) + has digit (1) = score 3 → orta
      const r = validatePassword('Hello123');
      expect(r.strength).toBe('orta');
    });

    it('rates strong password (long + special chars) as guclu', () => {
      // 12+ chars (2) + has lower+upper (1) + has digit (1) + has special (1) = score 5 → guclu
      expect(validatePassword('Hello123!@#$').strength).toBe('guclu');
    });

    it('rates very strong password as guclu', () => {
      expect(validatePassword('VeryStrong!Password123$').strength).toBe('guclu');
    });
  });

  describe('PASSWORD_REGEX', () => {
    it('matches valid passwords', () => {
      expect(PASSWORD_REGEX.test('Hello123')).toBe(true);
      expect(PASSWORD_REGEX.test('Password1A')).toBe(true);
    });

    it('rejects invalid passwords', () => {
      expect(PASSWORD_REGEX.test('hello')).toBe(false);
      expect(PASSWORD_REGEX.test('HELLO123')).toBe(false);
      expect(PASSWORD_REGEX.test('Hello')).toBe(false);
      expect(PASSWORD_REGEX.test('Aa1')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('Turkish characters not counted as ASCII uppercase (known limitation)', () => {
      // 'Şifrem123' has Ş (Turkish) + lowercase + digit but NO ASCII A-Z.
      // Regex [A-Z] is ASCII-only; this is intentional — kullanıcı her zaman
      // ASCII bir büyük harf de eklesin.
      const r = validatePassword('Şifrem123');
      expect(r.valid).toBe(false);
      expect(r.errors).toContain('En az 1 büyük harf içermeli');
    });

    it('Turkish password with ASCII uppercase passes', () => {
      const r = validatePassword('ŞifremA123');
      expect(r.valid).toBe(true);
    });

    it('handles whitespace in password', () => {
      const r = validatePassword('Hello 123');
      expect(r.valid).toBe(true);
    });

    it('exactly at minimum length passes', () => {
      const r = validatePassword('Aa345678');
      expect(r.valid).toBe(true);
    });

    it('one below minimum length fails', () => {
      const r = validatePassword('Aa34567');
      expect(r.valid).toBe(false);
    });
  });
});
