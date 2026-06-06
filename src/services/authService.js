import { apiRequest, resolveApiUrl } from "./apiClient";

export const DEFAULT_OAUTH_PROVIDERS = [
  {
    id: "google",
    label: "Google",
    authorizationUrl: "/oauth2/authorization/google",
  },
  {
    id: "github",
    label: "GitHub",
    authorizationUrl: "/oauth2/authorization/github",
  },
];

export function login(credentials) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export function register(account) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: account,
  });
}

export function getOAuthProviders() {
  return apiRequest("/api/auth/oauth2/providers");
}

export function redirectToOAuth(providerId, providers = DEFAULT_OAUTH_PROVIDERS) {
  const provider =
    providers.find((item) => item.id === providerId || item.provider === providerId) ||
    DEFAULT_OAUTH_PROVIDERS.find((item) => item.id === providerId);

  const authorizationUrl =
    provider?.authorizationUrl || `/oauth2/authorization/${providerId}`;

  window.location.assign(resolveApiUrl(authorizationUrl));
}
