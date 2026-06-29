import { useEffect, useState } from "react";
import {
  clearSession,
  getSession,
  saveSession,
  subscribeToSessionChanges,
} from "../../features/auth/session";
import {
  login as loginWithCredentials,
  register as registerAccount,
} from "../../services/authService";
import { ensureCurrentUserProfile } from "../../services/userService";

function buildUserFromSession(session) {
  if (!session) {
    return null;
  }

  return {
    id: session.profileUserId || session.userId || null,
    email: session.email || "",
    role: session.role || "USER",
    profile: session.profile || null,
    accessToken: session.accessToken,
  };
}

export function useAuth() {
  const [user, setUser] = useState(() => buildUserFromSession(getSession()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return subscribeToSessionChanges((session) => {
      setUser(buildUserFromSession(session));
    });
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const authResponse = await loginWithCredentials(credentials);
      const session = saveSession(authResponse) || authResponse;
      await ensureCurrentUserProfile();
      setUser(buildUserFromSession(session));
      return authResponse;
    } catch (loginError) {
      setError(loginError.message || "No se pudo iniciar sesion");
      throw loginError;
    } finally {
      setLoading(false);
    }
  };

  const register = async (account) => {
    setLoading(true);
    setError(null);

    try {
      const authResponse = await registerAccount(account);
      const session = saveSession(authResponse) || authResponse;
      await ensureCurrentUserProfile();
      setUser(buildUserFromSession(session));
      return authResponse;
    } catch (registerError) {
      setError(registerError.message || "No se pudo crear la cuenta");
      throw registerError;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setError(null);
  };

  return {
    user,
    isAuthenticated: Boolean(user),
    loading,
    error,
    login,
    register,
    logout,
  };
}

export default useAuth;
