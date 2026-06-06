export const SESSION_KEY = "orioneta.auth.session";

function parseExpiresIn(value) {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 3600;
}

export function normalizeAuthResponse(authResponse) {
  const expiresInSeconds = parseExpiresIn(
    authResponse.expiresInSeconds || authResponse.expiresIn,
  );

  return {
    accessToken: authResponse.accessToken,
    refreshToken: authResponse.refreshToken,
    tokenType: authResponse.tokenType || "Bearer",
    expiresInSeconds,
    expiresAt: Date.now() + expiresInSeconds * 1000,
    userId: authResponse.userId,
    email: authResponse.email,
    role: authResponse.role || "USER",
    profileUserId: authResponse.profileUserId || authResponse.profile?.userID || null,
    profile: authResponse.profile || null,
  };
}

export function saveSession(authResponse) {
  const session = normalizeAuthResponse(authResponse);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession() {
  const rawSession = localStorage.getItem(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession);

    if (!session.accessToken || session.expiresAt <= Date.now()) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function updateSession(updates) {
  const session = getSession();

  if (!session) {
    return null;
  }

  const nextSession = {
    ...session,
    ...updates,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
  return nextSession;
}

export function saveProfileInSession(profile) {
  if (!profile) {
    return getSession();
  }

  return updateSession({
    profile,
    profileUserId: profile.userID,
  });
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
