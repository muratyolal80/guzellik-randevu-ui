/**
 * Şifre güvenliği kuralları — Sprint B (U3)
 *
 * Min 8 karakter + en az 1 büyük harf + en az 1 küçük harf + en az 1 rakam.
 * Özel karakter zorunlu değil (Türk klavyede friction yaratıyor).
 */

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const PASSWORD_HINT_TR =
  'En az 8 karakter, en az 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir.';

export type PasswordStrength = 'zayif' | 'orta' | 'guclu';

export interface PasswordValidation {
  valid: boolean;
  errors: string[];
  strength: PasswordStrength;
}

/**
 * Şifre kuralını test eder + Türkçe hata mesajları döner.
 */
export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`En az ${PASSWORD_MIN_LENGTH} karakter olmalı`);
  }
  if (!/[a-z]/.test(password)) {
    errors.push('En az 1 küçük harf içermeli');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('En az 1 büyük harf içermeli');
  }
  if (!/\d/.test(password)) {
    errors.push('En az 1 rakam içermeli');
  }

  let strength: PasswordStrength = 'zayif';
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score >= 4) strength = 'guclu';
  else if (score >= 2) strength = 'orta';

  return { valid: errors.length === 0, errors, strength };
}
