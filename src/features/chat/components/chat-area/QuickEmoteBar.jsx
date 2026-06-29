import { Sparkles } from "lucide-react";
import { QUICK_EMOTES } from "./chatUtils";

export default function QuickEmoteBar({ accent, onSelect }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, overflowX: "auto" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#565f89", fontSize: 11, fontWeight: 800, marginRight: 2, whiteSpace: "nowrap" }}>
        <Sparkles size={12} color={accent} /> Rapido
      </span>
      {QUICK_EMOTES.map((emote) => (
        <button key={emote} type="button" onClick={() => onSelect(emote)} style={{ height: 28, borderRadius: 999, border: "1px solid #1e2030", background: "#13141c", color: "#c0caf5", padding: "0 10px", fontSize: 12, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>
          {emote}
        </button>
      ))}
    </div>
  );
}
