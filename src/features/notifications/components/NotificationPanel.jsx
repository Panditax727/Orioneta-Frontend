import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  MessageSquare,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
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

export default function NotificationPanel({
  notifications,
  unreadCount,
  loading,
  error,
  onMarkAsRead,
  onRemoveNotification,
  onMarkAllAsRead,
  formatTime,
  onClose,
  onNavigateToChat,
  style,
}) {
  const navigate = useNavigate();
  const [animatingIds, setAnimatingIds] = useState(new Set());

  const handleMarkAsRead = async (id) => {
    setAnimatingIds((prev) => new Set(prev).add(id));
    await onMarkAsRead(id);
    window.setTimeout(() => {
      setAnimatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  const handleNotificationClick = async (notification) => {
    if (notification.conversationId) {
      if (onNavigateToChat) {
        await onNavigateToChat(notification.conversationId);
      } else {
        navigate(`/chat?conversation=${notification.conversationId}`);
      }
    } else if (notification.senderId) {
      navigate(`/profile/${notification.senderId}`);
    }
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }
    if (onRemoveNotification) {
      onRemoveNotification(notification.id);
    }
  };

  return (
    <aside
      style={{
        width: 360,
        flexShrink: 0,
        background: "#13141c",
        borderRight: "1px solid #1e2030",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      <div
        style={{
          padding: "20px 16px 12px",
          borderBottom: "1px solid #1e2030",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "#1a1b26",
                color: "#a78bfa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bell size={16} />
            </div>
            <div>
              <h2
                style={{
                  color: "#c0caf5",
                  fontSize: 16,
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                Notificaciones
              </h2>
              <p
                style={{
                  color: "#565f89",
                  fontSize: 12,
                  margin: "2px 0 0",
                }}
              >
                {unreadCount > 0
                  ? `${unreadCount} sin leer`
                  : "Todo al dia"}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                title="Marcar todo como leido"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  color: "#565f89",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1a1b26";
                  e.currentTarget.style.color = "#c0caf5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#565f89";
                }}
              >
                <CheckCheck size={16} />
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                title="Cerrar"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  color: "#565f89",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1a1b26";
                  e.currentTarget.style.color = "#c0caf5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#565f89";
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {loading && notifications.length === 0 && (
          <div style={{ padding: 20, textAlign: "center" }}>
            <span style={{ color: "#565f89", fontSize: 13 }}>
              Cargando...
            </span>
          </div>
        )}

        {error && (
          <div style={{ padding: 20, textAlign: "center" }}>
            <span style={{ color: "#f87171", fontSize: 13 }}>{error}</span>
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div style={{ padding: 20, textAlign: "center" }}>
            <span style={{ color: "#565f89", fontSize: 13 }}>
              No tienes notificaciones
            </span>
          </div>
        )}

        {notifications.map((notification) => {
          const Icon = TYPE_ICONS[notification.type] || Bell;
          const color = TYPE_COLORS[notification.type] || "#7c3aed";
          const isRead = notification.read;
          const isAnimating = animatingIds.has(notification.id);
          const senderName = notification.senderName || (notification.senderId ? "Cargando..." : notification.title || "Orioneta");
  const rawAvatar = notification.senderAvatar || null;
  const resolvedAvatar = resolveProfilePhoto(rawAvatar);
  const messagePreview = getMessagePreview(
    notification.type === "MESSAGE_SENT" ? notification.body : "",
  );
  const initials = getInitials(senderName);
  const hasAvatar = Boolean(resolvedAvatar);
  const showPerson = ["MESSAGE_SENT", "FRIEND_REQUEST_SENT", "FRIEND_REQUEST_ACCEPTED"].includes(notification.type);

          return (
            <button
              key={notification.id}
              type="button"
              onClick={() => void handleNotificationClick(notification)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "12px 16px",
                border: "none",
                background: isAnimating
                  ? "rgba(124, 58, 237, 0.08)"
                  : isRead
                    ? "transparent"
                    : "rgba(124, 58, 237, 0.04)",
                color: "inherit",
                cursor: "pointer",
                textAlign: "left",
                borderLeft: `3px solid ${isRead ? "transparent" : color}`,
                opacity: isAnimating ? 0.5 : 1,
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#161720";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isAnimating
                  ? "rgba(124, 58, 237, 0.08)"
                  : isRead
                    ? "transparent"
                    : "rgba(124, 58, 237, 0.04)";
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
              ) : showPerson ? (
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
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: `${color}22`,
                    color,
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
                    color: isRead ? "#565f89" : "#c0caf5",
                    fontSize: 14,
                    fontWeight: isRead ? 400 : 600,
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {senderName}
                </p>
                {messagePreview && (
                  <p
                    style={{
                      color: "#565f89",
                      fontSize: 13,
                      margin: "2px 0 0",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {messagePreview}
                  </p>
                )}
                <p
                  style={{
                    color: "#3b4261",
                    fontSize: 11,
                    margin: "2px 0 0",
                  }}
                >
                  {formatTime(notification.createdAt)}
                </p>
              </div>

              {isRead ? (
                <Check
                  size={14}
                  color="#3b4261"
                  style={{ marginTop: 4, flexShrink: 0 }}
                />
              ) : (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: color,
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
