import { useState } from "react";
import { Download, Check, Star, Crown, Sparkles, X } from "lucide-react";

const CATEGORY_ICONS = {
  themes: "🎨",
  backgrounds: "🖼️",
  bubbles: "💬",
  fonts: "🔤",
  animations: "✨",
  sounds: "🔊",
};

export default function MarketDetailModal({ item, isInstalled, onClose, onInstall, onRate }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.7)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#13141c",
          borderRadius: 16,
          border: "1px solid #1e2030",
          maxWidth: 640,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "#1a1b26",
            border: "none",
            cursor: "pointer",
            color: "#565f89",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <X size={18} />
        </button>

        <div style={{ padding: "24px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <h2 style={{ color: "#c0caf5", fontSize: 22, fontWeight: 600, margin: 0, flex: 1 }}>
              {item.name}
            </h2>
            {item.isOfficial && <Crown size={22} color="#fbbf24" />}
          </div>

          <div
            style={{
              height: 200,
              borderRadius: 12,
              background: item.preview?.background || "#0d0e14",
              padding: 24,
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 20,
              position: "relative",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                background: item.preview?.primary || "#7c3aed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={36} color="rgba(255,255,255,0.6)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ width: "100%", height: 14, borderRadius: 7, background: item.preview?.text || "#c0caf5", marginBottom: 10 }} />
              <div style={{ width: "80%", height: 10, borderRadius: 5, background: item.preview?.border || "#1e2030", marginBottom: 10 }} />
              <div style={{ width: "60%", height: 10, borderRadius: 5, background: item.preview?.secondary || "#565f89" }} />
            </div>
            <div style={{ position: "absolute", top: 12, right: 12, fontSize: 28 }}>
              {CATEGORY_ICONS[item.category] || "📦"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 32, marginBottom: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#c0caf5", fontSize: 28, fontWeight: 600, marginBottom: 2 }}>{item.ratingAverage}</div>
              <div style={{ color: "#565f89", fontSize: 12 }}>Rating</div>
              <div style={{ color: "#565f89", fontSize: 11 }}>({item.ratingCount})</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#c0caf5", fontSize: 28, fontWeight: 600, marginBottom: 2 }}>
                {item.downloads >= 1000 ? `${(item.downloads / 1000).toFixed(1)}k` : item.downloads}
              </div>
              <div style={{ color: "#565f89", fontSize: 12 }}>Descargas</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#c0caf5", fontSize: 28, fontWeight: 600, marginBottom: 2 }}>{item.version || "1.0"}</div>
              <div style={{ color: "#565f89", fontSize: 12 }}>Versión</div>
            </div>
          </div>

          <p style={{ color: "#c0caf5", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            {item.description}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14, fontWeight: 600 }}>
              {item.author?.[0] || "?"}
            </div>
            <span style={{ color: "#c0caf5", fontSize: 14 }}>Creado por {item.author}</span>
          </div>

          {item.tags?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "#1a1b26",
                    color: "#565f89",
                    fontSize: 11,
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: "1px solid #1e2030",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <h4 style={{ color: "#c0caf5", fontSize: 14, fontWeight: 600, margin: "0 0 12px 0" }}>Calificar</h4>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => { setRating(star); onRate(star); }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
                >
                  <Star
                    size={28}
                    color={star <= (hoverRating || rating) ? "#fbbf24" : "#565f89"}
                    fill={star <= (hoverRating || rating) ? "#fbbf24" : "none"}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: "0 24px 24px" }}>
          <button
            onClick={() => onInstall(item)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 8,
              background: isInstalled ? "#22c55e" : "#7c3aed",
              border: "none",
              cursor: "pointer",
              color: "white",
              fontSize: 15,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {isInstalled ? <Check size={20} /> : <Download size={20} />}
            {isInstalled ? "Instalado — hacer clic para desinstalar" : "Instalar"}
          </button>
        </div>
      </div>
    </div>
  );
}
