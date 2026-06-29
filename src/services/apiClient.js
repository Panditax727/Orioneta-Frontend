import { getSession, updateSession, clearSession } from "../features/auth/session";
import { refreshTokens } from "./authService";

export const API_BASE_URL = "";

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function subscribeToRefresh(callback) {
  refreshSubscribers.push(callback);
}

export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function resolveApiUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function tryRefreshToken() {
  const session = getSession();

  if (!session?.refreshToken) {
    return null;
  }

  try {
    const response = await refreshTokens(session.refreshToken);
    const newSession = updateSession({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken || session.refreshToken,
      expiresInSeconds: response.expiresInSeconds || response.expiresIn,
      expiresAt: Date.now() + (response.expiresInSeconds || 3600) * 1000,
    });

    onRefreshed(newSession?.accessToken);
    return newSession?.accessToken;
  } catch {
    clearSession();
    onRefreshed(null);
    return null;
  }
}

async function executeRequest(path, options, accessToken) {
  const { method = "GET", body, headers = {}, signal } = options;

  let response;

  try {
    response = await fetch(resolveApiUrl(path), {
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new ApiError(
      "No pudimos conectar con Orioneta. Revisa tu conexion e intentalo nuevamente.",
      0,
      error,
    );
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? data.message || data.error || "No pudimos completar la accion"
        : data || "No pudimos completar la accion en este momento";

    throw new ApiError(message, response.status, data);
  }

  return data;
}

export async function apiRequest(path, options = {}) {
  const { auth = true, token, ...restOptions } = options;

  const session = auth ? getSession() : null;
  let accessToken = token || session?.accessToken;

  try {
    return await executeRequest(path, restOptions, accessToken);
  } catch (error) {
    if (!auth || error.status !== 401 || !session?.refreshToken) {
      throw error;
    }

    if (!isRefreshing) {
      isRefreshing = true;
      accessToken = await tryRefreshToken();
      isRefreshing = false;
    } else {
      accessToken = await new Promise((resolve) => {
        subscribeToRefresh(resolve);
      });
    }

    if (!accessToken) {
      throw new ApiError("Tu sesion expiro. Inicia sesion nuevamente.", 401);
    }

    return executeRequest(path, restOptions, accessToken);
  }
}
