import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MessageSquare } from "lucide-react";
import { resolveProfilePhoto } from "../../../../services/profilePhotoService";

const STATUS_COLORS = {
  online: "#22c55e",
  idle: "#f59e0b",
  dnd: "#ef4444",
  offline: "#565f89",
};

export default function ProfileCard({ profile, currentUserId, onClose, onSendMessage, anchorRef }) {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);

  const isCurrentUser = profile?.id === currentUserId || profile?.userId === currentUserId;
  const statusColor = STATUS_COLORS[profile?.status?.toLowerCase()] || STATUS_COLORS.offline;
  const avatarPhoto = resolveProfilePhoto(profile?.avatarPhoto || profile?.profilePhoto) || "";
  const displayName = profile?.displayName || profile?.name || profile?.userName || "Usuario";
  const username = profile?.userName || profile?.username || "";
  const bio = profile?.bio || "";
  const banner = profile?.banner || profile?.background || null;

  useEffect(() => {
    if (!anchorRef?.current) return;

    const calculatePosition = () => {
      const anchorRect = anchorRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const cardWidth = 320;
      const cardHeight = 400;

      let left = anchorRect.right + 12;
      let top = anchorRect.top;

      // Check if card would overflow right side
      if (left + cardWidth > viewportWidth - 16) {
        // Position to the left of the avatar
        left = anchorRect.left - cardWidth - 12;
      }

      // Ensure card doesn't overflow left side
      if (left < 16) {
        left = 16;
      }

      // Check if card would overflow bottom
      if (top + cardHeight > viewportHeight - 16) {
        // Position above the avatar
        top = viewportHeight - cardHeight - 16;
      }

      // Ensure card doesn't overflow top
      if (top < 16) {
        top = 16;
      }

      setPosition({ top, left });
      setIsPositioned(true);
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      calculatePosition();
    });
  }, [anchorRef, profile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target) && anchorRef?.current && !anchorRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, anchorRef]);

  const handleSendMessage = () => {
    onSendMessage?.(profile);
    onClose?.();
  };

  const cardContent = (
    <div
      ref={cardRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: 320,
        background: "#13141c",
        border: "1px solid #1e2030",
        borderRadius: 16,
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
        overflow: "hidden",
        opacity: isPositioned ? 1 : 0,
        visibility: isPositioned ? "visible" : "hidden",
        transition: "opacity 0.15s ease-out",
      }}
    >
      {/* Banner */}
      <div
        style={{
          height: 100,
          background: banner
            ? `url(${banner}) center/cover`
            : "linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(79, 70, 229, 0.2))",
          position: "relative",
        }}
      />

      {/* Profile Photo */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "#13141c",
          border: "4px solid #13141c",
          overflow: "hidden",
        }}
      >
        {avatarPhoto ? (
          <img
            src={avatarPhoto}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 32,
              fontWeight: 600,
            }}
          >
            {displayName.trim().charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "52px 20px 20px" }}>
        {/* Name and Username */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h3
              style={{
                color: "#c0caf5",
                fontSize: 18,
                fontWeight: 600,
                margin: 0,
              }}
            >
              {displayName}
            </h3>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: statusColor,
                flexShrink: 0,
              }}
            />
          </div>
          {username && (
            <p
              style={{
                color: "#565f89",
                fontSize: 13,
                margin: 0,
              }}
            >
              @{username}
            </p>
          )}
        </div>

        {/* Bio */}
        {bio && (
          <p
            style={{
              color: "#737aa2",
              fontSize: 13,
              lineHeight: 1.5,
              margin: "0 0 16px",
            }}
          >
            {bio}
          </p>
        )}

        {/* Action Button */}
        {!isCurrentUser && (
          <button
            type="button"
            onClick={handleSendMessage}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              border: "none",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(124, 58, 237, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <MessageSquare size={16} />
            Enviar mensaje
          </button>
        )}
      </div>
    </div>
  );

  return createPortal(cardContent, document.body);
}
