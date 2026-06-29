import { apiRequest, resolveApiUrl } from "./apiClient";

export const DEFAULT_OAUTH_PROVIDERS = [
  {
    id: "google",
    label: "Google",
    authorizationUrl: "/oauth2/authorization/google",
    enabled: true,
  },
  {
    id: "github",
    label: "GitHub",
    authorizationUrl: "/oauth2/authorization/github",
    enabled: true,
  },
];

export function login(credentials) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: credentials,
    auth: false,
  });
}

export function register(account) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: account,
    auth: false,
  });
}

export function forgotPassword(email) {
  return apiRequest("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
    auth: false,
  });
}

export function verifyResetCode(email, code) {
  return apiRequest("/api/auth/verify-reset-code", {
    method: "POST",
    body: { email, code },
    auth: false,
  });
}

export function resetPassword({ email, token, newPassword }) {
  return apiRequest("/api/auth/reset-password", {
    method: "POST",
    body: { email, token, newPassword },
    auth: false,
  });
}

export function getOAuthProviders() {
  return apiRequest("/api/auth/oauth2/providers", { auth: false });
}

export function mergeOAuthProviders(apiProviders = []) {
  const providers = Array.isArray(apiProviders)
    ? apiProviders
    : apiProviders?.providers || [];

  return DEFAULT_OAUTH_PROVIDERS.map((provider) => {
    const backendProvider = providers.find(
      (item) => item.provider === provider.id || item.id === provider.id,
    );

    return {
      ...provider,
      ...backendProvider,
      id: provider.id,
      label: backendProvider?.label || provider.label,
      authorizationUrl:
        backendProvider?.authorizationUrl || provider.authorizationUrl,
      enabled: backendProvider?.enabled !== false,
    };
  });
}

export function redirectToOAuth(providerId, providers = DEFAULT_OAUTH_PROVIDERS) {
  const provider = mergeOAuthProviders(providers).find(
    (item) => item.id === providerId || item.provider === providerId,
  );

  if (!provider) {
    throw new Error("Ese proveedor no esta disponible ahora");
  }

  if (provider.enabled === false) {
    throw new Error(`${provider.label} aun no esta habilitado`);
  }

  const authorizationUrl =
    provider?.authorizationUrl || `/oauth2/authorization/${providerId}`;

  window.location.assign(resolveApiUrl(authorizationUrl));
}
