import { useState } from "react";
import { MessageCircle, Palette, SlidersHorizontal } from "lucide-react";
import { useCustomization } from "../hooks/useCustomization";
import {
  BUBBLE_STYLES,
  CHAT_THEME_PRESETS,
  FONT_PRESETS,
  GLOBAL_THEME_PRESETS,
} from "../services/customizationService";

export default function CustomizationPanel({ selectedConversation, style }) {
  const conversationId = selectedConversation?.backend ? selectedConversation.id : null;
  const {
    userCustomization,
    conversationCustomization,
    visuals,
    loading,
    saving,
    error,
    updateUserCustomization,
    updateConversationCustomization,
  } = useCustomization(conversationId);
  const [notice, setNotice] = useState("");

  const showNotice = (text) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const saveUser = async (updates, message) => {
    await updateUserCustomization(updates);
    showNotice(message);
  };

  const saveConversation = async (updates, message) => {
    await updateConversationCustomization(updates);
    showNotice(message);
  };

  return (
    <aside
      style={{
        width: 340,
        flexShrink: 0,
        background: "#13141c",
        borderRight: "1px solid #1e2030",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      <PanelHeader
        icon={<Palette size={16} />}
        title="Personalizacion"
        subtitle={loading ? "Cargando..." : saving ? "Guardando..." : "Orioneta"}
      />

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {(notice || error) && (
          <Notice text={notice || error} error={Boolean(error && !notice)} />
        )}

        <SectionTitle icon={<SlidersHorizontal size={15} />} title="Global" />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {GLOBAL_THEME_PRESETS.map((theme) => (
            <ThemeButton
              key={theme.id}
              theme={theme}
              active={userCustomization?.activeGlobalThemeId === theme.id}
              onClick={() => saveUser({ activeGlobalThemeId: theme.id }, "Tema aplicado")}
            />
          ))}
        </div>

        <ControlRow label="Fuente">
          <select
            value={userCustomization?.activeFontId || "system"}
            onChange={(event) => saveUser({ activeFontId: event.target.value }, "Fuente actualizada")}
            style={selectStyle}
          >
            {FONT_PRESETS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.name}
              </option>
            ))}
          </select>
        </ControlRow>

        <ControlRow label="Compacto">
          <Toggle
            checked={Boolean(userCustomization?.compactMode)}
            onChange={() => saveUser(
              { compactMode: !userCustomization?.compactMode },
              "Densidad actualizada",
            )}
          />
        </ControlRow>

        <ControlRow label="Animacion">
          <input
            type="range"
            min="0"
            max="5"
            value={userCustomization?.animationLevel ?? 3}
            onChange={(event) => saveUser(
              { animationLevel: Number(event.target.value) },
              "Animacion actualizada",
            )}
            style={{ accentColor: visuals.accent, width: 132 }}
          />
        </ControlRow>

        <SectionTitle icon={<MessageCircle size={15} />} title="Chat" />

        {conversationId ? (
          <>
            <ControlRow label="Fondo">
              <select
                value={conversationCustomization?.activeBackgroundId || conversationCustomization?.activeChatThemeId || "default-chat"}
                onChange={(event) => saveConversation({ activeBackgroundId: event.target.value }, "Fondo aplicado")}
                style={selectStyle}
              >
                {CHAT_THEME_PRESETS.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </ControlRow>

            <ControlRow label="Burbujas">
              <SegmentedControl
                value={conversationCustomization?.bubbleStyle || "DEFAULT"}
                options={BUBBLE_STYLES}
                onChange={(bubbleStyle) => saveConversation({ bubbleStyle }, "Burbujas actualizadas")}
              />
            </ControlRow>

            <ControlRow label="Texto">
              <input
                type="range"
                min="12"
                max="18"
                value={conversationCustomization?.fontSize ?? 14}
                onChange={(event) => saveConversation(
                  { fontSize: Number(event.target.value) },
                  "Tamano actualizado",
                )}
                style={{ accentColor: visuals.accent, width: 132 }}
              />
            </ControlRow>
          </>
        ) : (
          <EmptyChatState />
        )}
      </div>
    </aside>
  );
}

function PanelHeader({ icon, title, subtitle }) {
  return (
    <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid #1e2030" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "#1a1b26", color: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
        <div>
          <h2 style={{ color: "#c0caf5", fontSize: 16, fontWeight: 600, margin: 0 }}>
            {title}
          </h2>
          <p style={{ color: "#565f89", fontSize: 12, margin: "2px 0 0" }}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#a78bfa", margin: "16px 0 10px" }}>
      {icon}
      <p style={{ color: "#c0caf5", fontSize: 13, fontWeight: 700, margin: 0 }}>
        {title}
      </p>
    </div>
  );
}

function ThemeButton({ theme, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: `1px solid ${active ? theme.accent : "#1e2030"}`,
        background: active ? "#1a1b26" : "#10111a",
        borderRadius: 8,
        padding: 9,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", gap: 5, marginBottom: 7 }}>
        <span style={{ width: 18, height: 18, borderRadius: "50%", background: theme.accent }} />
        <span style={{ width: 18, height: 18, borderRadius: "50%", background: theme.accentSecondary }} />
        <span style={{ width: 18, height: 18, borderRadius: "50%", background: theme.incoming }} />
      </div>
      <span style={{ color: active ? "white" : "#c0caf5", fontSize: 12, fontWeight: 600 }}>
        {theme.name}
      </span>
    </button>
  );
}

function ControlRow({ label, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid #1e2030" }}>
      <span style={{ color: "#c0caf5", fontSize: 13 }}>{label}</span>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: 42,
        height: 24,
        borderRadius: 999,
        border: "1px solid #1e2030",
        background: checked ? "#7c3aed" : "#1a1b26",
        padding: 2,
        cursor: "pointer",
      }}
    >
      <span
        style={{
          display: "block",
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "white",
          transform: checked ? "translateX(18px)" : "translateX(0)",
          transition: "transform 0.16s ease",
        }}
      />
    </button>
  );
}

function SegmentedControl({ value, options, onChange }) {
  return (
    <div style={{ display: "flex", background: "#10111a", border: "1px solid #1e2030", borderRadius: 8, padding: 2 }}>
      {options.map((option) => {
        const active = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            title={option.name}
            onClick={() => onChange(option.id)}
            style={{
              minWidth: 28,
              height: 28,
              borderRadius: 6,
              border: "none",
              background: active ? "#7c3aed" : "transparent",
              color: active ? "white" : "#565f89",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {option.name.charAt(0)}
          </button>
        );
      })}
    </div>
  );
}

function Notice({ text, error }) {
  return (
    <div style={{ padding: "9px 10px", borderRadius: 8, background: error ? "rgba(239, 68, 68, 0.1)" : "rgba(124, 58, 237, 0.12)", border: `1px solid ${error ? "rgba(239, 68, 68, 0.25)" : "rgba(124, 58, 237, 0.25)"}`, color: error ? "#ef4444" : "#a78bfa", fontSize: 12 }}>
      {text}
    </div>
  );
}

function EmptyChatState() {
  return (
    <div style={{ padding: 14, background: "#10111a", border: "1px solid #1e2030", borderRadius: 8, color: "#565f89", fontSize: 12 }}>
      Selecciona un chat
    </div>
  );
}

const selectStyle = {
  width: 142,
  padding: "8px 9px",
  background: "#1a1b26",
  border: "1px solid #1e2030",
  borderRadius: 8,
  color: "#c0caf5",
  fontSize: 12,
  outline: "none",
};
