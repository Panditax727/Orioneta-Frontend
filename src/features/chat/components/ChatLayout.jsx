import { useState, useEffect } from "react";
import { Bell, LogOut, Menu, MessageSquare, Search, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import { clearSession, getSession } from "../../auth/session";
import FriendshipPanel from "../../status/components/FriendshipPanel";
import logoImage from "../../../assets/logo.png";

export default function ChatLayout() {
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [activeSection, setActiveSection] = useState("chats");
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leftPanelVisible, setLeftPanelVisible] = useState(false);
  const session = getSession();
  const userInitial = session?.email?.trim()?.charAt(0)?.toUpperCase() || "O";

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

  const handleLeftPanelMouseEnter = () => {
    if (!isMobile) {
      setLeftPanelVisible(true);
    }
  };

  const handleLeftPanelMouseLeave = () => {
    if (!isMobile) {
      setLeftPanelVisible(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
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

      {/* Left panel hover detection area */}
      {!isMobile && (
        <div
          onMouseEnter={handleLeftPanelMouseEnter}
          onMouseLeave={handleLeftPanelMouseLeave}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: leftPanelVisible ? 344 : 20,
            height: "100%",
            zIndex: 50,
          }}
        />
      )}

      {/* Navigation - hidden on mobile when sidebar is open */}
      <nav 
        style={{ 
          width: isMobile ? 0 : leftPanelVisible ? 64 : 0, 
          flexShrink: 0, 
          background: "#0d0e14", 
          borderRight: leftPanelVisible ? "1px solid #1e2030" : "none", 
          display: isMobile ? "none" : "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          padding: leftPanelVisible ? "16px 0" : "0", 
          gap: 8,
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease, border-color 0.3s ease",
          overflow: "hidden",
        }}>

        <div style={{ marginBottom: 16 }}>
          <img src={logoImage} style={{ width: 36, height: 36, objectFit: "contain" }} alt="Orioneta" />
        </div>

        <NavDivider />

        <NavIcon
          active={activeSection === "chats"}
          onClick={() => setActiveSection("chats")}
          tooltip="Mensajes directos"
          icon={<MessageSquare size={20} />}
        />

        <NavIcon
          active={activeSection === "friends"}
          onClick={() => setActiveSection("friends")}
          tooltip="Amigos"
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
              onFriendClick={(friendConversation) => {
                setSelectedConversation(friendConversation);
                if (isMobile) setSidebarOpen(false);
              }}
              style={{
                position: isMobile ? "fixed" : "relative",
                left: isMobile ? 0 : "auto",
                top: isMobile ? 0 : "auto",
                height: isMobile ? "100vh" : "auto",
                zIndex: isMobile ? 999 : "auto",
                width: isMobile ? "100%" : leftPanelVisible ? "280px" : "0px",
                opacity: isMobile ? (sidebarOpen ? 1 : 0) : leftPanelVisible ? 1 : 0,
                transform: isMobile ? (sidebarOpen ? "translateX(0)" : "translateX(-100%)") : "none",
                transition: isMobile
                  ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease"
                  : "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
                overflow: "hidden",
              }}
            />
          ) : (
            <Sidebar
              activeSection={activeSection}
              selectedConversation={selectedConversation}
              onSelectConversation={(conv) => {
                setSelectedConversation(conv);
                if (isMobile) setSidebarOpen(false);
              }}
              style={{
                position: isMobile ? "fixed" : "relative",
                left: isMobile ? 0 : "auto",
                top: isMobile ? 0 : "auto",
                height: isMobile ? "100vh" : "auto",
                zIndex: isMobile ? 999 : "auto",
                width: isMobile ? "100%" : leftPanelVisible ? "280px" : "0px",
                opacity: isMobile ? (sidebarOpen ? 1 : 0) : leftPanelVisible ? 1 : 0,
                transform: isMobile ? (sidebarOpen ? "translateX(0)" : "translateX(-100%)") : "none",
                transition: isMobile
                  ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease"
                  : "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
                overflow: "hidden",
              }}
            />
          )}
        </>
      )}

      {/* ChatArea */}
      <ChatArea 
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
