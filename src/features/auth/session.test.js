import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveSession,
  getSession,
  clearSession,
  updateSession,
  saveProfileInSession,
  getSessionIdentity,
  normalizeAuthResponse,
  subscribeToSessionChanges,
  SESSION_KEY,
  SESSION_CHANGED_EVENT,
} from './session';

let sessionStore = {};
let localStore = {};

function createSessionStorage() {
  return {
    getItem: vi.fn((key) => sessionStore[key] ?? null),
    setItem: vi.fn((key, value) => { sessionStore[key] = String(value); }),
    removeItem: vi.fn((key) => { delete sessionStore[key]; }),
    clear: vi.fn(() => { sessionStore = {}; }),
    get length() { return Object.keys(sessionStore).length; },
    key: vi.fn((i) => Object.keys(sessionStore)[i] ?? null),
  };
}

function createLocalStorage() {
  return {
    getItem: vi.fn((key) => localStore[key] ?? null),
    setItem: vi.fn((key, value) => { localStore[key] = String(value); }),
    removeItem: vi.fn((key) => { delete localStore[key]; }),
    clear: vi.fn(() => { localStore = {}; }),
    get length() { return Object.keys(localStore).length; },
    key: vi.fn((i) => Object.keys(localStore)[i] ?? null),
  };
}

beforeEach(() => {
  sessionStore = {};
  localStore = {};
  globalThis.localStorage = createLocalStorage();
  globalThis.sessionStorage = createSessionStorage();
});

const mockAuthResponse = {
  accessToken: 'token123',
  refreshToken: 'refresh456',
  expiresInSeconds: 3600,
  userId: 'user1',
  email: 'test@orioneta.cl',
  role: 'USER',
};

describe('session', () => {
  describe('normalizeAuthResponse', () => {
    it('normalizes a minimal auth response', () => {
      const result = normalizeAuthResponse({ accessToken: 't', refreshToken: 'r', expiresIn: 3600, userId: 'u1', email: 'e@t.com' });
      expect(result.accessToken).toBe('t');
      expect(result.refreshToken).toBe('r');
      expect(result.expiresInSeconds).toBe(3600);
      expect(result.expiresAt).toBeGreaterThan(Date.now());
      expect(result.role).toBe('USER');
    });

    it('uses fallback for missing expiresIn', () => {
      const result = normalizeAuthResponse({ accessToken: 't', refreshToken: 'r', userId: 'u1', email: 'e@t.com' });
      expect(result.expiresInSeconds).toBe(3600);
    });

    it('extracts profileUserId from nested profile', () => {
      const result = normalizeAuthResponse({ accessToken: 't', refreshToken: 'r', expiresIn: 3600, userId: 'u1', email: 'e@t.com', profile: { userID: 'p1' } });
      expect(result.profileUserId).toBe('p1');
    });
  });

  describe('saveSession', () => {
    it('saves session to sessionStorage and dispatches event', () => {
      const spy = vi.spyOn(window, 'dispatchEvent');
      const result = saveSession(mockAuthResponse);
      expect(result.accessToken).toBe('token123');
      expect(localStorage.getItem(SESSION_KEY)).toBeNull();
      expect(sessionStorage.getItem(SESSION_KEY)).toBeTruthy();
      expect(spy).toHaveBeenCalledWith(expect.any(Event));
      spy.mockRestore();
    });
  });

  describe('getSession', () => {
    it('returns null when no session exists', () => {
      expect(getSession()).toBeNull();
    });

    it('returns parsed session when valid', () => {
      saveSession(mockAuthResponse);
      const session = getSession();
      expect(session.accessToken).toBe('token123');
      expect(session.email).toBe('test@orioneta.cl');
    });

    it('returns null for expired session', () => {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...mockAuthResponse, expiresAt: Date.now() - 1000 }));
      expect(getSession()).toBeNull();
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it('migrates from localStorage to sessionStorage', () => {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ ...mockAuthResponse, expiresAt: Date.now() + 100000 }));
      expect(getSession()).not.toBeNull();
      expect(sessionStorage.getItem(SESSION_KEY)).toBeTruthy();
      expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('removes session from both storages and dispatches event', () => {
      saveSession(mockAuthResponse);
      const spy = vi.spyOn(window, 'dispatchEvent');
      clearSession();
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
      expect(localStorage.getItem(SESSION_KEY)).toBeNull();
      expect(spy).toHaveBeenCalledWith(expect.any(Event));
      spy.mockRestore();
    });
  });

  describe('updateSession', () => {
    it('updates existing session with new values', () => {
      saveSession(mockAuthResponse);
      const updated = updateSession({ role: 'ADMIN' });
      expect(updated.role).toBe('ADMIN');
      expect(updated.accessToken).toBe('token123');
    });

    it('returns null if no session exists', () => {
      expect(updateSession({ role: 'ADMIN' })).toBeNull();
    });
  });

  describe('saveProfileInSession', () => {
    it('saves profile and profileUserId', () => {
      saveSession(mockAuthResponse);
      const profile = { userID: 'p1', displayName: 'Test' };
      const result = saveProfileInSession(profile);
      expect(result.profile).toEqual(profile);
      expect(result.profileUserId).toBe('p1');
    });

    it('returns current session when profile is null', () => {
      saveSession(mockAuthResponse);
      const result = saveProfileInSession(null);
      expect(result.accessToken).toBe('token123');
    });
  });

  describe('getSessionIdentity', () => {
    it('returns "anonymous" when no session', () => {
      expect(getSessionIdentity(null)).toBe('anonymous');
      expect(getSessionIdentity()).toBe('anonymous');
    });

    it('returns profileUserId when available', () => {
      expect(getSessionIdentity({ profileUserId: 'p1', email: 'e@t.com', userId: 'u1' })).toBe('p1');
    });

    it('falls back to email then userId', () => {
      expect(getSessionIdentity({ email: 'e@t.com', userId: 'u1' })).toBe('e@t.com');
      expect(getSessionIdentity({ userId: 'u1' })).toBe('u1');
    });
  });

  describe('subscribeToSessionChanges', () => {
    it('calls callback on session change event', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToSessionChanges(callback);
      window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
      expect(callback).toHaveBeenCalled();
      unsubscribe();
    });

    it('returns unsubscribe function that removes listener', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToSessionChanges(callback);
      unsubscribe();
      window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
