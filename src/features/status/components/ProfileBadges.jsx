import {
  BadgeCheck,
  Crown,
  FlaskConical,
  Rocket,
  ShieldCheck,
} from "lucide-react";

const BADGE_ICONS = {
  check: BadgeCheck,
  crown: Crown,
  flask: FlaskConical,
  rocket: Rocket,
  shield: ShieldCheck,
};

export default function ProfileBadges({
  badges = [],
  compact = false,
  max = 4,
  style,
}) {
  const visibleBadges = badges.slice(0, max);

  if (visibleBadges.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 4 : 6,
        flexWrap: "wrap",
        minWidth: 0,
        ...style,
      }}
    >
      {visibleBadges.map((badge) => {
        const Icon = BADGE_ICONS[badge.icon] || BadgeCheck;

        return (
          <span
            key={badge.code}
            title={badge.title || badge.label}
            style={{
              minWidth: compact ? 22 : "auto",
              height: compact ? 22 : 24,
              borderRadius: 999,
              border: `1px solid ${badge.border}`,
              background: badge.background,
              color: badge.color,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: compact ? 0 : 6,
              padding: compact ? "0 6px" : "0 9px",
              fontSize: 11,
              fontWeight: 800,
              whiteSpace: "nowrap",
            }}
          >
            <Icon size={compact ? 12 : 13} />
            {!compact && badge.label}
          </span>
        );
      })}
    </div>
  );
}
