export const ORIONETA_BUILD_ID = import.meta.env.VITE_BUILD_ID || "local";

export function exposeBuildInfo() {
  document.documentElement.dataset.orionetaBuild = ORIONETA_BUILD_ID;
}
