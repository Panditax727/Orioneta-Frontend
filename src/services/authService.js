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
    throw new Error("Proveedor OAuth no disponible");
  }

  if (provider.enabled === false) {
    throw new Error(`${provider.label} aun no esta habilitado`);
  }

  const authorizationUrl =
    provider?.authorizationUrl || `/oauth2/authorization/${providerId}`;

  window.location.assign(resolveApiUrl(authorizationUrl));
}
