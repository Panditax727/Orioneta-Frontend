import { Download, Check, Star, Crown, Sparkles } from "lucide-react";
import { useState } from "react";

const CATEGORY_LABELS = {
  themes: "Tema",
  backgrounds: "Fondo",
  bubbles: "Burbuja",
  fonts: "Fuente",
  animations: "Animación",
  sounds: "Sonido",
};

export function MarketGridCard({ item, isInstalled, onInstall, onSelect }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={() => onSelect(item)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#13141c",
        borderRadius: 12,
        border: hover ? "1px solid #7c3aed" : "1px solid #1e2030",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <div
        style={{
          height: 120,
          background: item.preview?.background || "#0d0e14",
          padding: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "relative",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            background: item.preview?.primary || "#7c3aed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkles size={20} color="rgba(255,255,255,0.6)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ width: "70%", height: 8, borderRadius: 4, background: item.preview?.text || "#c0caf5", marginBottom: 4 }} />
          <div style={{ width: "50%", height: 6, borderRadius: 3, background: item.preview?.border || "#1e2030" }} />
        </div>
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(0,0,0,0.5)",
            color: item.isOfficial ? "#fbbf24" : "#565f89",
            fontSize: 10,
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          {CATEGORY_LABELS[item.category] || item.type}
        </span>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <h3 style={{ color: "#c0caf5", fontSize: 15, fontWeight: 600, margin: 0, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.name}
          </h3>
          {item.isOfficial && <Crown size={14} color="#fbbf24" />}
        </div>

        <p style={{ color: "#565f89", fontSize: 12, margin: "0 0 12px 0", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.description}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Star size={14} color="#fbbf24" fill="#fbbf24" />
            <span style={{ color: "#c0caf5", fontSize: 13, fontWeight: 500 }}>{item.ratingAverage}</span>
          </div>
          <span style={{ color: "#565f89", fontSize: 12 }}>
            {item.downloads >= 1000 ? `${(item.downloads / 1000).toFixed(1)}k` : item.downloads} descargas
          </span>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onInstall(item); }}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 8,
            background: isInstalled ? "#22c55e" : "#7c3aed",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontSize: 13,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.2s",
            opacity: hover ? 0.9 : 1,
          }}
        >
          {isInstalled ? <Check size={16} /> : <Download size={16} />}
          {isInstalled ? "Instalado" : "Instalar"}
        </button>
      </div>
    </div>
  );
}

export function MarketListCard({ item, isInstalled, onInstall, onSelect }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={() => onSelect(item)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: 16,
        background: "#13141c",
        borderRadius: 8,
        border: hover ? "1px solid #7c3aed" : "1px solid #1e2030",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          width: 80,
          height: 60,
          borderRadius: 8,
          background: item.preview?.background || "#0d0e14",
          padding: 8,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 6, background: item.preview?.primary || "#7c3aed" }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <h3 style={{ color: "#c0caf5", fontSize: 14, fontWeight: 600, margin: 0 }}>
            {item.name}
          </h3>
          {item.isOfficial && <Crown size={12} color="#fbbf24" />}
          <span style={{ color: "#565f89", fontSize: 11, marginLeft: "auto" }}>
            {CATEGORY_LABELS[item.category] || item.type}
          </span>
        </div>

        <p style={{ color: "#565f89", fontSize: 12, margin: "0 0 8px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.description}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Star size={12} color="#fbbf24" fill="#fbbf24" />
            <span style={{ color: "#c0caf5", fontSize: 12 }}>{item.ratingAverage}</span>
          </div>
          <span style={{ color: "#565f89", fontSize: 12 }}>
            {item.downloads >= 1000 ? `${(item.downloads / 1000).toFixed(1)}k` : item.downloads}
          </span>
          <span style={{ color: "#565f89", fontSize: 12 }}>por {item.author}</span>
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onInstall(item); }}
        style={{
          padding: "8px 16px",
          borderRadius: 6,
          background: isInstalled ? "#22c55e" : "#7c3aed",
          border: "none",
          cursor: "pointer",
          color: "white",
          fontSize: 12,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
        }}
      >
        {isInstalled ? <Check size={14} /> : <Download size={14} />}
        {isInstalled ? "Instalado" : "Instalar"}
      </button>
    </div>
  );
}
