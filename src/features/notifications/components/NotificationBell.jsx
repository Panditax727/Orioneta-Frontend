import { Bell } from "lucide-react";

export default function NotificationBell({ unreadCount, active, onClick }) {
  const showBadge = unreadCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      title="Notificaciones"
      style={{
        position: "relative",
        width: 40,
        height: 40,
        borderRadius: 10,
        background: active ? "#7c3aed" : "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: active ? "white" : "#565f89",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "#1a1b26";
        e.currentTarget.style.color = active ? "white" : "#c0caf5";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
        if (!active) e.currentTarget.style.color = "#565f89";
      }}
    >
      <Bell size={20} />
      {showBadge && (
        <span
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#ef4444",
            color: "white",
            fontSize: 10,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            boxShadow: "0 0 0 2px #0d0e14",
          }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
