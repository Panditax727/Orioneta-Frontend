import { useState } from "react";
import { useConversations } from "../hooks/useConversations";

export default function Sidebar({
  selectedConversation,
  onSelectConversation,
  style,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, direct, groups
  const { conversations, loading, error, markAsRead } = useConversations();

  const filtered = conversations.filter((i) => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = 
      filter === "all" || 
      (filter === "direct" && !i.isGroup) || 
      (filter === "groups" && i.isGroup);
    return matchesSearch && matchesFilter;
  });

  const handleClick = async (item) => {
    onSelectConversation(item);
    if (item.unread > 0) {
      try {
        await markAsRead(item.id);
      } catch (err) {
        console.error("Error al marcar como leído:", err);
      }
    }
  };

  return (
    <div
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
      {/* Header */}
      <div
        style={{ padding: "20px 16px 12px", borderBottom: "1px solid #1e2030" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h2
            style={{
              color: "#c0caf5",
              fontSize: 16,
              fontWeight: 600,
              margin: 0,
            }}
          >
            Mensajes
          </h2>
          <button
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "#1a1b26",
              border: "1px solid #1e2030",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#565f89",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        {/* Filter buttons */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <button
            onClick={() => setFilter("all")}
            style={{
              flex: 1,
              padding: "6px 12px",
              borderRadius: 6,
              background: filter === "all" ? "#7c3aed" : "#1a1b26",
              border: "1px solid #1e2030",
              color: filter === "all" ? "white" : "#565f89",
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter("direct")}
            style={{
              flex: 1,
              padding: "6px 12px",
              borderRadius: 6,
              background: filter === "direct" ? "#7c3aed" : "#1a1b26",
              border: "1px solid #1e2030",
              color: filter === "direct" ? "white" : "#565f89",
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Directos
          </button>
          <button
            onClick={() => setFilter("groups")}
            style={{
              flex: 1,
              padding: "6px 12px",
              borderRadius: 6,
              background: filter === "groups" ? "#7c3aed" : "#1a1b26",
              border: "1px solid #1e2030",
              color: filter === "groups" ? "white" : "#565f89",
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Grupos
          </button>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#565f89"
            strokeWidth="2"
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 30px",
              background: "#1a1b26",
              border: "1px solid #1e2030",
              borderRadius: 8,
              color: "#c0caf5",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
            onBlur={(e) => (e.target.style.borderColor = "#1e2030")}
          />
        </div>
      </div>

      {/* Lista */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <span style={{ color: "#565f89", fontSize: "13px" }}>
              Cargando...
            </span>
          </div>
        ) : error ? (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <span style={{ color: "#ef4444", fontSize: "13px" }}>
              Error: {error}
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <span style={{ color: "#565f89", fontSize: "13px" }}>
              No se encontraron conversaciones
            </span>
          </div>
        ) : (
          filtered.map((item) => (
            <ConversationItem
              key={item.id}
              item={item}
              selected={selectedConversation?.id === item.id}
              onClick={() => handleClick(item)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ConversationItem({ item, selected, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        cursor: "pointer",
        background: selected ? "#1a1b26" : hovered ? "#161720" : "transparent",
        borderLeft: selected ? "2px solid #7c3aed" : "2px solid transparent",
        transition: "all 0.1s",
      }}
    >
      {/* Avatar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: item.isGroup ? 10 : "50%",
            background: item.isGroup
              ? "#1e2030"
              : "linear-gradient(135deg, #7c3aed, #4f46e5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: item.isGroup ? 16 : 14,
            fontWeight: 600,
          }}
        >
          {item.isGroup ? "#" : item.avatar}
        </div>
        {!item.isGroup && item.online && (
          <div
            style={{
              position: "absolute",
              bottom: 1,
              right: 1,
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "#22c55e",
              border: "2px solid #13141c",
            }}
          />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: selected ? "white" : "#c0caf5",
              fontSize: 14,
              fontWeight: item.unread ? 600 : 400,
            }}
          >
            {item.name}
          </span>
          <span style={{ color: "#565f89", fontSize: 11 }}>{item.time}</span>
        </div>
        <p
          style={{
            color: "#565f89",
            fontSize: 12,
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.lastMessage}
        </p>
      </div>

      {/* Badge */}
      {item.unread > 0 && (
        <div
          style={{
            minWidth: 18,
            height: 18,
            borderRadius: 999,
            background: "#7c3aed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 10,
            fontWeight: 700,
            padding: "0 5px",
          }}
        >
          {item.unread}
        </div>
      )}
    </div>
  );
}
