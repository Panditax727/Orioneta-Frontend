import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest, resolveApiUrl, ApiError, API_BASE_URL } from './apiClient';

vi.mock('../features/auth/session', () => ({
  getSession: vi.fn(() => ({ accessToken: 'test-token' })),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('apiClient', () => {
  describe('ApiError', () => {
    it('creates error with status and details', () => {
      const err = new ApiError('Not found', 404, { detail: 'missing' });
      expect(err.message).toBe('Not found');
      expect(err.status).toBe(404);
      expect(err.details).toEqual({ detail: 'missing' });
      expect(err.name).toBe('ApiError');
    });
  });

  describe('resolveApiUrl', () => {
    it('returns absolute URLs unchanged', () => {
      expect(resolveApiUrl('https://api.example.com/test')).toBe('https://api.example.com/test');
    });

    it('prepends base URL to relative paths', () => {
      expect(resolveApiUrl('/api/users')).toBe(`${API_BASE_URL}/api/users`);
    });

    it('adds leading slash if missing', () => {
      expect(resolveApiUrl('api/users')).toBe(`${API_BASE_URL}/api/users`);
    });
  });

  describe('apiRequest', () => {
    it('makes a successful GET request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: 'test' }),
      });

      const result = await apiRequest('/api/users');
      expect(result).toEqual({ data: 'test' });
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/users',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });

    it('adds Bearer token when auth is true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({}),
      });

      await apiRequest('/api/auth/login', { method: 'POST', body: {}, auth: false });

      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders.Authorization).toBeUndefined();
    });

    it('handles 204 no content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: { get: () => '' },
      });

      const result = await apiRequest('/api/users/1', { method: 'DELETE' });
      expect(result).toBeNull();
    });

    it('throws ApiError on non-ok response with JSON', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 409,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ message: 'Already exists' }),
      });

      await expect(apiRequest('/api/users')).rejects.toThrow(ApiError);
      await expect(apiRequest('/api/users')).rejects.toMatchObject({
        status: 409,
        message: 'Already exists',
      });
    });

    it('throws network error on fetch failure', async () => {
      mockFetch.mockRejectedValue(new TypeError('Network failure'));

      await expect(apiRequest('/api/test')).rejects.toThrow(ApiError);
      await expect(apiRequest('/api/test')).rejects.toMatchObject({
        status: 0,
        message: expect.stringContaining('conexion'),
      });
    });

    it('uses custom token when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({}),
      });

      await apiRequest('/api/test', { token: 'custom-token' });
      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders.Authorization).toBe('Bearer custom-token');
    });

    it('sends JSON body for POST requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({}),
      });

      await apiRequest('/api/login', { method: 'POST', body: { email: 'a@b.com', password: 'secret' } });
      const call = mockFetch.mock.calls[0][1];
      expect(call.method).toBe('POST');
      expect(call.body).toBe(JSON.stringify({ email: 'a@b.com', password: 'secret' }));
      expect(call.headers['Content-Type']).toBe('application/json');
    });
  });
});
