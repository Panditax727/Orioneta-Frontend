import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatRelativeTime,
  formatFileSize,
  truncateText,
  getInitials,
  stringToColor,
  debounce,
  throttle,
  isValidEmail,
  formatNumber,
  copyToClipboard,
  downloadFile,
} from './helpers';

describe('helpers', () => {
  describe('formatRelativeTime', () => {
    it('returns "ahora mismo" for less than 60 seconds', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('ahora mismo');
    });

    it('returns minutes for less than 60 minutes', () => {
      const date = new Date(Date.now() - 2 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 2 min');
    });

    it('returns hours for less than 24 hours', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 3 h');
    });

    it('returns days for less than 7 days', () => {
      const date = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('hace 5 d');
    });

    it('returns date string for 7+ days', () => {
      const date = new Date('2024-01-15');
      expect(formatRelativeTime(date)).toBe(date.toLocaleDateString());
    });
  });

  describe('formatFileSize', () => {
    it('returns "0 Bytes" for zero', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('formats bytes', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('formats KB', () => {
      expect(formatFileSize(2048)).toBe('2 KB');
    });

    it('formats MB', () => {
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
    });

    it('formats GB', () => {
      expect(formatFileSize(3 * 1024 * 1024 * 1024)).toBe('3 GB');
    });
  });

  describe('truncateText', () => {
    it('returns text unchanged if within maxLength', () => {
      expect(truncateText('hello', 10)).toBe('hello');
    });

    it('truncates and adds ellipsis when exceeding maxLength', () => {
      expect(truncateText('hello world', 5)).toBe('hello...');
    });
  });

  describe('getInitials', () => {
    it('returns "?" for empty name', () => {
      expect(getInitials('')).toBe('?');
      expect(getInitials(null)).toBe('?');
    });

    it('returns first letter of single word', () => {
      expect(getInitials('orion')).toBe('O');
    });

    it('returns first letters of multiple words', () => {
      expect(getInitials('john doe')).toBe('JD');
    });

    it('respects maxLength parameter', () => {
      expect(getInitials('John Michael Doe', 1)).toBe('J');
    });

    it('uppercases initials', () => {
      expect(getInitials('jane smith')).toBe('JS');
    });
  });

  describe('stringToColor', () => {
    it('returns a valid HSL string', () => {
      const color = stringToColor('hello');
      expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/);
    });

    it('returns consistent colors for same input', () => {
      expect(stringToColor('hello')).toBe(stringToColor('hello'));
    });

    it('returns different colors for different inputs', () => {
      expect(stringToColor('abc')).not.toBe(stringToColor('xyz'));
    });
  });

  describe('debounce', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('delays function execution', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced();
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('cancels previous calls on rapid invocation', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced();
      debounced();
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('calls immediately then blocks for limit', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);
      throttled();
      expect(fn).toHaveBeenCalledTimes(1);
      throttled();
      expect(fn).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(100);
      throttled();
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('isValidEmail', () => {
    it('returns true for valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test+label@domain.co')).toBe(true);
    });

    it('returns false for invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('not-email')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(123)).toBe('123');
    });
  });

  describe('copyToClipboard', () => {
    it('copies text and returns true on success', async () => {
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockResolvedValue() },
      });
      const result = await copyToClipboard('test');
      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test');
    });

    it('returns false on error', async () => {
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      });
      const result = await copyToClipboard('test');
      expect(result).toBe(false);
    });
  });

  describe('downloadFile', () => {
    it('creates a link and triggers download', () => {
      const clickSpy = vi.fn();
      const revokeSpy = vi.fn();
      URL.createObjectURL = vi.fn(() => 'blob:test');
      URL.revokeObjectURL = revokeSpy;
      document.createElement = vi.fn(() => ({
        href: '',
        download: '',
        click: clickSpy,
      }));
      downloadFile('content', 'test.txt', 'text/plain');
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeSpy).toHaveBeenCalledWith('blob:test');
    });
  });
});
