import { useState, useRef } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { resolveProfilePhoto } from "../../../../services/profilePhotoService";
import { getBubbleRadius, getBubblePadding, parseMessageContent } from "./chatUtils";
import MessageAttachment from "./MessageAttachment";

export function MessageAvatar({ photo, initial, compactMode, visuals, onClick }) {
  const resolvedPhoto = resolveProfilePhoto(photo);
  const avatarRef = useRef(null);

  const handleClick = (event) => {
    event.stopPropagation();
    if (onClick) {
      onClick(avatarRef.current);
    }
  };

  return (
    <div
      ref={avatarRef}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick(avatarRef.current);
        }
      } : undefined}
      style={{
        width: compactMode ? 24 : 28,
        height: compactMode ? 24 : 28,
        borderRadius: "50%",
        flexShrink: 0,
        background: visuals.accentGradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: 11,
        fontWeight: 700,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.opacity = "0.8"; }}
      onMouseLeave={(e) => { if (onClick) e.currentTarget.style.opacity = "1"; }}
    >
      {resolvedPhoto ? (
        <img src={resolvedPhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initial
      )}
    </div>
  );
}

export default function MessageBubble({
  msg, visuals, bubbleStyle, compactMode, fontSize, pushToBottom = false,
  onEdit, onDelete, onAvatarClick, onImageClick, showAvatar = false,
  deleteConfirmText = "¿Eliminar este mensaje?",
  deleteConfirmLabel = "Eliminar",
  deleteCancelLabel = "Cancelar",
  editConfirmLabel = "Guardar",
  editCancelLabel = "Cancelar",
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hovered, setHovered] = useState(false);

  const radius = getBubbleRadius(bubbleStyle, msg.mine);
  const padding = getBubblePadding(bubbleStyle, compactMode);
  const parsed = parseMessageContent(msg.content);
  const text = parsed.text || (!parsed.attachment ? String(msg.content || "") : "");
  const attachment = parsed.attachment;
  const canEdit = Boolean(onEdit && text && !attachment);

  const handleStartEdit = () => {
    setConfirming(false);
    setEditText(text);
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || !onEdit) return;

    try {
      setSaving(true);
      await onEdit(msg.id, editText.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditText("");
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;

    try {
      setSaving(true);
      await onDelete(msg.id);
      setConfirming(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: msg.mine ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: compactMode ? 6 : 8,
        marginTop: pushToBottom ? "auto" : 0,
        marginBottom: compactMode ? 2 : 4,
      }}
    >
      {showAvatar && (
        <MessageAvatar
          photo={msg.senderAvatarPhoto}
          initial={msg.senderInitial || msg.sender?.[0] || "?"}
          compactMode={compactMode}
          visuals={visuals}
          onClick={onAvatarClick ? (anchorElement) => onAvatarClick(msg, anchorElement) : undefined}
        />
      )}

      {!msg.mine && !showAvatar && (
        <MessageAvatar
          photo={msg.senderAvatarPhoto}
          initial={msg.senderInitial || msg.sender?.[0] || "?"}
          compactMode={compactMode}
          visuals={visuals}
          onClick={onAvatarClick ? (anchorElement) => onAvatarClick(msg, anchorElement) : undefined}
        />
      )}

      <div style={{ maxWidth: compactMode ? "72%" : "65%", display: "flex", flexDirection: "column", alignItems: msg.mine ? "flex-end" : "flex-start", gap: 4 }}>
        <div
          style={{
            background: msg.mine ? visuals.accent : visuals.incomingBubble,
            borderRadius: radius,
            padding,
            border: msg.mine || bubbleStyle === "MINIMAL" ? "none" : "1px solid #1e2030",
            overflow: "hidden",
            width: "100%",
          }}
        >
          {!msg.mine && (
            <p style={{ color: visuals.accent, fontSize: 11, fontWeight: 600, marginBottom: compactMode ? 2 : 4 }}>
              {msg.sender}
            </p>
          )}
          {msg.mine && (
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 600, marginBottom: compactMode ? 2 : 4 }}>
              {msg.sender} (Tú)
            </p>
          )}

          {confirming ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: 0, textAlign: "center" }}>
                {deleteConfirmText}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={saving}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "transparent",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {deleteCancelLabel}
                </button>
                <button
                  type="button"
                  onClick={() => void handleConfirmDelete()}
                  disabled={saving}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    border: "none",
                    background: "#ef4444",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {deleteConfirmLabel}
                </button>
              </div>
            </div>
          ) : editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(124,58,237,0.5)",
                  color: "#c0caf5",
                  fontSize,
                  outline: "none",
                  resize: "none",
                  fontFamily: "inherit",
                  minHeight: 36,
                  lineHeight: 1.4,
                  boxSizing: "border-box",
                }}
                autoFocus
                disabled={saving}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSaveEdit();
                  }
                  if (e.key === "Escape") handleCancelEdit();
                }}
              />
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {editCancelLabel}
                </button>
                <button
                  type="button"
                  onClick={() => void handleSaveEdit()}
                  disabled={saving || !editText.trim()}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 6,
                    border: "none",
                    background: "#7c3aed",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {editConfirmLabel}
                </button>
              </div>
            </div>
          ) : (
            <>
              {text && (
                <p style={{
                  color: msg.mine ? "white" : "#c0caf5",
                  fontSize,
                  lineHeight: 1.4,
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>
                  {text}
                </p>
              )}
              {attachment && (
                <MessageAttachment
                  attachment={attachment}
                  mine={msg.mine}
                  visuals={visuals}
                  onClick={onImageClick ? () => onImageClick(attachment) : undefined}
                />
              )}
            </>
          )}

          <p style={{
            color: msg.mine ? "rgba(255,255,255,0.58)" : "#565f89",
            fontSize: 10,
            textAlign: "right",
            marginTop: compactMode ? 3 : 4,
            marginBottom: 0,
          }}>
            {msg.time}{msg.edited ? " · editado" : ""}
          </p>
        </div>

        {msg.mine && !editing && !confirming && (canEdit || onDelete) && (
          <div
            style={{
              display: "flex",
              gap: 4,
              alignItems: "center",
              paddingLeft: msg.mine ? 0 : 4,
              paddingRight: msg.mine ? 4 : 0,
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translateY(0)" : "translateY(4px)",
              transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
            }}
          >
            {canEdit && (
              <button
                type="button"
                onClick={handleStartEdit}
                title="Editar mensaje"
                style={{
                  border: "none",
                  background: "rgba(255,255,255,0.08)",
                  cursor: "pointer",
                  padding: 4,
                  borderRadius: 6,
                  color: "#565f89",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(124,58,237,0.2)";
                  e.currentTarget.style.color = "#a78bfa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "#565f89";
                }}
              >
                <Edit2 size={12} strokeWidth={2} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                title="Eliminar mensaje"
                style={{
                  border: "none",
                  background: "rgba(255,255,255,0.08)",
                  cursor: "pointer",
                  padding: 4,
                  borderRadius: 6,
                  color: "#565f89",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.2)";
                  e.currentTarget.style.color = "#ef4444";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "#565f89";
                }}
              >
                <Trash2 size={12} strokeWidth={2} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
