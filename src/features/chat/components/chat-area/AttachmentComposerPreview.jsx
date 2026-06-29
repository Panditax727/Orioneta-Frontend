import { FileText, Image as ImageIcon, Mic, Video, X } from "lucide-react";
import { formatFileSize } from "./chatUtils";

export default function AttachmentComposerPreview({ attachment, onRemove }) {
  const isImage = attachment.kind === "image";
  const isVideo = attachment.kind === "video";
  const isAudio = attachment.kind === "audio";

  return (
    <div style={{ marginBottom: 10, padding: 10, borderRadius: 14, background: "#13141c", border: "1px solid #1e2030", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "#0d0e14", border: "1px solid #1e2030", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
        {isImage && attachment.previewUrl ? <img src={attachment.previewUrl} alt={attachment.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : isVideo && attachment.previewUrl ? <video src={attachment.previewUrl} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : isImage ? <ImageIcon size={20} color="#a78bfa" />
        : isVideo ? <Video size={20} color="#a78bfa" />
        : isAudio ? <Mic size={20} color="#a78bfa" />
        : <FileText size={20} color="#a78bfa" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: "#c0caf5", fontSize: 13, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{attachment.name}</p>
        <p style={{ color: "#565f89", fontSize: 11, margin: "3px 0 0" }}>{attachment.type || "Archivo"} • {formatFileSize(attachment.size)}</p>
      </div>
      <button type="button" onClick={onRemove} title="Quitar archivo" style={{ width: 30, height: 30, borderRadius: 10, border: "none", background: "#1e2030", color: "#c0caf5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><X size={16} /></button>
    </div>
  );
}
