export const SESSION_KEY = "orioneta.auth.session";
export const SESSION_CHANGED_EVENT = "orioneta.auth.session.changed";

function readRawSession() {
  const tabSession = sessionStorage.getItem(SESSION_KEY);

  if (tabSession) {
    return tabSession;
  }

  const legacySession = localStorage.getItem(SESSION_KEY);

  if (legacySession) {
    sessionStorage.setItem(SESSION_KEY, legacySession);
    localStorage.removeItem(SESSION_KEY);
  }

  return legacySession;
}

function persistSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.removeItem(SESSION_KEY);
}

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
  persistSession(session);
  notifySessionChanged();
  return session;
}

export function getSession() {
  const rawSession = readRawSession();

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

  persistSession(nextSession);
  notifySessionChanged();
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
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
  notifySessionChanged();
}

export function getSessionIdentity(session = getSession()) {
  if (!session) {
    return "anonymous";
  }

  return String(session.profileUserId || session.email || session.userId || "anonymous");
}

export function subscribeToSessionChanges(callback) {
  const handleLocalSessionChange = () => {
    callback(getSession());
  };

  window.addEventListener(SESSION_CHANGED_EVENT, handleLocalSessionChange);

  return () => {
    window.removeEventListener(SESSION_CHANGED_EVENT, handleLocalSessionChange);
  };
}

function notifySessionChanged() {
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}
