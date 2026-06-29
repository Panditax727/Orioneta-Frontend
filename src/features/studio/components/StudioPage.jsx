import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, Download, Upload, RotateCcw, Palette, Type, MessageCircle, Zap,
  CheckCircle, XCircle, Trash2, Globe, Star,
} from "lucide-react";
import { useStudio } from "../hooks/useStudio";
import StudioPreview from "./StudioPreview";

const BUBBLE_OPTIONS = [
  { value: "DEFAULT", label: "Default" },
  { value: "COMPACT", label: "Compacto" },
  { value: "ROUNDED", label: "Redondo" },
  { value: "MINIMAL", label: "Minimal" },
];

export default function StudioPage() {
  const navigate = useNavigate();
  const {
    state, savedThemes, marketTemplates, featuredTemplates, loading, saving, publishing, message, visuals, fileInputRef,
    updateColors, updateFont, updateBubbles, updateAnimations, updateName,
    handleSave, handleExport, handleImport, handleLoadTheme, handleDeleteTheme, handleReset,
    handlePublishToMarket, handleDownloadFromMarket,
  } = useStudio();

  const importInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleImport(file);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0d0e14" }}>
        <span style={{ color: "#565f89", fontSize: 14 }}>Cargando estudio...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d0e14" }}>
      {/* Sidebar */}
      <div style={{ width: 280, flexShrink: 0, background: "#13141c", borderRight: "1px solid #1e2030", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #1e2030" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <button
              onClick={() => navigate("/chat")}
              style={{ width: 32, height: 32, borderRadius: 8, background: "#1a1b26", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#565f89" }}
            >
              <ArrowLeft size={16} />
            </button>
            <h1 style={{ color: "#c0caf5", fontSize: 16, fontWeight: 600, margin: 0 }}>Neta Studio</h1>
          </div>
          <p style={{ color: "#565f89", fontSize: 11, margin: 0 }}>Editor visual de temas</p>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {/* Theme Name */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: "#c0caf5", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Nombre del tema</label>
            <input
              value={state.name}
              onChange={(e) => updateName(e.target.value)}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: 6,
                background: "#1a1b26", border: "1px solid #1e2030",
                color: "#c0caf5", fontSize: 13, outline: "none",
              }}
            />
          </div>

          {/* Colors */}
          <Section icon={<Palette size={14} />} title="Colores">
            <ColorInput label="Acento" value={state.colors.accent} onChange={(v) => updateColors({ accent: v })} />
            <ColorInput label="Acento secundario" value={state.colors.accentSecondary} onChange={(v) => updateColors({ accentSecondary: v })} />
            <ColorInput label="Fondo" value={state.colors.background} onChange={(v) => updateColors({ background: v })} />
            <ColorInput label="Burbuja entrante" value={state.colors.incomingBubble} onChange={(v) => updateColors({ incomingBubble: v })} />
            <ColorInput label="Texto principal" value={state.colors.textPrimary} onChange={(v) => updateColors({ textPrimary: v })} />
            <ColorInput label="Texto secundario" value={state.colors.textSecondary} onChange={(v) => updateColors({ textSecondary: v })} />
            <ColorInput label="Borde" value={state.colors.border} onChange={(v) => updateColors({ border: v })} />
          </Section>

          {/* Font */}
          <Section icon={<Type size={14} />} title="Tipografía">
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: "#565f89", fontSize: 11, display: "block", marginBottom: 4 }}>Fuente</label>
              <select
                value={state.font.family}
                onChange={(e) => updateFont({ family: e.target.value })}
                style={{
                  width: "100%", padding: "7px 8px", borderRadius: 6,
                  background: "#1a1b26", border: "1px solid #1e2030",
                  color: "#c0caf5", fontSize: 12, outline: "none", cursor: "pointer",
                }}
              >
                <option value="Inter, system-ui, sans-serif">Inter</option>
                <option value="system-ui, sans-serif">Sistema</option>
                <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                <option value="'Fira Code', monospace">Fira Code</option>
              </select>
            </div>
            <div>
              <label style={{ color: "#565f89", fontSize: 11, display: "block", marginBottom: 4 }}>
                Tamaño: {state.font.size}px
              </label>
              <input
                type="range" min={12} max={20} step={1}
                value={state.font.size}
                onChange={(e) => updateFont({ size: Number(e.target.value) })}
                style={{ width: "100%", accentColor: "#7c3aed" }}
              />
            </div>
          </Section>

          {/* Bubbles */}
          <Section icon={<MessageCircle size={14} />} title="Burbujas">
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: "#565f89", fontSize: 11, display: "block", marginBottom: 4 }}>Estilo</label>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {BUBBLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateBubbles({ style: opt.value })}
                    style={{
                      padding: "5px 10px", borderRadius: 6, fontSize: 11,
                      background: state.bubbles.style === opt.value ? "#7c3aed" : "#1a1b26",
                      border: "none", cursor: "pointer",
                      color: state.bubbles.style === opt.value ? "white" : "#565f89",
                      transition: "all 0.15s",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ color: "#565f89", fontSize: 11, display: "block", marginBottom: 4 }}>
                Padding: {state.bubbles.padding}px
              </label>
              <input
                type="range" min={0} max={16} step={1}
                value={state.bubbles.padding}
                onChange={(e) => updateBubbles({ padding: Number(e.target.value) })}
                style={{ width: "100%", accentColor: "#7c3aed" }}
              />
            </div>
          </Section>

          {/* Animations */}
          <Section icon={<Zap size={14} />} title="Animaciones">
            <div style={{ marginBottom: 8 }}>
              <label style={{ color: "#565f89", fontSize: 11, display: "block", marginBottom: 4 }}>
                Nivel de animación: {state.animations.level}
              </label>
              <input
                type="range" min={1} max={5} step={1}
                value={state.animations.level}
                onChange={(e) => updateAnimations({ level: Number(e.target.value) })}
                style={{ width: "100%", accentColor: "#7c3aed" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", color: "#2d2f45", fontSize: 10 }}>
                <span>Mínimo</span>
                <span>Máximo</span>
              </div>
            </div>
          </Section>
        </div>

        {/* Bottom Actions */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #1e2030", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <ActionButton
              onClick={handleSave} disabled={saving}
              icon={<Save size={14} />}
              label={saving ? "Guardando..." : "Guardar"}
              color="#7c3aed"
            />
            <ActionButton
              onClick={handleExport}
              icon={<Download size={14} />}
              label="Exportar"
              color="#1e2030"
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <ActionButton
              onClick={() => void handlePublishToMarket()}
              icon={<Globe size={14} />}
              label={publishing ? "Publicando..." : "Publicar"}
              color="#22c55e"
              disabled={publishing}
            />
            <ActionButton
              onClick={() => importInputRef.current?.click()}
              icon={<Upload size={14} />}
              label="Importar"
              color="#1e2030"
            />
          </div>
          <ActionButton
            onClick={handleReset}
            icon={<RotateCcw size={14} />}
            label="Reset"
            color="transparent"
            textColor="#ef4444"
            border="#ef4444"
          />
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {/* Main: Preview + Saved Themes */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Message */}
        {message && (
          <div style={{
            padding: "10px 16px",
            background: message.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            borderBottom: `1px solid ${message.type === "success" ? "#22c55e" : "#ef4444"}`,
            display: "flex", alignItems: "center", gap: 8,
            color: message.type === "success" ? "#22c55e" : "#ef4444",
            fontSize: 13,
          }}>
            {message.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {message.text}
          </div>
        )}

        <div style={{ flex: 1, display: "flex", gap: 16, padding: 16, overflow: "hidden" }}>
          {/* Preview */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h2 style={{ color: "#c0caf5", fontSize: 14, fontWeight: 600, margin: "0 0 10px 0" }}>Vista previa</h2>
            <div style={{ flex: 1 }}>
              <StudioPreview state={state} visuals={visuals} />
            </div>
          </div>

          {/* Saved Themes */}
          <div style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Local Themes */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h2 style={{ color: "#c0caf5", fontSize: 14, fontWeight: 600, margin: "0 0 10px 0" }}>
                Temas locales ({savedThemes.length})
              </h2>
              <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {savedThemes.length === 0 ? (
                  <div style={{ padding: 20, textAlign: "center", color: "#565f89", fontSize: 12 }}>
                    <Palette size={32} color="#2d2f45" style={{ marginBottom: 8 }} />
                    <p style={{ margin: 0 }}>No hay temas guardados</p>
                  </div>
                ) : (
                  savedThemes.map((theme) => (
                    <div
                      key={theme.name + theme.savedAt}
                      style={{
                        background: "#13141c",
                        borderRadius: 8,
                        border: state.name === theme.name ? "1px solid #7c3aed" : "1px solid #1e2030",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ height: 40, background: theme.colors?.background || "#0d0e14", padding: 8, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: theme.colors?.accent || "#7c3aed" }} />
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: theme.colors?.textPrimary || "#c0caf5" }} />
                      </div>
                      <div style={{ padding: "8px 10px" }}>
                        <p style={{ color: "#c0caf5", fontSize: 12, fontWeight: 600, margin: "0 0 4px 0" }}>{theme.name}</p>
                        <p style={{ color: "#565f89", fontSize: 10, margin: "0 0 8px 0" }}>
                          {theme.savedAt ? new Date(theme.savedAt).toLocaleDateString() : ""}
                        </p>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            onClick={() => void handleLoadTheme(theme)}
                            style={{
                              flex: 1, padding: "4px 8px", borderRadius: 4, fontSize: 10,
                              background: "#7c3aed", border: "none", cursor: "pointer",
                              color: "white", fontWeight: 500,
                            }}
                          >
                            Cargar
                          </button>
                          <button
                            onClick={() => void handleDeleteTheme(theme.name)}
                            style={{
                              width: 26, height: 22, borderRadius: 4,
                              background: "transparent", border: "1px solid #ef4444",
                              cursor: "pointer", display: "flex", alignItems: "center",
                              justifyContent: "center", color: "#ef4444",
                            }}
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Featured Templates */}
            {featuredTemplates.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h2 style={{ color: "#c0caf5", fontSize: 14, fontWeight: 600, margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: 6 }}>
                  <Star size={14} color="#f59e0b" />
                  Destacados
                </h2>
                <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                  {featuredTemplates.map((template) => (
                    <div
                      key={template.id}
                      style={{
                        background: "#13141c",
                        borderRadius: 8,
                        border: "1px solid #1e2030",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ padding: "8px 10px" }}>
                        <p style={{ color: "#c0caf5", fontSize: 12, fontWeight: 600, margin: "0 0 4px 0" }}>{template.name}</p>
                        <p style={{ color: "#565f89", fontSize: 10, margin: "0 0 8px 0" }}>
                          {template.description || "Sin descripción"}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: "#565f89" }}>
                          <span>⭐ {template.ratingAverage || 0}</span>
                          <span>↓ {template.downloads || 0}</span>
                        </div>
                        <button
                          onClick={() => void handleDownloadFromMarket(template.id)}
                          style={{
                            width: "100%", marginTop: 8, padding: "6px 8px", borderRadius: 4,
                            background: "#22c55e", border: "none", cursor: "pointer",
                            color: "white", fontSize: 11, fontWeight: 500,
                          }}
                        >
                          Descargar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Market Templates */}
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <h2 style={{ color: "#c0caf5", fontSize: 14, fontWeight: 600, margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: 6 }}>
                <Globe size={14} />
                Neta Market ({marketTemplates.length})
              </h2>
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {marketTemplates.length === 0 ? (
                  <div style={{ padding: 20, textAlign: "center", color: "#565f89", fontSize: 12 }}>
                    <Globe size={32} color="#2d2f45" style={{ marginBottom: 8 }} />
                    <p style={{ margin: 0 }}>No hay plantillas disponibles</p>
                  </div>
                ) : (
                  marketTemplates.map((template) => (
                    <div
                      key={template.id}
                      style={{
                        background: "#13141c",
                        borderRadius: 8,
                        border: "1px solid #1e2030",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ padding: "8px 10px" }}>
                        <p style={{ color: "#c0caf5", fontSize: 12, fontWeight: 600, margin: "0 0 4px 0" }}>{template.name}</p>
                        <p style={{ color: "#565f89", fontSize: 10, margin: "0 0 8px 0" }}>
                          {template.description || "Sin descripción"}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: "#565f89" }}>
                          <span>⭐ {template.ratingAverage || 0}</span>
                          <span>↓ {template.downloads || 0}</span>
                        </div>
                        <button
                          onClick={() => void handleDownloadFromMarket(template.id)}
                          style={{
                            width: "100%", marginTop: 8, padding: "6px 8px", borderRadius: 4,
                            background: "#1e2030", border: "1px solid #7c3aed", cursor: "pointer",
                            color: "#c0caf5", fontSize: 11, fontWeight: 500,
                          }}
                        >
                          Descargar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ color: "#c0caf5", fontSize: 12, fontWeight: 600, margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: 5 }}>
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function ColorInput({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: 32, height: 32, borderRadius: 6, border: "1px solid #1e2030",
          padding: 2, cursor: "pointer", background: "transparent",
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <label style={{ color: "#565f89", fontSize: 11, display: "block" }}>{label}</label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%", padding: "4px 6px", borderRadius: 4,
            background: "#1a1b26", border: "1px solid #1e2030",
            color: "#c0caf5", fontSize: 11, outline: "none", fontFamily: "monospace",
          }}
        />
      </div>
    </div>
  );
}

function ActionButton({ onClick, icon, label, color, textColor = "white", border, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        gap: 6, padding: "8px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500,
        background: color, border: border ? `1px solid ${border}` : "none",
        cursor: disabled ? "not-allowed" : "pointer",
        color: textColor, opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
