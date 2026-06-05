import { useState } from "react";
import { Paperclip, Smile, Send, Phone, Video, Search, MessageSquare } from "lucide-react";


// Testeando frontend con mensajes mockeados, luego se conectará con el backend
const MOCK_MESSAGES = [
  { id: 1, sender: "OrionTheProgrammer", content: "Oye ya terminaste el conversation-service?", time: "12:20", mine: false },
  { id: 2, sender: "Tu", content: "Casi, me falta la infraestructura", time: "12:21", mine: true },
  { id: 3, sender: "OrionTheProgrammer", content: "Dale, yo voy con el user-service", time: "12:22", mine: false },
  { id: 4, sender: "Tu", content: "Ok perfecto, lo vemos mañana entonces", time: "12:34", mine: true },
];

export default function ChatArea({ conversation }) {
  const [message, setMessage] = useState("");

  if (!conversation) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0d0e14" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#13141c", border: "1px solid #1e2030", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <MessageSquare size={28} color="#565f89" strokeWidth={1.5} />
        </div>
        <p style={{ color: "#565f89", fontSize: 15, fontWeight: 500 }}>Selecciona una conversacion</p>
        <p style={{ color: "#2d2f45", fontSize: 13, marginTop: 4 }}>para empezar a chatear</p>
      </div>
    );
  }

  const handleSend = () => {
    if (!message.trim()) return;
    console.log("Enviar:", message);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const headerActions = [
    { icon: <Phone size={18} />, key: "phone" },
    { icon: <Video size={18} />, key: "video" },
    { icon: <Search size={18} />, key: "search" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0d0e14", minWidth: 0 }}>

      {/* Header */}
      <div style={{ padding: "0 20px", height: 60, flexShrink: 0, borderBottom: "1px solid #1e2030", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d0e14" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 600 }}>
            {conversation.avatar || conversation.name[0]}
          </div>
          <div>
            <p style={{ color: "#c0caf5", fontSize: 14, fontWeight: 600, margin: 0 }}>{conversation.name}</p>
            <p style={{ color: "#22c55e", fontSize: 11, margin: 0 }}>
              {conversation.online ? "En linea" : "Desconectado"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {headerActions.map(({ icon, key }) => (
            <button
              key={key}
              style={{ width: 34, height: 34, borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#565f89" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1a1b26"; e.currentTarget.style.color = "#c0caf5"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#565f89"; }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Mensajes */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 4 }}>
        {MOCK_MESSAGES.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #1e2030" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, background: "#13141c", border: "1px solid #1e2030", borderRadius: 14, padding: "8px 8px 8px 16px" }}>

          <button
            style={{ background: "none", border: "none", cursor: "pointer", color: "#565f89", padding: "4px", flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = "#a78bfa"}
            onMouseLeave={e => e.currentTarget.style.color = "#565f89"}
          >
            <Paperclip size={18} />
          </button>

          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Mensaje a ${conversation.name}...`}
            rows={1}
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#c0caf5", fontSize: 14, resize: "none", fontFamily: "system-ui, sans-serif", lineHeight: 1.5, maxHeight: 120, overflowY: "auto" }}
          />

          <button
            style={{ background: "none", border: "none", cursor: "pointer", color: "#565f89", padding: "4px", flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = "#a78bfa"}
            onMouseLeave={e => e.currentTarget.style.color = "#565f89"}
          >
            <Smile size={18} />
          </button>

          <button
            onClick={handleSend}
            style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: message.trim() ? "#7c3aed" : "#1e2030", border: "none", cursor: message.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", color: message.trim() ? "white" : "#565f89", transition: "all 0.15s" }}
          >
            <Send size={15} />
          </button>
        </div>
        <p style={{ color: "#2d2f45", fontSize: 11, textAlign: "center", marginTop: 6 }}>
          Enter para enviar, Shift+Enter para nueva linea
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ msg }) {
  return (
    <div style={{ display: "flex", flexDirection: msg.mine ? "row-reverse" : "row", alignItems: "flex-end", gap: 8, marginBottom: 4 }}>
      {!msg.mine && (
        <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 600 }}>
          {msg.sender[0]}
        </div>
      )}
      <div style={{ maxWidth: "65%", background: msg.mine ? "#7c3aed" : "#1a1b26", borderRadius: msg.mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 14px", border: msg.mine ? "none" : "1px solid #1e2030" }}>
        {!msg.mine && (
          <p style={{ color: "#a78bfa", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{msg.sender}</p>
        )}
        <p style={{ color: msg.mine ? "white" : "#c0caf5", fontSize: 14, lineHeight: 1.4, margin: 0 }}>{msg.content}</p>
        <p style={{ color: msg.mine ? "rgba(255,255,255,0.5)" : "#565f89", fontSize: 10, textAlign: "right", marginTop: 4, marginBottom: 0 }}>{msg.time}</p>
      </div>
    </div>
  );
}