import { useMemo, useState } from "react";
import { Paperclip, Smile, Send, Phone, Video, Search, MessageSquare } from "lucide-react";
import { useCustomization } from "../../customization/hooks/useCustomization";
import { useChat } from "../hooks/useChat";

export default function ChatArea({ conversation, isMobile, onBack }) {
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const { messages, loading, sending, error, sendMessage } = useChat(conversation?.id);
  const conversationId = conversation?.backend ? conversation.id : null;
  const {
    userCustomization,
    conversationCustomization,
    visuals,
  } = useCustomization(conversationId);
  const compactMode = Boolean(userCustomization?.compactMode);
  const bubbleStyle = conversationCustomization?.bubbleStyle || "DEFAULT";
  const messageFontSize = conversationCustomization?.fontSize || 14;
  const messagePadding = compactMode ? "14px 16px" : "20px";
  const inputPadding = compactMode ? "10px 16px" : "16px 20px";
  const messageGap = compactMode ? 2 : 4;

  const visibleMessages = useMemo(() => {
    if (!messageSearch.trim()) {
      return messages;
    }

    const normalizedSearch = messageSearch.trim().toLowerCase();
    return messages.filter((item) => (
      item.content.toLowerCase().includes(normalizedSearch)
      || item.sender.toLowerCase().includes(normalizedSearch)
    ));
  }, [messageSearch, messages]);

  if (!conversation) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: visuals.chatBackground, fontFamily: visuals.fontFamily }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#13141c", border: "1px solid #1e2030", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <MessageSquare size={28} color="#565f89" strokeWidth={1.5} />
        </div>
        <p style={{ color: "#565f89", fontSize: 15, fontWeight: 500 }}>Selecciona una conversacion</p>
        <p style={{ color: "#2d2f45", fontSize: 13, marginTop: 4 }}>para empezar a chatear</p>
      </div>
    );
  }

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    try {
      await sendMessage(message);
      setMessage("");
      setNotice("");
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      setNotice("No se pudo enviar el mensaje");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showTemporaryNotice = (text) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const headerActions = [
    { icon: <Phone size={18} />, key: "phone", title: "Llamada", onClick: () => showTemporaryNotice("Las llamadas se activaran cuando realtime-service este integrado") },
    { icon: <Video size={18} />, key: "video", title: "Video", onClick: () => showTemporaryNotice("Las videollamadas quedaran para una siguiente iteracion") },
    { icon: <Search size={18} />, key: "search", title: "Buscar mensajes", onClick: () => setSearchOpen((current) => !current) },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: visuals.chatBackground, minWidth: 0, fontFamily: visuals.fontFamily }}>

      {/* Header */}
      <div style={{ padding: isMobile ? "0 16px 0 56px" : "0 20px", height: compactMode ? 54 : 60, flexShrink: 0, borderBottom: "1px solid #1e2030", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(13, 14, 20, 0.94)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isMobile && (
            <button
              onClick={onBack}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#c0caf5", padding: 4, marginRight: 4, display: "flex", alignItems: "center" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          )}
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: visuals.accentGradient, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 600 }}>
            {conversation.avatar || conversation.name[0]}
          </div>
          <div>
            <p style={{ color: "#c0caf5", fontSize: 14, fontWeight: 600, margin: 0 }}>{conversation.name}</p>
            <p style={{ color: "#22c55e", fontSize: 11, margin: 0 }}>
              {conversation.backend ? "Backend local" : conversation.online ? "En linea" : "Modo local"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {headerActions.map(({ icon, key, title, onClick }) => (
            <button
              key={key}
              type="button"
              title={title}
              onClick={onClick}
              style={{ width: 34, height: 34, borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#565f89" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1a1b26"; e.currentTarget.style.color = "#c0caf5"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#565f89"; }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {(searchOpen || notice || error) && (
        <div style={{ padding: searchOpen ? "10px 20px" : "8px 20px", borderBottom: "1px solid #1e2030", background: "rgba(13, 14, 20, 0.94)" }}>
          {searchOpen && (
            <div style={{ position: "relative" }}>
              <Search size={14} color="#565f89" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input
                autoFocus
                value={messageSearch}
                onChange={(event) => setMessageSearch(event.target.value)}
                placeholder="Buscar dentro de esta conversacion"
                style={{ width: "100%", padding: "9px 12px 9px 32px", background: "#13141c", border: "1px solid #1e2030", borderRadius: 10, color: "#c0caf5", fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          )}

          {(notice || error) && (
            <p style={{ color: error ? "#ef4444" : "#a78bfa", fontSize: 12, textAlign: "center", margin: searchOpen ? "8px 0 0" : 0 }}>
              {error || notice}
            </p>
          )}
        </div>
      )}

      {/* Mensajes */}
      <div style={{ flex: 1, overflowY: "auto", padding: messagePadding, display: "flex", flexDirection: "column", gap: messageGap }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
            <span style={{ color: "#565f89" }}>Cargando mensajes...</span>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
            <span style={{ color: "#565f89" }}>No hay mensajes aún</span>
          </div>
        ) : visibleMessages.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
            <span style={{ color: "#565f89" }}>No hay mensajes que coincidan</span>
          </div>
        ) : (
          visibleMessages.map(msg => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              visuals={visuals}
              bubbleStyle={bubbleStyle}
              compactMode={compactMode}
              fontSize={messageFontSize}
            />
          ))
        )}
      </div>

      {/* Input */}
      <div style={{ padding: inputPadding, borderTop: "1px solid #1e2030", background: "rgba(13, 14, 20, 0.94)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#13141c", border: "1px solid #1e2030", borderRadius: 16, padding: "10px 14px", transition: "border-color 0.2s" }}
             onFocus={(e) => e.currentTarget.style.borderColor = visuals.accent}
             onBlur={(e) => e.currentTarget.style.borderColor = "#1e2030"}
             tabIndex={-1}>

          <button
            type="button"
            onClick={() => showTemporaryNotice("Los archivos se conectaran cuando media-service este disponible")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#565f89", padding: "6px", borderRadius: 8, transition: "all 0.15s", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1a1b26"; e.currentTarget.style.color = visuals.accent; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#565f89"; }}
          >
            <Paperclip size={18} />
          </button>

          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Escribe un mensaje a ${conversation.name}...`}
            rows={1}
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#c0caf5", fontSize: messageFontSize, resize: "none", fontFamily: visuals.fontFamily, lineHeight: 1.5, maxHeight: 100, overflowY: "auto", padding: "4px 0" }}
          />

          <button
            type="button"
            onClick={() => showTemporaryNotice("Selector de emojis pendiente para la siguiente mejora visual")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#565f89", padding: "6px", borderRadius: 8, transition: "all 0.15s", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1a1b26"; e.currentTarget.style.color = visuals.accent; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#565f89"; }}
          >
            <Smile size={18} />
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !message.trim()}
            title={sending ? "Enviando..." : "Enviar mensaje"}
            style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: message.trim() && !sending ? visuals.accentGradient : "#1e2030", border: "none", cursor: message.trim() && !sending ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", color: message.trim() && !sending ? "white" : "#565f89", transition: "all 0.2s", boxShadow: message.trim() && !sending ? `0 4px 12px ${visuals.accent}40` : "none" }}
            onMouseEnter={e => { if (message.trim() && !sending) e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <Send size={16} />
          </button>
        </div>
        <p style={{ color: "#2d2f45", fontSize: 11, textAlign: "center", marginTop: 8 }}>
          Enter para enviar • Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ msg, visuals, bubbleStyle, compactMode, fontSize }) {
  const radius = getBubbleRadius(bubbleStyle, msg.mine);
  const padding = getBubblePadding(bubbleStyle, compactMode);

  return (
    <div style={{ display: "flex", flexDirection: msg.mine ? "row-reverse" : "row", alignItems: "flex-end", gap: compactMode ? 6 : 8, marginBottom: compactMode ? 2 : 4 }}>
      {!msg.mine && (
        <div style={{ width: compactMode ? 24 : 28, height: compactMode ? 24 : 28, borderRadius: "50%", flexShrink: 0, background: visuals.accentGradient, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 600 }}>
          {msg.sender[0]}
        </div>
      )}
      <div style={{ maxWidth: compactMode ? "72%" : "65%", background: msg.mine ? visuals.accent : visuals.incomingBubble, borderRadius: radius, padding, border: msg.mine || bubbleStyle === "MINIMAL" ? "none" : "1px solid #1e2030" }}>
        {!msg.mine && (
          <p style={{ color: visuals.accent, fontSize: 11, fontWeight: 600, marginBottom: compactMode ? 2 : 4 }}>{msg.sender}</p>
        )}
        <p style={{ color: msg.mine ? "white" : "#c0caf5", fontSize, lineHeight: 1.4, margin: 0 }}>{msg.content}</p>
        <p style={{ color: msg.mine ? "rgba(255,255,255,0.58)" : "#565f89", fontSize: 10, textAlign: "right", marginTop: compactMode ? 3 : 4, marginBottom: 0 }}>{msg.time}</p>
      </div>
    </div>
  );
}

function getBubbleRadius(style, mine) {
  if (style === "COMPACT") {
    return mine ? "12px 12px 4px 12px" : "12px 12px 12px 4px";
  }

  if (style === "ROUNDED") {
    return "22px";
  }

  if (style === "MINIMAL") {
    return 8;
  }

  return mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px";
}

function getBubblePadding(style, compactMode) {
  if (style === "COMPACT" || compactMode) {
    return "7px 11px";
  }

  if (style === "MINIMAL") {
    return "8px 0";
  }

  return "10px 14px";
}
