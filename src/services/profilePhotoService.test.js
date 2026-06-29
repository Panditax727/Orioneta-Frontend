import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isLocalProfilePhoto,
  resolveProfilePhoto,
  removeLocalProfilePhoto,
} from './profilePhotoService';

describe('isLocalProfilePhoto', () => {
  it('returns true for local avatar reference', () => {
    expect(isLocalProfilePhoto('local-avatar:user123:123456')).toBe(true);
  });

  it('returns false for URL reference', () => {
    expect(isLocalProfilePhoto('https://example.com/photo.jpg')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isLocalProfilePhoto('')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isLocalProfilePhoto(null)).toBe(false);
  });
});

describe('resolveProfilePhoto', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty string for null', () => {
    expect(resolveProfilePhoto(null)).toBe('');
  });

  it('returns URL unchanged for non-local references', () => {
    const url = 'https://example.com/photo.jpg';
    expect(resolveProfilePhoto(url)).toBe(url);
  });

  it('returns stored data for local reference', () => {
    const dataUrl = 'data:image/png;base64,abc';
    localStorage.setItem('orioneta.profile-photo.local-avatar:u1:1', dataUrl);
    expect(resolveProfilePhoto('local-avatar:u1:1')).toBe(dataUrl);
  });

  it('returns empty string for missing local reference', () => {
    expect(resolveProfilePhoto('local-avatar:u1:1')).toBe('');
  });
});

describe('removeLocalProfilePhoto', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('removes stored local photo', () => {
    const key = 'orioneta.profile-photo.local-avatar:u1:1';
    localStorage.setItem(key, 'data:image/png;base64,abc');
    removeLocalProfilePhoto('local-avatar:u1:1');
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('does nothing for non-local reference', () => {
    localStorage.setItem('other-key', 'value');
    removeLocalProfilePhoto('https://example.com/photo.jpg');
    expect(localStorage.getItem('other-key')).toBe('value');
  });
});
