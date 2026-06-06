import { useState, useEffect } from "react";
import { Bell, LogOut, Menu, MessageSquare, Search, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import ChatUtilityPanel from "./ChatUtilityPanel";
import { chatService } from "../services/chatService";
import { clearSession, getSession } from "../../auth/session";
import FriendshipPanel from "../../status/components/FriendshipPanel";
import logoImage from "../../../assets/logo.png";

export default function ChatLayout() {
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [activeSection, setActiveSection] = useState("chats");
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const session = getSession();
  const userInitial = session?.email?.trim()?.charAt(0)?.toUpperCase() || "O";
  const panelVisible = isMobile ? sidebarOpen : !leftPanelCollapsed;
  const panelStyle = {
    position: isMobile ? "fixed" : "relative",
    left: isMobile ? 0 : "auto",
    top: isMobile ? 0 : "auto",
    height: isMobile ? "100vh" : "auto",
    zIndex: isMobile ? 999 : "auto",
    width: isMobile ? "100%" : panelVisible ? "280px" : "0px",
    opacity: panelVisible ? 1 : 0,
    transform: isMobile ? (panelVisible ? "translateX(0)" : "translateX(-100%)") : "none",
    transition: isMobile
      ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease"
      : "width 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease",
    overflow: "hidden",
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (isMobile) {
      setSidebarOpen(true);
      return;
    }

    setLeftPanelCollapsed(false);
  };

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const handleFriendConversation = async (friendConversation) => {
    const conversation = await chatService.upsertDirectConversation(friendConversation);
    setSelectedConversation(conversation);
    setActiveSection("chats");
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d0e14", overflow: "hidden", position: "relative" }}>

      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1000,
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "#7c3aed",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
          }}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Navigation - hidden on mobile when sidebar is open */}
      <nav 
        style={{ 
          width: isMobile ? 0 : 64,
          flexShrink: 0, 
          background: "#0d0e14", 
          borderRight: isMobile ? "none" : "1px solid #1e2030", 
          display: isMobile ? "none" : "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          padding: "16px 0",
          gap: 8,
          transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1), padding 0.2s ease, border-color 0.2s ease",
          overflow: "hidden",
        }}>

        <div style={{ marginBottom: 16 }}>
          <img src={logoImage} style={{ width: 36, height: 36, objectFit: "contain" }} alt="Orioneta" />
        </div>

        <NavDivider />

        <NavIcon
          active={!leftPanelCollapsed}
          onClick={() => setLeftPanelCollapsed((current) => !current)}
          tooltip={leftPanelCollapsed ? "Mostrar panel" : "Ocultar panel"}
          icon={<Menu size={20} />}
        />

        <NavDivider />

        <NavIcon
          active={activeSection === "chats"}
          onClick={() => handleSectionChange("chats")}
          tooltip="Mensajes directos"
          icon={<MessageSquare size={20} />}
        />

        <NavIcon
          active={activeSection === "friends"}
          onClick={() => handleSectionChange("friends")}
          tooltip="Amigos"
          icon={<Users size={20} />}
        />

        <NavIcon
          active={activeSection === "search"}
          onClick={() => handleSectionChange("search")}
          tooltip="Buscar"
          icon={<Search size={20} />}
        />

        <NavIcon
          active={activeSection === "notifications"}
          onClick={() => handleSectionChange("notifications")}
          tooltip="Notificaciones"
          icon={<Bell size={20} />}
        />

        <div style={{ flex: 1 }} />

        <NavIcon
          tooltip="Cerrar sesion"
          onClick={handleLogout}
          icon={<LogOut size={19} />}
        />

        <NavDivider />

        <div title={session?.email || "Sesion de Orioneta"} style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "white", fontWeight: 600, marginTop: 8 }}>
          {userInitial}
        </div>
      </nav>

      {/* Sidebar - responsive */}
      {(!isMobile || sidebarOpen) && (
        <>
          {/* Overlay for mobile */}
          {isMobile && sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0, 0, 0, 0.5)",
                zIndex: 998,
                animation: "fadeIn 0.2s ease-out",
              }}
            />
          )}
          
          {activeSection === "friends" ? (
            <FriendshipPanel
              onFriendClick={handleFriendConversation}
              style={panelStyle}
            />
          ) : activeSection === "search" || activeSection === "notifications" ? (
            <ChatUtilityPanel
              mode={activeSection}
              onSelectConversation={(conv) => {
                setSelectedConversation(conv);
                setActiveSection("chats");
                if (isMobile) setSidebarOpen(false);
              }}
              style={panelStyle}
            />
          ) : (
            <Sidebar
              activeSection={activeSection}
              selectedConversation={selectedConversation}
              onSelectConversation={(conv) => {
                setSelectedConversation(conv);
                if (isMobile) setSidebarOpen(false);
              }}
              style={panelStyle}
            />
          )}
        </>
      )}

      {/* ChatArea */}
      <ChatArea
        key={selectedConversation?.id || "empty-chat"}
        conversation={selectedConversation} 
        isMobile={isMobile}
        onBack={() => {
          if (isMobile) {
            setSelectedConversation(null);
            setSidebarOpen(true);
          }
        }}
      />
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
