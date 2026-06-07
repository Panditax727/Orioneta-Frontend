const LOCAL_PROFILE_PHOTO_PREFIX = "local-avatar:";
const PROFILE_PHOTO_STORAGE_KEY = "orioneta.profile-photo";
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_DIMENSION = 512;
const JPEG_QUALITY = 0.82;

export function isLocalProfilePhoto(reference) {
  return typeof reference === "string" && reference.startsWith(LOCAL_PROFILE_PHOTO_PREFIX);
}

export function resolveProfilePhoto(reference) {
  if (!reference) {
    return "";
  }

  if (!isLocalProfilePhoto(reference)) {
    return reference;
  }

  return localStorage.getItem(storageKey(reference)) || "";
}

export async function storeLocalProfilePhoto(userId, file) {
  if (!file) {
    throw new Error("Selecciona una imagen");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("La imagen no puede superar los 8 MB");
  }

  const previewUrl = await resizeImageFile(file);
  const reference = `${LOCAL_PROFILE_PHOTO_PREFIX}${userId}:${Date.now()}`;

  localStorage.setItem(storageKey(reference), previewUrl);

  return {
    reference,
    previewUrl,
  };
}

export function removeLocalProfilePhoto(reference) {
  if (isLocalProfilePhoto(reference)) {
    localStorage.removeItem(storageKey(reference));
  }
}

function storageKey(reference) {
  return `${PROFILE_PHOTO_STORAGE_KEY}.${reference}`;
}

function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const { width, height } = getTargetSize(image.width, image.height);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };

      image.onerror = () => reject(new Error("No se pudo leer la imagen"));
      image.src = reader.result;
    };

    reader.onerror = () => reject(new Error("No se pudo abrir el archivo"));
    reader.readAsDataURL(file);
  });
}

function getTargetSize(width, height) {
  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
    return { width, height };
  }

  const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}
