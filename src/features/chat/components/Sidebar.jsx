import { useState } from "react";
import { Plus, Users, X } from "lucide-react";
import ProfileBadges from "../../status/components/ProfileBadges";
import { useConversations } from "../hooks/useConversations";
import { getConversationDisplayAvatar, getConversationInitial, isGroupConversation } from "./chat-area/chatUtils";
import CreateGroupModal from "./CreateGroupModal";

export default function Sidebar({
  activeSection,
  selectedConversation,
  onSelectConversation,
  style,
}) {
  const [search, setSearch] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [creating, setCreating] = useState(false);
  const [creationNotice, setCreationNotice] = useState("");
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const { conversations, loading, error, createConversation, createGroupConversation, markAsRead } = useConversations(activeSection);

  const filtered = conversations.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()),
  );

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

  const handleCreateConversation = async (event) => {
    event.preventDefault();

    if (!newChatName.trim()) {
      return;
    }

    try {
      setCreating(true);
      setCreationNotice("");
      const conversation = await createConversation(newChatName.trim());
      setNewChatName("");
      setNewChatOpen(false);
      onSelectConversation(conversation);
    } catch (err) {
      console.error("Error al crear chat:", err);
      setCreationNotice(err.message || "No se pudo crear el chat");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateGroup = async ({ name, description, bio, photoFile, participantIds }) => {
    try {
      const conversation = await createGroupConversation({
        name,
        description,
        bio,
        photoFile,
        participantIds,
      });
      onSelectConversation(conversation);
    } catch (err) {
      console.error("Error al crear grupo:", err);
      throw err;
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
            {activeSection === "chats" ? "Mensajes" : "Canales"}
          </h2>
          <div style={{ display: "flex", gap: 6 }}>
            {activeSection === "chats" && (
              <button
                type="button"
                onClick={() => setGroupModalOpen(true)}
                title="Crear grupo"
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
                <Users size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setNewChatOpen((current) => !current)}
              title={newChatOpen ? "Cerrar" : "Nuevo chat"}
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
                color: newChatOpen ? "#c0caf5" : "#565f89",
              }}
            >
              {newChatOpen ? <X size={14} /> : <Plus size={14} />}
            </button>
          </div>
        </div>

        {newChatOpen && (
          <div style={{ marginBottom: 12 }}>
            <form onSubmit={handleCreateConversation} style={{ display: "flex", gap: 8 }}>
              <input
                autoFocus
                type="text"
                value={newChatName}
                onChange={(event) => {
                  setNewChatName(event.target.value);
                  setCreationNotice("");
                }}
                placeholder="Friend code o email"
                disabled={creating}
                style={{
                  minWidth: 0,
                  flex: 1,
                  padding: "8px 10px",
                  background: "#1a1b26",
                  border: "1px solid #1e2030",
                  borderRadius: 8,
                  color: "#c0caf5",
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={creating || !newChatName.trim()}
                title="Crear chat privado"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: newChatName.trim() ? "#7c3aed" : "#1e2030",
                  border: "none",
                  color: newChatName.trim() ? "white" : "#565f89",
                  cursor: newChatName.trim() ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Plus size={15} />
              </button>
            </form>

            <p style={{ color: creationNotice ? "#ef4444" : "#565f89", fontSize: 11, margin: "7px 0 0" }}>
              {creationNotice || "Crea un chat privado con email o friend code."}
            </p>
          </div>
        )}

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
              isChannel={activeSection === "channels"}
              selected={selectedConversation?.id === item.id}
              onClick={() => handleClick(item)}
            />
          ))
        )}
      </div>
      <CreateGroupModal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
}

function ConversationItem({ item, isChannel, selected, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isGroup = isGroupConversation(item);
  const avatarImage = getConversationDisplayAvatar(item);
  const avatarInitial = getConversationInitial(item);

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
            borderRadius: isChannel || isGroup ? 10 : "50%",
            background: isChannel || isGroup
              ? "#1e2030"
              : "linear-gradient(135deg, #7c3aed, #4f46e5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: isChannel || isGroup ? 16 : 14,
            fontWeight: 600,
            overflow: "hidden",
          }}
        >
          {isChannel ? "#" : avatarImage ? (
            <img
              src={avatarImage}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : avatarInitial}
        </div>
        {!isChannel && item.online && (
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
            gap: 8,
          }}
        >
          <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                color: selected ? "white" : "#c0caf5",
                fontSize: 14,
                fontWeight: item.unread ? 600 : 400,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.name}
            </span>
            <ProfileBadges badges={item.badges} compact max={1} />
          </div>
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
