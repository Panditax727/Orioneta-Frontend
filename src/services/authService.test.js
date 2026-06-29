import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  login,
  register,
  getOAuthProviders,
  mergeOAuthProviders,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  redirectToOAuth,
  DEFAULT_OAUTH_PROVIDERS,
} from './authService';

vi.mock('./apiClient', () => ({
  apiRequest: vi.fn(),
  resolveApiUrl: vi.fn((url) => url),
}));

import { apiRequest, resolveApiUrl } from './apiClient';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authService', () => {
  describe('DEFAULT_OAUTH_PROVIDERS', () => {
    it('has google and github providers', () => {
      expect(DEFAULT_OAUTH_PROVIDERS).toHaveLength(2);
      expect(DEFAULT_OAUTH_PROVIDERS[0].id).toBe('google');
      expect(DEFAULT_OAUTH_PROVIDERS[1].id).toBe('github');
    });
  });

  describe('login', () => {
    it('calls apiRequest with correct params', async () => {
      apiRequest.mockResolvedValueOnce({ accessToken: 't' });
      const result = await login({ email: 'a@b.com', password: '123' });
      expect(apiRequest).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        body: { email: 'a@b.com', password: '123' },
        auth: false,
      });
      expect(result.accessToken).toBe('t');
    });
  });

  describe('register', () => {
    it('calls apiRequest with correct params', async () => {
      apiRequest.mockResolvedValueOnce({ accessToken: 't' });
      const data = { email: 'a@b.com', password: '123', displayName: 'Test' };
      const result = await register(data);
      expect(apiRequest).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        body: data,
        auth: false,
      });
      expect(result.accessToken).toBe('t');
    });
  });

  describe('getOAuthProviders', () => {
    it('calls apiRequest without auth', async () => {
      apiRequest.mockResolvedValueOnce([{ provider: 'google' }]);
      const result = await getOAuthProviders();
      expect(apiRequest).toHaveBeenCalledWith('/api/auth/oauth2/providers', { auth: false });
      expect(result).toEqual([{ provider: 'google' }]);
    });
  });

  describe('mergeOAuthProviders', () => {
    it('merges API providers with defaults', () => {
      const apiProviders = [
        { provider: 'google', authorizationUrl: '/custom/google' },
      ];
      const result = mergeOAuthProviders(apiProviders);
      expect(result).toHaveLength(2);
      expect(result[0].authorizationUrl).toBe('/custom/google');
      expect(result[0].id).toBe('google');
      expect(result[0].enabled).toBe(true);
    });

    it('handles null apiProviders', () => {
      const result = mergeOAuthProviders(null);
      expect(result).toHaveLength(2);
    });

    it('handles apiProviders with providers wrapper', () => {
      const result = mergeOAuthProviders({ providers: [{ provider: 'google' }] });
      expect(result).toHaveLength(2);
    });

    it('disables provider when backend says enabled: false', () => {
      const result = mergeOAuthProviders([{ provider: 'google', enabled: false }]);
      expect(result[0].enabled).toBe(false);
    });
  });

  describe('forgotPassword', () => {
    it('calls apiRequest with email', async () => {
      apiRequest.mockResolvedValueOnce({ message: 'ok' });
      const result = await forgotPassword('a@b.com');
      expect(apiRequest).toHaveBeenCalledWith('/api/auth/forgot-password', {
        method: 'POST',
        body: { email: 'a@b.com' },
        auth: false,
      });
      expect(result.message).toBe('ok');
    });
  });

  describe('verifyResetCode', () => {
    it('calls apiRequest with email and code', async () => {
      apiRequest.mockResolvedValueOnce({ valid: true });
      const result = await verifyResetCode('a@b.com', '123456');
      expect(apiRequest).toHaveBeenCalledWith('/api/auth/verify-reset-code', {
        method: 'POST',
        body: { email: 'a@b.com', code: '123456' },
        auth: false,
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('resetPassword', () => {
    it('calls apiRequest with data', async () => {
      apiRequest.mockResolvedValueOnce({ message: 'ok' });
      const data = { email: 'a@b.com', token: '123', newPassword: 'newpass' };
      const result = await resetPassword(data);
      expect(apiRequest).toHaveBeenCalledWith('/api/auth/reset-password', {
        method: 'POST',
        body: data,
        auth: false,
      });
      expect(result.message).toBe('ok');
    });
  });

  describe('redirectToOAuth', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { assign: vi.fn() },
      });
    });

    it('redirects to provider authorizationUrl', () => {
      redirectToOAuth('google');
      expect(window.location.assign).toHaveBeenCalled();
    });

    it('throws for unknown provider', () => {
      expect(() => redirectToOAuth('unknown')).toThrow('no esta disponible');
    });

    it('throws for disabled provider', () => {
      expect(() => redirectToOAuth('google', [{ id: 'google', enabled: false }])).toThrow('no esta habilitado');
    });
  });
});
