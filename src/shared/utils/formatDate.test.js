import { describe, it, expect } from 'vitest';
import { formatTime, formatRelative } from './formatDate';

describe('formatDate', () => {
  describe('formatTime', () => {
    it('formats ISO string to HH:mm in es-CL locale', () => {
      const date = new Date('2026-06-26T14:30:00');
      const result = formatTime(date.toISOString());
      expect(result).toContain(':');
      expect(result.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('formatRelative', () => {
    it('returns "ahora" for less than 60 seconds', () => {
      const now = new Date();
      expect(formatRelative(now.toISOString())).toBe('ahora');
    });

    it('returns minutes for less than 60 minutes', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelative(date.toISOString())).toBe('hace 5 min');
    });

    it('returns time for less than 24 hours', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const result = formatRelative(date.toISOString());
      expect(result).toContain(':');
    });

    it('returns "ayer" for yesterday', () => {
      const date = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(formatRelative(date.toISOString())).toBe('ayer');
    });

    it('returns date for older dates', () => {
      const date = new Date('2026-01-15T10:00:00');
      const result = formatRelative(date.toISOString());
      expect(result).toMatch(/^\d{1,2} \w{3}$/);
    });
  });
});
