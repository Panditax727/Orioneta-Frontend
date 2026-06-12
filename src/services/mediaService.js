import { getSession } from "../features/auth/session";
import { ApiError, resolveApiUrl } from "./apiClient";

export async function uploadMediaFile({ ownerUserId, file, purpose = "MESSAGE_ATTACHMENT" }) {
  if (!ownerUserId) {
    throw new ApiError("No se pudo identificar al propietario del archivo", 0);
  }

  if (!file) {
    throw new ApiError("Selecciona un archivo valido", 0);
  }

  const formData = new FormData();
  formData.append("ownerUserId", ownerUserId);
  formData.append("purpose", purpose);
  formData.append("file", file);

  const session = getSession();
  const headers = {};

  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  let response;

  try {
    response = await fetch(resolveApiUrl("/api/media/upload"), {
      method: "POST",
      headers,
      body: formData,
    });
  } catch (error) {
    throw new ApiError(
      "No pudimos conectar con el servicio de archivos",
      0,
      error,
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? data.message || data.error || "No se pudo subir el archivo"
        : data || "No se pudo subir el archivo";

    throw new ApiError(message, response.status, data);
  }

  return normalizeMediaFile(data);
}

function normalizeMediaFile(mediaFile) {
  return {
    id: mediaFile.id,
    ownerUserId: mediaFile.ownerUserId,
    name: mediaFile.fileName,
    fileName: mediaFile.fileName,
    type: mediaFile.contentType,
    contentType: mediaFile.contentType,
    size: mediaFile.size,
    url: mediaFile.url,
    purpose: mediaFile.purpose,
    createdAt: mediaFile.createdAt,
  };
}
