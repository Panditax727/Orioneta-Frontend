export function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(isoString) {
  const now = new Date();
  const date = new Date(isoString);
  const diff = (now - date) / 1000;

  if (diff < 60) return "ahora";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return formatTime(isoString);
  if (diff < 172800) return "ayer";
  return date.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}
