import { getSession, saveProfileInSession } from "../features/auth/session";
import { apiRequest, ApiError } from "./apiClient";

const USERNAME_MAX_LENGTH = 60;

function normalizeEmail(email) {
  return email?.trim().toLowerCase() || "";
}

function createUsernameSeed(email, displayName) {
  const source = displayName || email?.split("@")[0] || "user";
  const normalized = source
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

  if (normalized.length >= 3) {
    return normalized.slice(0, USERNAME_MAX_LENGTH);
  }

  return `user_${normalized || "ori"}`.slice(0, USERNAME_MAX_LENGTH);
}

function normalizeDisplayName(displayName, fallback) {
  const normalized = (displayName || fallback || "Usuario Orioneta").trim();

  if (normalized.length >= 3) {
    return normalized.slice(0, 60);
  }

  return `Ori ${normalized}`.slice(0, 60);
}

function buildCreateProfilePayload({ email, displayName, userName, bio, profilePhoto }, attempt = 0) {
  const normalizedEmail = normalizeEmail(email);
  const baseUserName = createUsernameSeed(normalizedEmail, userName || displayName);
  const suffix = attempt === 0 ? "" : `_${Date.now().toString(36).slice(-4)}${attempt}`;
  const maxBaseLength = USERNAME_MAX_LENGTH - suffix.length;

  return {
    userName: `${baseUserName.slice(0, maxBaseLength)}${suffix}`,
    displayName: normalizeDisplayName(displayName, baseUserName),
    bio: bio || "",
    email: normalizedEmail,
    profilePhoto: profilePhoto || "",
  };
}

export function normalizeUserProfile(profile) {
  if (!profile) {
    return null;
  }

  return {
    ...profile,
    id: profile.userID,
    name: profile.displayName || profile.userName || profile.email,
    avatar: (profile.displayName || profile.userName || profile.email || "O")
      .trim()
      .charAt(0)
      .toUpperCase(),
  };
}

export async function findUserById(userId) {
  return normalizeUserProfile(await apiRequest(`/api/users/${userId}`));
}

export async function findUserByEmail(email) {
  const query = new URLSearchParams({ email: normalizeEmail(email) });
  return normalizeUserProfile(await apiRequest(`/api/users/lookup?${query.toString()}`));
}

export async function findUserByFriendCode(friendCode) {
  return normalizeUserProfile(await apiRequest(`/api/users/friend-code/${friendCode.trim().toUpperCase()}`));
}

export async function createUserProfile(profileData, attempt = 0) {
  const payload = buildCreateProfilePayload(profileData, attempt);
  return normalizeUserProfile(await apiRequest("/api/users", {
    method: "POST",
    body: payload,
  }));
}

export async function updateUserStatus(userId, status) {
  return normalizeUserProfile(await apiRequest(`/api/users/${userId}/status`, {
    method: "PATCH",
    body: { status },
  }));
}

export async function updateUserProfile(userId, profileData) {
  const updatedProfile = normalizeUserProfile(await apiRequest(`/api/users/${userId}/profile`, {
    method: "PATCH",
    body: profileData,
  }));

  saveProfileInSession(updatedProfile);
  return updatedProfile;
}

export async function updateUserVisibility(userId, visibility) {
  const updatedProfile = normalizeUserProfile(await apiRequest(`/api/users/${userId}/visibility`, {
    method: "PATCH",
    body: { visibility },
  }));

  saveProfileInSession(updatedProfile);
  return updatedProfile;
}

export async function ensureCurrentUserProfile(profileData = {}) {
  const session = getSession();
  const email = normalizeEmail(profileData.email || session?.email);

  if (!session || !email) {
    throw new ApiError("No hay una sesion activa para preparar el perfil", 0);
  }

  if (session.profile?.email === email) {
    return normalizeUserProfile(session.profile);
  }

  try {
    const existingProfile = await findUserByEmail(email);
    saveProfileInSession(existingProfile);
    return existingProfile;
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const createdProfile = await createUserProfile({
        ...profileData,
        email,
      }, attempt);

      saveProfileInSession(createdProfile);
      return createdProfile;
    } catch (error) {
      if (error.status === 409 && attempt < 2) {
        continue;
      }

      if (error.status === 409) {
        const existingProfile = await findUserByEmail(email);
        saveProfileInSession(existingProfile);
        return existingProfile;
      }

      throw error;
    }
  }

  throw new ApiError("No se pudo preparar el perfil publico del usuario", 0);
}
