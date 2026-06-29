import { FileText, Mic, Video, X } from "lucide-react";
import { useState } from "react";
import { getAttachmentSourceUrl, formatFileSize } from "./chatUtils";

export function AttachmentCaption({ attachment, mine }) {
  return (
    <p style={{ margin: "6px 0 0", fontSize: 11, color: mine ? "rgba(255,255,255,0.65)" : "#565f89" }}>
      {attachment.name} • {formatFileSize(attachment.size)}
    </p>
  );
}

export default function MessageAttachment({ attachment, mine, visuals, onClick }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const isImage = attachment.kind === "image" || attachment.messageType === "IMAGE";
  const isVideo = attachment.kind === "video" || attachment.messageType === "VIDEO";
  const isAudio = attachment.kind === "audio" || attachment.messageType === "AUDIO";
  const iconColor = mine ? "white" : visuals.accent;
  const sourceUrl = getAttachmentSourceUrl(attachment);

  const handleImageClick = () => {
    if (onClick) {
      onClick(attachment);
    } else if (isImage && sourceUrl) {
      setLightboxOpen(true);
    }
  };

  if (isImage && sourceUrl) {
    return (
      <>
        <div style={{ marginTop: 8 }}>
          <img
            src={sourceUrl}
            alt={attachment.name || "Imagen adjunta"}
            onClick={handleImageClick}
            style={{
              maxWidth: 260,
              width: "100%",
              borderRadius: 12,
              display: "block",
              border: mine ? "1px solid rgba(255,255,255,0.18)" : "1px solid #1e2030",
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          />
          <AttachmentCaption attachment={attachment} mine={mine} />
        </div>

        {lightboxOpen && (
          <div
            onClick={() => setLightboxOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1500,
              background: "rgba(0, 0, 0, 0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={20} />
            </button>
            <img
              src={sourceUrl}
              alt={attachment.name || "Imagen"}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                borderRadius: 8,
                objectFit: "contain",
              }}
            />
          </div>
        )}
      </>
    );
  }

  if (isVideo && sourceUrl) {
    return (
      <div style={{ marginTop: 8 }}>
        <video
          controls
          src={sourceUrl}
          style={{
            maxWidth: 320,
            width: "100%",
            maxHeight: 240,
            borderRadius: 12,
            display: "block",
            background: "#05060a",
            border: mine ? "1px solid rgba(255,255,255,0.18)" : "1px solid #1e2030",
            cursor: "pointer",
          }}
        />
        <AttachmentCaption attachment={attachment} mine={mine} />
      </div>
    );
  }

  if (isAudio && sourceUrl) {
    return (
      <div style={{
        marginTop: 8,
        padding: "10px 12px",
        borderRadius: 12,
        background: mine ? "rgba(255,255,255,0.14)" : "#0d0e14",
        border: mine ? "1px solid rgba(255,255,255,0.16)" : "1px solid #1e2030",
      }}>
        <audio controls src={sourceUrl} style={{ width: 260 }} />
        <AttachmentCaption attachment={attachment} mine={mine} />
      </div>
    );
  }

  return (
    <a
      href={sourceUrl || undefined}
      target={sourceUrl ? "_blank" : undefined}
      rel={sourceUrl ? "noreferrer" : undefined}
      style={{
        marginTop: 8,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 12,
        background: mine ? "rgba(255,255,255,0.14)" : "#0d0e14",
        border: mine ? "1px solid rgba(255,255,255,0.16)" : "1px solid #1e2030",
        textDecoration: "none",
        cursor: sourceUrl ? "pointer" : "default",
      }}
    >
      {isVideo ? <Video size={18} color={iconColor} /> : isAudio ? <Mic size={18} color={iconColor} /> : <FileText size={18} color={iconColor} />}
      <div style={{ minWidth: 0 }}>
        <p style={{
          margin: 0,
          color: mine ? "white" : "#c0caf5",
          fontSize: 13,
          fontWeight: 600,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: 190,
        }}>
          {attachment.name || "Archivo"}
        </p>
        <p style={{ margin: "2px 0 0", color: mine ? "rgba(255,255,255,0.65)" : "#565f89", fontSize: 11 }}>
          {formatFileSize(attachment.size)}
        </p>
      </div>
    </a>
  );
}
