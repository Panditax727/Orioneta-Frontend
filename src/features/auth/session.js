const SESSION_KEY = "orioneta.auth.session";

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

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
