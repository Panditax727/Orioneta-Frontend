import { useState, useEffect } from "react";
import { MessageSquare, Users, Search, Bell, Menu, X, ChevronLeft, ChevronRight, Info, Settings } from "lucide-react";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import ChatDetails from "./ChatDetails";
import { useNavigate } from "react-router-dom";

export default function ChatLayout() {
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leftPanelVisible, setLeftPanelVisible] = useState(false);
  const [showChatDetails, setShowChatDetails] = useState(false);

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

  useEffect(() => {
    if (selectedConversation && isMobile) {
      setSidebarOpen(false);
    }
  }, [selectedConversation, isMobile]);

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
          <img src="/src/assets/logo.png" style={{ width: 36, height: 36, objectFit: "contain" }} alt="Orioneta" />
        </div>

        <NavDivider />

        <NavIcon
          active={true}
          onClick={() => {}}
          tooltip="Mensajes"
          icon={<MessageSquare size={20} />}
        />

        <NavIcon
          tooltip="Buscar"
          icon={<Search size={20} />}
        />

        <NavIcon
          tooltip="Notificaciones"
          icon={<Bell size={20} />}
        />

        <NavIcon
          tooltip="Configuración"
          icon={<Settings size={20} />}
          onClick={() => navigate("/settings")}
        />

        <div style={{ flex: 1 }} />

        <NavDivider />

        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: "white", fontWeight: 600, marginTop: 8 }}>
          P
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
          
          <Sidebar
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
        </>
      )}

      {/* ChatArea */}
      <ChatArea 
        conversation={selectedConversation} 
        isMobile={isMobile}
        showDetails={showChatDetails}
        onToggleDetails={() => setShowChatDetails(!showChatDetails)}
        onBack={() => {
          if (isMobile) {
            setSelectedConversation(null);
            setSidebarOpen(true);
          }
        }}
      />

      {/* ChatDetails */}
      {!isMobile && selectedConversation && showChatDetails && (
        <ChatDetails 
          conversation={selectedConversation}
          onClose={() => setShowChatDetails(false)}
        />
      )}
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