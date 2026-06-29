import { useEffect, useMemo, useState } from "react";
import { Download, Palette, Search, Sparkles, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { customizationService } from "../services/customizationService";

const TEMPLATE_TYPES = [
  { value: "", label: "Todo" },
  { value: "GLOBAL_THEME", label: "Temas" },
  { value: "CHAT_THEME", label: "Chats" },
  { value: "BACKGROUND", label: "Fondos" },
  { value: "BUBBLE_STYLE", label: "Burbujas" },
  { value: "FONT", label: "Fuentes" },
  { value: "ANIMATION_PACK", label: "Animacion" },
];

const TYPE_LABELS = {
  GLOBAL_THEME: "Tema",
  CHAT_THEME: "Chat",
  GROUP_THEME: "Grupo",
  BACKGROUND: "Fondo",
  FONT: "Fuente",
  ANIMATION_PACK: "Animacion",
  NOTIFICATION_STYLE: "Notificacion",
  SOUND_PACK: "Sonido",
  BUBBLE_STYLE: "Burbuja",
};

export default function NetaMarketPanel({ selectedConversation, style }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [templates, setTemplates] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [templateResults, featuredResults] = await Promise.all([
          customizationService.searchTemplates({ query, type }),
          customizationService.getFeaturedTemplates(),
        ]);

        if (mounted) {
          setTemplates(templateResults);
          setFeatured(featuredResults);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || "No se pudo cargar Neta Market");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    const timeoutId = window.setTimeout(() => {
      void load();
    }, 180);

    return () => {
      mounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [query, type]);

  const visibleTemplates = useMemo(() => {
    if (query.trim() || type) {
      return templates;
    }

    return featured.length ? featured : templates;
  }, [featured, query, templates, type]);

  const handleApply = async (template) => {
    try {
      setBusyId(template.id);
      setError("");
      setNotice("");

      await customizationService.applyTemplate(
        template,
        selectedConversation?.backend ? selectedConversation.id : null,
      );

      setNotice(`${template.name} aplicado`);
    } catch (applyError) {
      setError(applyError.message || "No se pudo aplicar el template");
    } finally {
      setBusyId("");
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
      <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid #1e2030" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "#1a1b26", color: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Store size={16} />
          </div>
          <div>
            <h2 style={{ color: "#c0caf5", fontSize: 16, fontWeight: 600, margin: 0 }}>
              Neta Market
            </h2>
            <p style={{ color: "#565f89", fontSize: 12, margin: "2px 0 0" }}>
              Templates visuales
            </p>
          </div>
        </div>

        <div style={{ position: "relative", marginBottom: 10 }}>
          <Search size={14} color="#565f89" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar templates"
            style={{ width: "100%", padding: "9px 12px 9px 32px", background: "#1a1b26", border: "1px solid #1e2030", borderRadius: 8, color: "#c0caf5", fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2 }}>
          {TEMPLATE_TYPES.map((item) => (
            <button
              key={item.value || "all"}
              type="button"
              onClick={() => setType(item.value)}
              style={{
                border: "none",
                borderRadius: 999,
                background: type === item.value ? "#7c3aed" : "#1a1b26",
                color: type === item.value ? "white" : "#565f89",
                padding: "6px 10px",
                fontSize: 11,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate("/studio")}
          style={{ width: "100%", height: 36, marginTop: 12, borderRadius: 8, border: "1px solid rgba(167, 139, 250, 0.3)", background: "rgba(124, 58, 237, 0.12)", color: "#c4b5fd", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", fontSize: 12, fontWeight: 800 }}
        >
          <Palette size={14} />
          Crear tema en Neta Studio
        </button>
      </div>

      {(notice || error) && (
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #1e2030" }}>
          <p style={{ color: error ? "#ef4444" : "#a78bfa", fontSize: 12, margin: 0 }}>
            {error || notice}
          </p>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {loading ? (
          <PanelMessage text="Cargando..." />
        ) : visibleTemplates.length === 0 ? (
          <PanelMessage text="Sin resultados" />
        ) : (
          visibleTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              busy={busyId === template.id}
              onApply={() => handleApply(template)}
            />
          ))
        )}
      </div>
    </aside>
  );
}

function TemplateCard({ template, busy, onApply }) {
  const accent = getTemplateAccent(template);

  return (
    <article style={{ background: "#10111a", border: "1px solid #1e2030", borderRadius: 8, padding: 12, marginBottom: 10 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ width: 58, height: 58, borderRadius: 8, background: `linear-gradient(135deg, ${accent}, #1e2030)`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
          <Sparkles size={20} />
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <p style={{ color: "#c0caf5", fontSize: 14, fontWeight: 700, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {template.name}
            </p>
            <span style={{ color: "#a78bfa", fontSize: 10, background: "rgba(124, 58, 237, 0.15)", padding: "3px 6px", borderRadius: 999, whiteSpace: "nowrap" }}>
              {TYPE_LABELS[template.type] || template.type}
            </span>
          </div>

          <p style={{ color: "#565f89", fontSize: 12, margin: "5px 0 8px", lineHeight: 1.35 }}>
            {template.description || "Template Orioneta"}
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ color: "#565f89", fontSize: 11 }}>
              {Number(template.ratingAverage || 0).toFixed(1)} · {template.downloads || 0}
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={onApply}
              title="Aplicar"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", borderRadius: 7, background: busy ? "#1e2030" : "#7c3aed", color: busy ? "#565f89" : "white", padding: "7px 9px", fontSize: 11, cursor: busy ? "wait" : "pointer" }}
            >
              <Download size={13} />
              {busy ? "..." : "Aplicar"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function PanelMessage({ text }) {
  return (
    <div style={{ padding: 20, textAlign: "center", color: "#565f89", fontSize: 13 }}>
      {text}
    </div>
  );
}

function getTemplateAccent(template) {
  if (template.type === "BACKGROUND") return "#22c55e";
  if (template.type === "BUBBLE_STYLE") return "#f97316";
  if (template.type === "FONT") return "#06b6d4";
  if (template.type === "ANIMATION_PACK") return "#e11d48";
  return "#7c3aed";
}
