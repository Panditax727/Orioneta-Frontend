import { getSession } from "../features/auth/session";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://54.174.224.251:8080"
).replace(/\/$/, "");

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

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    token,
    auth = true,
    signal,
  } = options;

  let response;
  const session = auth ? getSession() : null;
  const accessToken = token || session?.accessToken;

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
