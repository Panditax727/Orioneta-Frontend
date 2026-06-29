import { useEffect, useState } from "react";
import { Bell, MessageSquare, Search } from "lucide-react";
import { chatService } from "../services/chatService";
import { resolveProfilePhoto } from "../../../services/profilePhotoService";

export default function ChatUtilityPanel({ mode, onSelectConversation, style }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const response = mode === "notifications"
          ? await chatService.getUnreadConversations()
          : await chatService.searchConversations(query, "dms");

        if (mounted) {
          setResults(mode === "notifications" ? response : response.dms);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [mode, query]);

  const emptyText = mode === "notifications"
    ? "No tienes notificaciones pendientes"
    : "No se encontraron conversaciones";

  return (
    <aside
      style={{
        width: 280,
        flexShrink: 0,
        background: "#13141c",
        borderRight: "1px solid #1e2030",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid #1e2030" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: mode === "search" ? 12 : 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "#1a1b26", color: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {mode === "notifications" ? <Bell size={16} /> : <Search size={16} />}
          </div>
          <div>
            <h2 style={{ color: "#c0caf5", fontSize: 16, fontWeight: 600, margin: 0 }}>
              {mode === "notifications" ? "Notificaciones" : "Buscar"}
            </h2>
            <p style={{ color: "#565f89", fontSize: 12, margin: "2px 0 0" }}>
              {mode === "notifications" ? "Actividad pendiente" : "Mensajes directos"}
            </p>
          </div>
        </div>

        {mode === "search" && (
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              color="#565f89"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              autoFocus
              type="text"
              placeholder="Buscar chats..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{ width: "100%", padding: "8px 12px 8px 30px", background: "#1a1b26", border: "1px solid #1e2030", borderRadius: 8, color: "#c0caf5", fontSize: 13, outline: "none", boxSizing: "border-box" }}
            />
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {loading ? (
          <PanelMessage text="Cargando..." />
        ) : results.length === 0 ? (
          <PanelMessage text={emptyText} />
        ) : (
          results.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onSelectConversation(conversation)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", border: "none", background: "transparent", color: "inherit", cursor: "pointer", textAlign: "left" }}
              onMouseEnter={(event) => { event.currentTarget.style.background = "#161720"; }}
              onMouseLeave={(event) => { event.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14, fontWeight: 600, flexShrink: 0, overflow: "hidden" }}>
                {(() => {
                  const photoSrc = resolveProfilePhoto(conversation.avatarPhoto);
                  if (photoSrc) {
                    return <img src={photoSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
                  }
                  return conversation.avatar || conversation.name?.charAt(0) || "?";
                })()}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ color: "#c0caf5", fontSize: 14, fontWeight: 600, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {conversation.name}
                </p>
                <p style={{ color: "#565f89", fontSize: 12, margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {mode === "notifications" ? `${conversation.unread} mensaje(s) sin leer` : conversation.lastMessage}
                </p>
              </div>
              <MessageSquare size={15} color="#565f89" />
            </button>
          ))
        )}
      </div>
    </aside>
  );
}

function PanelMessage({ text }) {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <span style={{ color: "#565f89", fontSize: 13 }}>{text}</span>
    </div>
  );
}
