import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';

vi.mock('../../services/authService', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('../../services/userService', () => ({
  ensureCurrentUserProfile: vi.fn(),
}));

vi.mock('../../features/auth/session', () => ({
  saveSession: vi.fn(),
  getSession: vi.fn(() => null),
  clearSession: vi.fn(),
  subscribeToSessionChanges: vi.fn(() => vi.fn()),
}));

import { login, register } from '../../services/authService';
import { ensureCurrentUserProfile } from '../../services/userService';
import { saveSession, clearSession, getSession, subscribeToSessionChanges } from '../../features/auth/session';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with no user when no session', () => {
    getSession.mockReturnValue(null);
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('starts with user when session exists', () => {
    getSession.mockReturnValue({ accessToken: 'token', email: 'test@test.com' });
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeTruthy();
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('subscribes to session changes on mount', () => {
    renderHook(() => useAuth());
    expect(subscribeToSessionChanges).toHaveBeenCalled();
  });

  it('handles login successfully', async () => {
    const credentials = { email: 'test@test.com', password: 'pass123' };
    login.mockResolvedValueOnce({ accessToken: 'new-token' });
    ensureCurrentUserProfile.mockResolvedValueOnce({});

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login(credentials);
    });

    expect(login).toHaveBeenCalledWith(credentials);
    expect(saveSession).toHaveBeenCalledWith({ accessToken: 'new-token' });
    expect(ensureCurrentUserProfile).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('handles login error', async () => {
    login.mockRejectedValueOnce(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.login({ email: 'test@test.com', password: 'wrong' });
      } catch {}
    });

    expect(result.current.error).toBe('Invalid credentials');
    expect(result.current.loading).toBe(false);
  });

  it('handles registration successfully', async () => {
    const account = { email: 'new@test.com', password: 'pass123', displayName: 'New' };
    register.mockResolvedValueOnce({ accessToken: 'new-token' });
    ensureCurrentUserProfile.mockResolvedValueOnce({});

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register(account);
    });

    expect(register).toHaveBeenCalledWith(account);
    expect(saveSession).toHaveBeenCalledWith({ accessToken: 'new-token' });
    expect(ensureCurrentUserProfile).toHaveBeenCalled();
  });

  it('handles registration error', async () => {
    register.mockRejectedValueOnce(new Error('Email already exists'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.register({ email: 'existing@test.com', password: 'pass123', displayName: 'Existing' });
      } catch {}
    });

    expect(result.current.error).toBe('Email already exists');
  });

  it('handles logout', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(clearSession).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
