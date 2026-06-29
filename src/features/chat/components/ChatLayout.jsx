import {
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Store,
  Users,
  X,
  Palette,
} from "lucide-react";
import ChatDetails from "./ChatDetails";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoImage from "../../../assets/logo.png";
import {
  clearSession,
  getSession,
  getSessionIdentity,
  subscribeToSessionChanges,
} from "../../auth/session";
import NetaMarketPanel from "../../customization/components/NetaMarketPanel";
import { useRealtimeConnection } from "../../realtime/hooks/useRealtimeConnection";
import SettingsPanel from "../../settings/components/SettingsPanel";
import FriendshipPanel from "../../status/components/FriendshipPanel";
import { chatService } from "../services/chatService";
import { findUserById } from "../../../services/userService";
import ChatArea from "./ChatArea";
import ChatUtilityPanel from "./ChatUtilityPanel";
import Sidebar from "./Sidebar";
import { resolveProfilePhoto } from "../../../services/profilePhotoService";
import { NotificationBell, NotificationPanel, NotificationToast, useNotifications } from "../../notifications";

export default function ChatLayout() {
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [activeSection, setActiveSection] = useState("chats");
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [layoutNotice, setLayoutNotice] = useState("");
  const [session, setSession] = useState(() => getSession());
  const chatAreaRef = useRef(null);

  useRealtimeConnection();

  const {
    notifications: allNotifications,
    unreadCount,
    loading: notifLoading,
    error: notifError,
    markAsRead,
    removeNotification,
    markAllAsRead,
    formatTime,
  } = useNotifications();

  const sessionIdentity = getSessionIdentity(session);
  const sessionIdentityRef = useRef(sessionIdentity);
  const sessionProfile = session?.profile;

  const userDisplayName =
    sessionProfile?.displayName ||
    sessionProfile?.userName ||
    sessionProfile?.username ||
    sessionProfile?.email ||
    session?.email ||
    "Orioneta";

  const userInitial = userDisplayName.trim().charAt(0).toUpperCase() || "O";
  const userProfilePhoto =
    resolveProfilePhoto(sessionProfile?.profilePhoto) || sessionProfile?.avatarUrl || "";

  const panelVisible = isMobile ? sidebarOpen : !leftPanelCollapsed;

  const panelWidth =
    activeSection === "settings"
      ? 720
      : activeSection === "neta-market"
        ? 360
        : 280;

  const panelStyle = {
    position: isMobile ? "fixed" : "relative",
    left: isMobile ? 0 : "auto",
    top: isMobile ? 0 : "auto",
    height: isMobile ? "100vh" : "auto",
    zIndex: isMobile ? 999 : "auto",
    width: isMobile ? "100%" : panelVisible ? `${panelWidth}px` : "0px",
    opacity: panelVisible ? 1 : 0,
    transform: isMobile
      ? panelVisible
        ? "translateX(0)"
        : "translateX(-100%)"
      : "none",
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

  useEffect(
    () =>
      subscribeToSessionChanges((nextSession) => {
        const nextIdentity = getSessionIdentity(nextSession);

        if (nextIdentity !== sessionIdentityRef.current) {
          sessionIdentityRef.current = nextIdentity;
          setSelectedConversation(null);
          setActiveSection("chats");
          setSidebarOpen(false);
        }

        setSession(nextSession);

        if (!nextSession) {
          navigate("/login", { replace: true });
        }
      }),
    [navigate],
  );

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

  const handleSelectConversation = (conversation) => {
    if (typeof conversation === "string" || typeof conversation === "number") {
      navigate(`/chat?conversation=${conversation}`);
      return;
    }
    setSelectedConversation(conversation);
    setActiveSection("chats");

    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);
  const [messageSearchOpen, setMessageSearchOpen] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [sideProfile, setSideProfile] = useState(null);

  const currentUserId =
    sessionProfile?.id ||
    sessionProfile?.userId ||
    sessionProfile?.userID ||
    session?.userId ||
    null;

  useEffect(() => {
    setMessageSearchOpen(false);
    setMessageSearchQuery("");
    setSideProfile(null);
  }, [selectedConversation?.id]);

  useEffect(() => {
    if (!selectedConversation?.id) {
      return undefined;
    }

    return chatService.subscribe(() => {
      void chatService.getDirectMessages().then((conversations) => {
        const refreshed = conversations.find(
          (item) => item.id === selectedConversation.id,
        );

        if (refreshed) {
          setSelectedConversation((current) => (
            current?.id === refreshed.id ? { ...current, ...refreshed } : current
          ));
        }
      });
    });
  }, [selectedConversation?.id]);

  const handleToggleDetails = () => {
    setDetailsPanelOpen((prev) => !prev);
  };

  const handleOpenMessageSearch = (query = "") => {
    setMessageSearchOpen(true);
    setMessageSearchQuery(query);
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation?.id) {
      return;
    }

    try {
      await chatService.deleteConversation(selectedConversation.id, {
        isGroup: Boolean(selectedConversation.isGroup),
      });
      setSelectedConversation(null);
      setDetailsPanelOpen(false);
      setLayoutNotice("");
    } catch (error) {
      setLayoutNotice(error?.message || "No se pudo eliminar la conversación");
      window.setTimeout(() => setLayoutNotice(""), 3200);
    }
  };

  const handleConversationUpdate = async (updates) => {
    if (!selectedConversation?.id) {
      return null;
    }

    const updated = await chatService.updateConversation(
      selectedConversation.id,
      updates,
    );

    setSelectedConversation((current) => ({
      ...current,
      ...updated,
      ...(updates.avatarPhoto ? { avatarPhoto: updates.avatarPhoto, avatarUrl: updates.avatarPhoto } : {}),
      ...(updates.name ? { avatar: updates.name.trim().charAt(0).toUpperCase() } : {}),
    }));

    return updated;
  };

  const handleFriendConversation = async (friendConversation) => {
    try {
      const conversation =
        await chatService.upsertDirectConversation(friendConversation);

      setSelectedConversation(conversation);
      setActiveSection("chats");
      setLayoutNotice("");

      if (isMobile) {
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error("No se pudo abrir el chat con el amigo:", error);
      setLayoutNotice(error?.message || "No se pudo abrir el chat con este amigo");
      window.setTimeout(() => setLayoutNotice(""), 3200);
    }
  };

  const handleToastNotificationClick = (notification) => {
    if (notification.type === "MESSAGE_SENT" && notification.conversationId) {
      navigate(`/chat?conversation=${notification.conversationId}`);
      return;
    }

    if (notification.senderId) {
      findUserById(notification.senderId)
        .then((profile) => {
          if (profile) {
            handleFriendConversation({
              id: profile.userId || profile.id || notification.senderId,
              friendId: profile.userId || profile.id || notification.senderId,
              name: profile.displayName || profile.userName || notification.senderName || "Usuario",
              avatar: (profile.displayName || profile.userName || "?").trim().charAt(0).toUpperCase(),
              avatarPhoto: profile.profilePhoto || profile.avatarUrl || notification.senderAvatar || "",
              lastMessage: "",
              time: "",
              unread: 0,
              online: false,
            });
          }
        })
        .catch(() => {
          if (notification.conversationId) {
            navigate(`/chat?conversation=${notification.conversationId}`);
          }
        });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#0d0e14",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {layoutNotice && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 1200,
            maxWidth: 320,
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(239, 68, 68, 0.13)",
            border: "1px solid rgba(239, 68, 68, 0.28)",
            color: "#fecaca",
            fontSize: 12,
            boxShadow: "0 18px 36px rgba(0,0,0,0.28)",
          }}
        >
          {layoutNotice}
        </div>
      )}

      <NotificationToast onNotificationClick={handleToastNotificationClick} />

      {isMobile && (
        <button
          type="button"
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
          transition:
            "width 0.2s cubic-bezier(0.4, 0, 0.2, 1), padding 0.2s ease, border-color 0.2s ease",
          overflow: "hidden",
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <img
            src={logoImage}
            style={{
              width: 36,
              height: 36,
              objectFit: "contain",
            }}
            alt="Orioneta"
          />
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

        <NotificationBell
          unreadCount={unreadCount}
          active={activeSection === "notifications"}
          onClick={() => handleSectionChange("notifications")}
        />

        <div style={{ flex: 1 }} />

        <NavIcon
          active={activeSection === "neta-market"}
          onClick={() => handleSectionChange("neta-market")}
          tooltip="Mercado"
          icon={<Store size={20} />}
        />

        <NavIcon
          active={activeSection === "studio"}
          onClick={() => navigate("/studio")}
          tooltip="Neta Studio"
          icon={<Palette size={20} />}
        />

        <NavIcon
          active={activeSection === "settings"}
          onClick={() => handleSectionChange("settings")}
          tooltip="Configuracion"
          icon={<Settings size={20} />}
        />

        <NavIcon
          tooltip="Cerrar sesion"
          onClick={handleLogout}
          icon={<LogOut size={19} />}
        />

        <NavDivider />

        <div
          title={userDisplayName || "Sesion de Orioneta"}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            overflow: "hidden",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "white",
            fontWeight: 600,
            marginTop: 8,
          }}
        >
          {userProfilePhoto ? (
            <img
              src={userProfilePhoto}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            userInitial
          )}
        </div>
      </nav>

      {(!isMobile || sidebarOpen) && (
        <>
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
              key={`friends-${sessionIdentity}`}
              onFriendClick={handleFriendConversation}
              onOpenSettings={() => handleSectionChange("settings")}
              style={panelStyle}
            />
          ) : activeSection === "settings" ? (
            <SettingsPanel
              key={`settings-${sessionIdentity}`}
              selectedConversation={selectedConversation}
              onLogout={handleLogout}
              style={panelStyle}
            />
          ) : activeSection === "neta-market" ? (
            <div style={{ display: "flex", flexDirection: "column", ...panelStyle }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid #1e2030", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "#565f89", fontSize: 11 }}>Acceso rápido</span>
                <button
                  onClick={() => navigate("/market")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    background: "#7c3aed",
                    border: "none",
                    cursor: "pointer",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  Mercado completo
                </button>
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <NetaMarketPanel
                  key={`neta-market-${sessionIdentity}-${selectedConversation?.id || "none"}`}
                  selectedConversation={selectedConversation}
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              </div>
            </div>
          ) : activeSection === "search" ? (
            <ChatUtilityPanel
              key={`${activeSection}-${sessionIdentity}`}
              mode={activeSection}
              onSelectConversation={handleSelectConversation}
              style={panelStyle}
            />
          ) : activeSection === "notifications" ? (
            <NotificationPanel
              key={`notifications-${sessionIdentity}`}
              notifications={allNotifications}
              unreadCount={unreadCount}
              loading={notifLoading}
              error={notifError}
              onMarkAsRead={markAsRead}
              onRemoveNotification={removeNotification}
              onMarkAllAsRead={markAllAsRead}
              formatTime={formatTime}
              onNavigateToChat={handleSelectConversation}
              style={panelStyle}
            />
          ) : (
            <Sidebar
              key={`sidebar-${sessionIdentity}`}
              activeSection={activeSection}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              style={panelStyle}
            />
          )}
        </>
      )}

      <ChatArea
        ref={chatAreaRef}
        key={`${sessionIdentity}-${selectedConversation?.id || "empty-chat"}`}
        conversation={selectedConversation}
        isMobile={isMobile}
        detailsOpen={detailsPanelOpen}
        onToggleDetails={handleToggleDetails}
        messageSearchOpen={messageSearchOpen}
        onMessageSearchOpenChange={setMessageSearchOpen}
        messageSearchQuery={messageSearchQuery}
        onMessageSearchQueryChange={setMessageSearchQuery}
        sideProfile={sideProfile}
        onOpenSideProfile={setSideProfile}
        onCloseSideProfile={() => setSideProfile(null)}
        onFriendConversation={handleFriendConversation}
        onBack={() => {
          if (isMobile) {
            setSelectedConversation(null);
            setSidebarOpen(true);
          }
        }}
      />

      {detailsPanelOpen && selectedConversation && (
        <ChatDetails
          conversation={selectedConversation}
          currentUserId={currentUserId}
          currentUserProfile={sessionProfile}
          onClose={() => setDetailsPanelOpen(false)}
          onCall={() => {
            if (chatAreaRef.current?.startCall) {
              chatAreaRef.current.startCall("audio");
            }
          }}
          onVideoCall={() => {
            if (chatAreaRef.current?.startCall) {
              chatAreaRef.current.startCall("video");
            }
          }}
          onScreenShare={() => {
            if (chatAreaRef.current?.startCall) {
              chatAreaRef.current.startCall("screen");
            }
          }}
          onOpenMessageSearch={handleOpenMessageSearch}
          onOpenMemberProfile={setSideProfile}
          onMute={() => {}}
          onPin={() => {}}
          onAddFavorite={() => {}}
          onDeleteConversation={handleDeleteConversation}
          onConversationUpdate={handleConversationUpdate}
          onMemberAdded={() => {
            void chatService.getDirectMessages().then((conversations) => {
              const refreshed = conversations.find(
                (item) => item.id === selectedConversation.id,
              );

              if (refreshed) {
                setSelectedConversation(refreshed);
              }
            });
          }}
        />
      )}
    </div>
  );
}

function NavIcon({ icon, active, onClick, tooltip }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={tooltip}
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: active ? "#7c3aed" : hovered ? "#1a1b26" : "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: active ? "white" : hovered ? "#c0caf5" : "#565f89",
        transition: "all 0.15s",
      }}
    >
      {icon}
    </button>
  );
}

function NavDivider() {
  return (
    <div
      style={{
        width: 32,
        height: 1,
        background: "#1e2030",
        margin: "4px 0",
      }}
    />
  );
}
