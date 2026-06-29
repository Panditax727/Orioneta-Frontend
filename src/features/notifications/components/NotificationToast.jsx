import { useEffect, useRef, useState } from "react";
import { Bell, MessageSquare, UserCheck, UserPlus, X } from "lucide-react";
import { markNotificationAsRead } from "../services/notificationService";
import { resolveProfilePhoto } from "../../../services/profilePhotoService";

const TYPE_ICONS = {
  MESSAGE_SENT: MessageSquare,
  FRIEND_REQUEST_SENT: UserPlus,
  FRIEND_REQUEST_ACCEPTED: UserCheck,
};

const TYPE_COLORS = {
  MESSAGE_SENT: "#7c3aed",
  FRIEND_REQUEST_SENT: "#f59e0b",
  FRIEND_REQUEST_ACCEPTED: "#22c55e",
};

function getMessagePreview(body, maxLength = 50) {
  if (!body) return "";
  return body.length > maxLength ? body.substring(0, maxLength) + "..." : body;
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function NotificationToast({ onNotificationClick }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);
  const currentToastRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;

    const handler = (event) => {
      if (!mountedRef.current) return;

      const notification = event.detail;
      if (!notification) return;

      setToast(notification);
      currentToastRef.current = notification;

      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        if (mountedRef.current) setToast(null);
      }, 4500);
    };

    window.addEventListener("orioneta.notification.new", handler);

    return () => {
      mountedRef.current = false;
      window.clearTimeout(timerRef.current);
      window.removeEventListener("orioneta.notification.new", handler);
    };
  }, []);

  const handleClick = async () => {
    const notification = currentToastRef.current || toast;
    if (!notification) return;

    if (onNotificationClick) {
      onNotificationClick(notification);
    }

    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
      } catch {
      }
    }

    setToast(null);
    currentToastRef.current = null;
  };

  if (!toast) return null;

  const Icon = TYPE_ICONS[toast.type] || Bell;
  const senderName = toast.senderName || (toast.senderId ? "Cargando..." : toast.title || "Orioneta");
  const rawAvatar = toast.senderAvatar || null;
  const resolvedAvatar = resolveProfilePhoto(rawAvatar);
  const messagePreview = getMessagePreview(
    toast.type === "MESSAGE_SENT" ? toast.body : "",
  );
  const initials = getInitials(senderName);
  const color = TYPE_COLORS[toast.type] || "#7c3aed";
  const hasAvatar = Boolean(resolvedAvatar);

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1300,
        maxWidth: 380,
        padding: "12px 16px",
        borderRadius: 12,
        background: "#1a1b26",
        border: "1px solid #2a2b3d",
        boxShadow: "0 18px 36px rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        animation: "toastSlideUp 0.35s ease-out",
        cursor: "pointer",
      }}
    >
      {hasAvatar ? (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: `url(${resolvedAvatar}) center/cover`,
            flexShrink: 0,
          }}
        />
      ) : toast.type === "MESSAGE_SENT" || toast.type === "FRIEND_REQUEST_SENT" || toast.type === "FRIEND_REQUEST_ACCEPTED" ? (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${color}, ${color}88)`,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
      ) : (
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "rgba(124, 58, 237, 0.15)",
            color: "#a78bfa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={16} />
        </div>
      )}

      <div style={{ minWidth: 0, flex: 1 }}>
        <p
          style={{
            color: "#c0caf5",
            fontSize: 13,
            fontWeight: 600,
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {senderName}
        </p>
        {messagePreview ? (
          <p
            style={{
              color: "#565f89",
              fontSize: 12,
              margin: "2px 0 0",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {messagePreview}
          </p>
        ) : toast.body && toast.type !== "MESSAGE_SENT" ? (
          <p
            style={{
              color: "#565f89",
              fontSize: 12,
              margin: "2px 0 0",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {toast.body}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setToast(null);
          currentToastRef.current = null;
        }}
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          border: "none",
          background: "transparent",
          color: "#565f89",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          padding: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#2a2b3d";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
