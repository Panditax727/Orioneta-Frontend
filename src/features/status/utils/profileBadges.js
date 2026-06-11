export const BADGE_DEFINITIONS = {
  CREATOR: {
    label: "Creador",
    title: "Parte del equipo que crea Orioneta",
    color: "#fbbf24",
    background: "rgba(251, 191, 36, 0.12)",
    border: "rgba(251, 191, 36, 0.28)",
    icon: "crown",
  },
  BETA_TESTER: {
    label: "Beta tester",
    title: "Usuario que prueba Orioneta antes del lanzamiento publico",
    color: "#a78bfa",
    background: "rgba(167, 139, 250, 0.12)",
    border: "rgba(167, 139, 250, 0.28)",
    icon: "flask",
  },
  FOUNDER: {
    label: "Fundador",
    title: "Miembro fundador de la comunidad Orioneta",
    color: "#38bdf8",
    background: "rgba(56, 189, 248, 0.12)",
    border: "rgba(56, 189, 248, 0.28)",
    icon: "rocket",
  },
  VERIFIED: {
    label: "Verificado",
    title: "Cuenta con identidad confirmada",
    color: "#22c55e",
    background: "rgba(34, 197, 94, 0.12)",
    border: "rgba(34, 197, 94, 0.28)",
    icon: "check",
  },
  PRIVACY_FIRST: {
    label: "Privacidad",
    title: "Cuenta con visibilidad reservada",
    color: "#f472b6",
    background: "rgba(244, 114, 182, 0.12)",
    border: "rgba(244, 114, 182, 0.28)",
    icon: "shield",
  },
};

const BADGE_ORDER = [
  "CREATOR",
  "FOUNDER",
  "BETA_TESTER",
  "VERIFIED",
  "PRIVACY_FIRST",
];

function normalizeBadgeCode(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim().replace(/[-\s]/g, "_").toUpperCase();
  }

  return normalizeBadgeCode(value.code || value.id || value.type);
}

function collectExplicitBadges(profile, session) {
  const candidates = [
    profile?.badges,
    profile?.badgeCodes,
    profile?.insignias,
    session?.badges,
    session?.badgeCodes,
  ];

  return candidates
    .flatMap((value) => (Array.isArray(value) ? value : []))
    .map(normalizeBadgeCode)
    .filter(Boolean);
}

export function getProfileBadges(profile = {}, session = null) {
  const codes = new Set(collectExplicitBadges(profile, session));
  const email = String(profile.email || session?.email || "").toLowerCase();
  const role = String(profile.role || session?.role || "").toUpperCase();
  const visibility = String(profile.visibility || "").toUpperCase();

  if (
    role.includes("CREATOR") ||
    role.includes("OWNER") ||
    role.includes("ADMIN") ||
    email.endsWith("@orioneta.cl")
  ) {
    codes.add("CREATOR");
  }

  if (role.includes("FOUNDER")) {
    codes.add("FOUNDER");
  }

  if (email || profile.friendCode) {
    codes.add("BETA_TESTER");
  }

  if (profile.verified || role.includes("VERIFIED")) {
    codes.add("VERIFIED");
  }

  if (visibility === "PRIVATE") {
    codes.add("PRIVACY_FIRST");
  }

  return BADGE_ORDER.filter((code) => codes.has(code))
    .map((code) => ({ code, ...BADGE_DEFINITIONS[code] }))
    .filter((badge) => badge.label);
}
