import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  findUserById,
  findUserByEmail,
  findUserByFriendCode,
  createUserProfile,
  updateUserStatus,
  updateUserProfile,
  updateUserVisibility,
  ensureCurrentUserProfile,
  normalizeUserProfile,
} from './userService';

vi.mock('./apiClient', () => ({
  apiRequest: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(message, status, details = null) {
      super(message);
      this.status = status;
      this.details = details;
    }
  },
}));

vi.mock('./profilePhotoService', () => ({
  resolveProfilePhoto: (photo) => photo ? `resolved:${photo}` : '',
}));

vi.mock('../features/auth/session', () => ({
  getSession: vi.fn(() => ({
    accessToken: 'test-token',
    email: 'session@test.com',
    profileUserId: 'p123',
    role: 'USER',
  })),
  saveProfileInSession: vi.fn(),
}));

import { apiRequest, ApiError } from './apiClient';
import { getSession, saveProfileInSession } from '../features/auth/session';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('userService', () => {
  describe('normalizeUserProfile', () => {
    it('returns null for null profile', () => {
      expect(normalizeUserProfile(null)).toBeNull();
    });

    it('normalizes profile with badges and avatar', () => {
      const profile = normalizeUserProfile({
        userID: 'u1',
        displayName: 'John',
        userName: 'john_doe',
        email: 'john@test.com',
        profilePhoto: 'photo.jpg',
      });
      expect(profile.id).toBe('u1');
      expect(profile.name).toBe('John');
      expect(profile.avatar).toBe('J');
      expect(profile.profilePhoto).toContain('resolved:');
      expect(profile.badges).toEqual([]);
    });

    it('preserves badges from profile', () => {
      const profile = normalizeUserProfile({
        userID: 'u1',
        displayName: 'John',
        email: 'j@t.com',
        badges: ['verified'],
      });
      expect(profile.badges).toEqual(['verified']);
    });
  });

  describe('findUserById', () => {
    it('calls apiRequest and normalizes', async () => {
      apiRequest.mockResolvedValueOnce({ userID: 'u1', displayName: 'John', email: 'j@t.com' });
      const result = await findUserById('u1');
      expect(apiRequest).toHaveBeenCalledWith('/api/users/u1');
      expect(result.id).toBe('u1');
    });
  });

  describe('findUserByEmail', () => {
    it('calls apiRequest with normalized email', async () => {
      apiRequest.mockResolvedValueOnce({ userID: 'u1', displayName: 'John', email: 'test@test.com' });
      const result = await findUserByEmail('  TEST@TEST.COM  ');
      expect(apiRequest).toHaveBeenCalledWith('/api/users/lookup?email=test%40test.com');
      expect(result.id).toBe('u1');
    });
  });

  describe('findUserByFriendCode', () => {
    it('calls apiRequest with uppercased friendCode', async () => {
      apiRequest.mockResolvedValueOnce({ userID: 'u1', displayName: 'John', email: 'j@t.com' });
      const result = await findUserByFriendCode('abc123');
      expect(apiRequest).toHaveBeenCalledWith('/api/users/friend-code/ABC123');
      expect(result.id).toBe('u1');
    });
  });

  describe('createUserProfile', () => {
    it('creates user with generated username', async () => {
      apiRequest.mockResolvedValueOnce({ userID: 'u1', displayName: 'John', userName: 'john_doe', email: 'j@t.com' });
      const result = await createUserProfile({ email: 'j@t.com', displayName: 'John' });
      expect(apiRequest).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        body: expect.objectContaining({
          email: 'j@t.com',
          displayName: 'John',
        }),
      });
      expect(result.id).toBe('u1');
    });
  });

  describe('updateUserStatus', () => {
    it('calls apiRequest with status', async () => {
      apiRequest.mockResolvedValueOnce({ userID: 'u1', status: 'BUSY' });
      const result = await updateUserStatus('u1', 'BUSY');
      expect(apiRequest).toHaveBeenCalledWith('/api/users/u1/status', {
        method: 'PATCH',
        body: { status: 'BUSY' },
      });
      expect(result.id).toBe('u1');
    });
  });

  describe('updateUserProfile', () => {
    it('updates profile and saves to session', async () => {
      const profileData = { displayName: 'New Name', bio: 'Hello' };
      const apiResponse = { userID: 'u1', displayName: 'New Name', bio: 'Hello', email: 'j@t.com' };
      apiRequest.mockResolvedValueOnce(apiResponse);

      const result = await updateUserProfile('u1', profileData);
      expect(apiRequest).toHaveBeenCalledWith('/api/users/u1/profile', {
        method: 'PATCH',
        body: profileData,
      });
      expect(saveProfileInSession).toHaveBeenCalled();
      expect(result.displayName).toBe('New Name');
    });
  });

  describe('updateUserVisibility', () => {
    it('updates visibility and saves to session', async () => {
      apiRequest.mockResolvedValueOnce({ userID: 'u1', visibility: 'PRIVATE' });
      const result = await updateUserVisibility('u1', 'PRIVATE');
      expect(apiRequest).toHaveBeenCalledWith('/api/users/u1/visibility', {
        method: 'PATCH',
        body: { visibility: 'PRIVATE' },
      });
      expect(saveProfileInSession).toHaveBeenCalled();
      expect(result.visibility).toBe('PRIVATE');
    });
  });

  describe('ensureCurrentUserProfile', () => {
    it('throws if no session', async () => {
      getSession.mockReturnValueOnce(null);
      await expect(ensureCurrentUserProfile()).rejects.toThrow('No hay una sesion activa');
    });

    it('returns existing profile when email matches session', async () => {
      getSession.mockReturnValueOnce({
        accessToken: 't',
        email: 'existing@test.com',
        profile: { userID: 'u1', email: 'existing@test.com', displayName: 'Existing' },
      });
      const result = await ensureCurrentUserProfile({ email: 'existing@test.com' });
      expect(result.email).toBe('existing@test.com');
      expect(apiRequest).not.toHaveBeenCalled();
    });

    it('finds existing user by email then creates on 404', async () => {
      getSession.mockReturnValueOnce({ accessToken: 't', email: 'new@test.com' });
      apiRequest
        .mockRejectedValueOnce({ status: 404 })
        .mockResolvedValueOnce({ userID: 'u1', email: 'new@test.com', displayName: 'New' });

      const result = await ensureCurrentUserProfile({ email: 'new@test.com' });
      expect(result.userID).toBe('u1');
      expect(saveProfileInSession).toHaveBeenCalled();
    });

    it('retries on 409 then falls back to find by email', async () => {
      getSession.mockReturnValueOnce({ accessToken: 't', email: 'conflict@test.com' });

      apiRequest
        .mockRejectedValueOnce({ status: 404 })
        .mockRejectedValueOnce({ status: 409 })
        .mockRejectedValueOnce({ status: 409 })
        .mockRejectedValueOnce({ status: 409 })
        .mockResolvedValueOnce({ userID: 'u1', email: 'conflict@test.com', displayName: 'Conflict' });

      const result = await ensureCurrentUserProfile({ email: 'conflict@test.com' });
      expect(result.userID).toBe('u1');
    });
  });
});
