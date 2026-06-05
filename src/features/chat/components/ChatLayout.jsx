import { useState } from "react";
import { MessageSquare, Users, Search, Bell } from "lucide-react";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";

export default function ChatLayout() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [activeSection, setActiveSection] = useState("chats");

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d0e14", overflow: "hidden" }}>

      <nav style={{ width: 64, flexShrink: 0, background: "#0d0e14", borderRight: "1px solid #1e2030", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", gap: 8 }}>

        <div style={{ marginBottom: 16 }}>
          <img src="/src/assets/logo.png" style={{ width: 36, height: 36, objectFit: "contain" }} alt="Orioneta" />
        </div>

        <NavDivider />

        <NavIcon
          active={activeSection === "chats"}
          onClick={() => setActiveSection("chats")}
          tooltip="Mensajes directos"
          icon={<MessageSquare size={20} />}
        />

        <NavIcon
          active={activeSection === "channels"}
          onClick={() => setActiveSection("channels")}
          tooltip="Canales"
          icon={<Users size={20} />}
        />

        <NavIcon
          tooltip="Buscar"
          icon={<Search size={20} />}
        />

        <NavIcon
          tooltip="Notificaciones"
          icon={<Bell size={20} />}
        />

        <div style={{ flex: 1 }} />

        <NavDivider />

        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: "white", fontWeight: 600, marginTop: 8 }}>
          P
        </div>
      </nav>

      <Sidebar
        activeSection={activeSection}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
      />

      <ChatArea conversation={selectedConversation} />
    </div>
  );
}

function NavIcon({ icon, active, onClick, tooltip }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={tooltip}
      style={{ width: 40, height: 40, borderRadius: 10, background: active ? "#7c3aed" : hovered ? "#1a1b26" : "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: active ? "white" : hovered ? "#c0caf5" : "#565f89", transition: "all 0.15s" }}
    >
      {icon}
    </button>
  );
}

function NavDivider() {
  return <div style={{ width: 32, height: 1, background: "#1e2030", margin: "4px 0" }} />;
}