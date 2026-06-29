import { describe, it, expect } from 'vitest';
import {
  validateUsername,
  validateDisplayName,
  validateEmail,
  validateRequiredPassword,
  validatePassword,
} from './validators';

describe('validators', () => {
  describe('validateUsername', () => {
    it('returns error for empty username', () => {
      expect(validateUsername('')).toBe('El nombre de usuario es requerido');
      expect(validateUsername(null)).toBe('El nombre de usuario es requerido');
      expect(validateUsername(undefined)).toBe('El nombre de usuario es requerido');
    });

    it('returns error for too short username', () => {
      expect(validateUsername('ab')).toBe('Minimo 3 caracteres');
    });

    it('returns error for invalid characters', () => {
      expect(validateUsername('user name')).toBe('Solo letras, numeros y _');
      expect(validateUsername('user@name')).toBe('Solo letras, numeros y _');
      expect(validateUsername('user-name')).toBe('Solo letras, numeros y _');
    });

    it('returns null for valid username', () => {
      expect(validateUsername('user123')).toBeNull();
      expect(validateUsername('john_doe')).toBeNull();
      expect(validateUsername('abc')).toBeNull();
    });
  });

  describe('validateDisplayName', () => {
    it('returns error for empty displayName', () => {
      expect(validateDisplayName('')).toBe('El nombre visible es requerido');
      expect(validateDisplayName(null)).toBe('El nombre visible es requerido');
    });

    it('returns error for whitespace-only name', () => {
      expect(validateDisplayName('   ')).toBe('El nombre visible es requerido');
    });

    it('returns error for too long name', () => {
      expect(validateDisplayName('a'.repeat(81))).toBe('Maximo 80 caracteres');
    });

    it('returns null for valid displayName', () => {
      expect(validateDisplayName('John Doe')).toBeNull();
      expect(validateDisplayName('a'.repeat(80))).toBeNull();
    });
  });

  describe('validateEmail', () => {
    it('returns error for empty email', () => {
      expect(validateEmail('')).toBe('El correo es requerido');
      expect(validateEmail(null)).toBe('El correo es requerido');
    });

    it('returns error for whitespace-only email', () => {
      expect(validateEmail('   ')).toBe('El correo es requerido');
    });

    it('returns error for too long email', () => {
      expect(validateEmail('a'.repeat(121))).toBe('Maximo 120 caracteres');
    });

    it('returns error for invalid email format', () => {
      expect(validateEmail('not-an-email')).toBe('Correo invalido');
      expect(validateEmail('@domain.com')).toBe('Correo invalido');
      expect(validateEmail('user@')).toBe('Correo invalido');
    });

    it('trims whitespace before validation', () => {
      expect(validateEmail('  user@example.com  ')).toBeNull();
    });

    it('returns null for valid email', () => {
      expect(validateEmail('user@example.com')).toBeNull();
      expect(validateEmail('test+label@domain.co')).toBeNull();
    });
  });

  describe('validateRequiredPassword', () => {
    it('returns error for empty password', () => {
      expect(validateRequiredPassword('')).toBe('La contrasena es requerida');
      expect(validateRequiredPassword(null)).toBe('La contrasena es requerida');
    });

    it('returns null for any non-empty password', () => {
      expect(validateRequiredPassword('anything')).toBeNull();
      expect(validateRequiredPassword('1')).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('returns error for empty password', () => {
      expect(validatePassword('')).toBe('La contrasena es requerida');
      expect(validatePassword(null)).toBe('La contrasena es requerida');
    });

    it('returns error for too short password', () => {
      expect(validatePassword('1234567')).toBe('Minimo 8 caracteres');
    });

    it('returns error for too long password', () => {
      expect(validatePassword('a'.repeat(121))).toBe('Maximo 120 caracteres');
    });

    it('returns null for valid password', () => {
      expect(validatePassword('12345678')).toBeNull();
      expect(validatePassword('a'.repeat(120))).toBeNull();
    });
  });
});
