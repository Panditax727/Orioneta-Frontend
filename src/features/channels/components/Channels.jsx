import { useState, useEffect } from "react";
import { Hash, Plus, Search } from "lucide-react";
import { useChannels } from "../hooks/useChannels";

export default function Channels() {
  const { channels, loading, error, createChannel } = useChannels();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    try {
      await createChannel({
        name: newChannelName,
        description: `Canal ${newChannelName}`,
      });
      setNewChannelName("");
      setShowCreateModal(false);
    } catch (err) {
      console.error("Error al crear canal:", err);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          width: isMobile ? "100%" : "260px",
          background: "#151822",
          borderRight: isMobile ? "none" : "1px solid #252838",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <span style={{ color: "#565f89" }}>Cargando canales...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: isMobile ? "100%" : "260px",
          background: "#151822",
          borderRight: isMobile ? "none" : "1px solid #252838",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <span style={{ color: "#ef4444" }}>Error: {error}</span>
      </div>
    );
  }

  return (
    <div
      style={{
        width: isMobile ? "100%" : "260px",
        background: "#151822",
        borderRight: isMobile ? "none" : "1px solid #252838",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #252838",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "white",
            fontWeight: "600",
          }}
        >
          Channels ({channels.length})
        </span>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            border: "none",
            background: "#7c3aed",
            color: "white",
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: "8px 16px" }}>
        <div style={{ position: "relative" }}>
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
            placeholder="Buscar canales..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 32px",
              background: "#1a1b26",
              border: "1px solid #1e2030",
              borderRadius: "8px",
              color: "#c0caf5",
              fontSize: "13px",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
            onBlur={(e) => (e.target.style.borderColor = "#1e2030")}
          />
        </div>
      </div>

      {/* Lista */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px",
        }}
      >
        {filteredChannels.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <span style={{ color: "#565f89", fontSize: "13px" }}>
              No se encontraron canales
            </span>
          </div>
        ) : (
          filteredChannels.map((channel) => (
            <ChannelItem key={channel.id} channel={channel} />
          ))
        )}
      </div>

      {/* Modal de crear canal */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: "#13141c",
              border: "1px solid #1e2030",
              borderRadius: "12px",
              padding: "24px",
              width: "320px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                color: "white",
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "16px",
                margin: "0 0 16px 0",
              }}
            >
              Crear nuevo canal
            </h3>
            <input
              type="text"
              placeholder="Nombre del canal"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                background: "#1a1b26",
                border: "1px solid #1e2030",
                borderRadius: "8px",
                color: "#c0caf5",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                marginBottom: "16px",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
              onBlur={(e) => (e.target.style.borderColor = "#1e2030")}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#1a1b26",
                  border: "1px solid #1e2030",
                  borderRadius: "8px",
                  color: "#c0caf5",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateChannel}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#7c3aed",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChannelItem({ channel }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: hovered ? "#1a1b26" : "transparent",
        border: "none",
        color: "#cbd5e1",
        padding: "10px",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
    >
      <Hash size={18} />
      <span style={{ flex: 1, textAlign: "left" }}>{channel.name}</span>
      {channel.unread > 0 && (
        <span
          style={{
            background: "#7c3aed",
            color: "white",
            fontSize: "11px",
            fontWeight: "600",
            padding: "2px 8px",
            borderRadius: "999",
          }}
        >
          {channel.unread}
        </span>
      )}
    </button>
  );
}
