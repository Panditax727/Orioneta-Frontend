import { useState } from "react";
import { Copy, MessageCircle, MoreVertical, Search, Trash2 } from "lucide-react";
import { copyToClipboard } from "../../../shared/utils/helpers";
import { resolveProfilePhoto } from "../../../services/profilePhotoService";

const STATUS_COLORS = {
  online: "#22c55e",
  idle: "#f59e0b",
  dnd: "#ef4444",
  offline: "#565f89",
};

const STATUS_LABELS = {
  online: "En línea",
  idle: "Ausente",
  dnd: "No molestar",
  offline: "Desconectado",
};

export default function FriendsList({ friends, onFriendClick, onRemoveFriend }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState("");

  const filteredFriends = friends.filter(friend => {
    const matchesSearch = (friend.name || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter = filter === "all" || friend.status === filter;
    return matchesSearch && matchesFilter;
  });

  const onlineCount = friends.filter(f => f.status === "online").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "16px", borderBottom: "1px solid #1e2030" }}>
        <h2 style={{ color: "#c0caf5", fontSize: 16, fontWeight: 600, margin: "0 0 12px 0" }}>
          Amigos ({onlineCount} en línea)
        </h2>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#565f89",
            }}
          />
          <input
            type="text"
            placeholder="Buscar amigos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 32px",
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

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "online", "idle", "dnd"].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: "4px 12px",
                background: filter === status ? "#7c3aed" : "#1a1b26",
                border: filter === status ? "none" : "1px solid #1e2030",
                borderRadius: 6,
                color: filter === status ? "white" : "#565f89",
                fontSize: 11,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {status === "all" ? "Todos" : STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        {notice && (
          <p style={{ color: "#a78bfa", fontSize: 11, margin: "9px 0 0" }}>
            {notice}
          </p>
        )}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        {filteredFriends.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <span style={{ color: "#565f89", fontSize: 13 }}>
              No se encontraron amigos
            </span>
          </div>
        ) : (
          filteredFriends.map(friend => (
            <FriendItem
              key={friend.id}
              friend={friend}
              onClick={() => onFriendClick?.(friend)}
              onCopy={(value, message) => {
                copyToClipboard(value).then((copied) => {
                  setNotice(copied ? message : "No se pudo copiar");
                  window.setTimeout(() => setNotice(""), 2200);
                });
              }}
              onRemove={() => onRemoveFriend?.(friend)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function FriendItem({ friend, onClick, onCopy, onRemove }) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleOpenChat = () => {
    setMenuOpen(false);
    onClick?.();
  };

  const handleCopyFriendCode = () => {
    if (friend.friendCode) {
      onCopy?.(friend.friendCode, "Friend code copiado");
    }

    setMenuOpen(false);
  };

  const handleCopyEmail = () => {
    if (friend.email) {
      onCopy?.(friend.email, "Email copiado");
    }

    setMenuOpen(false);
  };

  const handleRemove = () => {
    setMenuOpen(false);
    onRemove?.();
  };

  return (
    <div
      onClick={handleOpenChat}
      onDoubleClick={handleOpenChat}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        position: "relative",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 8,
        cursor: "pointer",
        background: hovered ? "#1a1b26" : "transparent",
        transition: "background 0.15s",
      }}
    >
      {/* Avatar with status indicator */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {(() => {
            const photoSrc = resolveProfilePhoto(friend.profilePhoto);
            if (photoSrc) {
              return <img src={photoSrc} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />;
            }
            return friend.avatar;
          })()}
        </div>
        {friend.status !== "offline" && (
          <div
            style={{
              position: "absolute",
              bottom: 1,
              right: 1,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: STATUS_COLORS[friend.status],
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
              color: "#c0caf5",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {friend.name}
          </span>
          <button
            type="button"
            title="Acciones de amigo"
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((current) => !current);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#565f89",
              padding: 4,
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.15s",
            }}
          >
            <MoreVertical size={16} />
          </button>
        </div>

        {menuOpen && (
          <>
            <div
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen(false);
              }}
              style={{ position: "fixed", inset: 0, zIndex: 900 }}
            />
            <div
              onClick={(event) => event.stopPropagation()}
              style={{
                position: "absolute",
                right: 12,
                top: 46,
                zIndex: 901,
                width: 176,
                padding: 6,
                borderRadius: 10,
                background: "#10111a",
                border: "1px solid #1e2030",
                boxShadow: "0 18px 36px rgba(0,0,0,0.28)",
              }}
            >
              <MenuAction icon={<MessageCircle size={14} />} label="Abrir chat" onClick={handleOpenChat} />
              <MenuAction icon={<Copy size={14} />} label="Copiar friend code" disabled={!friend.friendCode} onClick={handleCopyFriendCode} />
              <MenuAction icon={<Copy size={14} />} label="Copiar email" disabled={!friend.email} onClick={handleCopyEmail} />
              <MenuAction danger icon={<Trash2 size={14} />} label="Eliminar amigo" onClick={handleRemove} />
            </div>
          </>
        )}

        <p
          style={{
            color: friend.status === "online" ? "#22c55e" : "#565f89",
            fontSize: 12,
            margin: "2px 0 0 0",
          }}
        >
          {friend.activity || STATUS_LABELS[friend.status]}
        </p>
      </div>
    </div>
  );
}

function MenuAction({ icon, label, danger, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        width: "100%",
        minHeight: 32,
        border: "none",
        borderRadius: 7,
        background: "transparent",
        color: disabled ? "#2d2f45" : danger ? "#ef4444" : "#c0caf5",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 8px",
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        textAlign: "left",
      }}
      onMouseEnter={(event) => {
        if (!disabled) {
          event.currentTarget.style.background = "#1a1b26";
        }
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "transparent";
      }}
    >
      {icon}
      {label}
    </button>
  );
}
