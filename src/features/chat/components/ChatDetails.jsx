import { useState } from "react";
import { MoreVertical, Phone, Video, Search, Bell, Pin, UserPlus, Settings, LogOut, Shield, Info } from "lucide-react";

export default function ChatDetails({ conversation, onClose }) {
  const [showMenu, setShowMenu] = useState(false);
  const isGroup = conversation?.isGroup;

  return (
    <div
      style={{
        width: 320,
        flexShrink: 0,
        background: "#13141c",
        borderLeft: "1px solid #1e2030",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #1e2030",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h3
          style={{
            color: "#c0caf5",
            fontSize: 16,
            fontWeight: 600,
            margin: 0,
          }}
        >
          {isGroup ? "Información del grupo" : "Información del contacto"}
        </h3>
        <button
          onClick={onClose}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#565f89",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {/* Avatar/Group Icon */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: isGroup ? 20 : "50%",
              background: isGroup
                ? "#1e2030"
                : "linear-gradient(135deg, #7c3aed, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: isGroup ? 36 : 32,
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            {isGroup ? "#" : conversation?.avatar}
          </div>
          <h2
            style={{
              color: "#c0caf5",
              fontSize: 18,
              fontWeight: 600,
              margin: "0 0 4px 0",
            }}
          >
            {conversation?.name}
          </h2>
          {!isGroup && (
            <p
              style={{
                color: conversation?.online ? "#22c55e" : "#565f89",
                fontSize: 13,
                margin: 0,
              }}
            >
              {conversation?.online ? "En línea" : "Desconectado"}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <button
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              background: "#1a1b26",
              border: "1px solid #1e2030",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "#c0caf5",
              fontSize: 13,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#252838";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#1a1b26";
            }}
          >
            <Phone size={16} />
            Llamar
          </button>
          <button
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              background: "#1a1b26",
              border: "1px solid #1e2030",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "#c0caf5",
              fontSize: 13,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#252838";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#1a1b26";
            }}
          >
            <Video size={16} />
            Videollamada
          </button>
        </div>

        {/* Search Messages */}
        <button
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 8,
            background: "#1a1b26",
            border: "1px solid #1e2030",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#c0caf5",
            fontSize: 14,
            marginBottom: 8,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#252838";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#1a1b26";
          }}
        >
          <Search size={18} />
          Buscar en la conversación
        </button>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "#1e2030",
            margin: "16px 0",
          }}
        />

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Option icon={<Bell size={18} />} label="Silenciar notificaciones" />
          <Option icon={<Pin size={18} />} label="Fijar conversación" />
          {!isGroup && <Option icon={<UserPlus size={18} />} label="Añadir a favoritos" />}
          {isGroup && <Option icon={<UserPlus size={18} />} label="Invitar miembros" />}
          <Option icon={<Shield size={18} />} label="Privacidad y seguridad" />
          <Option icon={<Info size={18} />} label="Información" />
          <Option icon={<Settings size={18} />} label="Configuración" />
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "#1e2030",
            margin: "16px 0",
          }}
        />

        {/* Danger Zone */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Option
            icon={<LogOut size={18} />}
            label={isGroup ? "Salir del grupo" : "Eliminar conversación"}
            danger
          />
        </div>

        {/* Group Members */}
        {isGroup && (
          <>
            <div
              style={{
                height: 1,
                background: "#1e2030",
                margin: "16px 0",
              }}
            />
            <h4
              style={{
                color: "#c0caf5",
                fontSize: 14,
                fontWeight: 600,
                margin: "0 0 12px 0",
              }}
            >
              Miembros ({conversation?.members || 0})
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <MemberItem name="OrionTheProgrammer" avatar="O" online />
              <MemberItem name="Flipper" avatar="F" online={false} />
              <MemberItem name="zBleend" avatar="Z" online />
              <MemberItem name="Panditax" avatar="P" online />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Option({ icon, label, danger = false }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: 8,
        background: hovered ? (danger ? "rgba(239, 68, 68, 0.1)" : "#252838") : "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        color: danger ? "#ef4444" : "#c0caf5",
        fontSize: 14,
        transition: "all 0.2s",
        textAlign: "left",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function MemberItem({ name, avatar, online }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 12px",
        borderRadius: 8,
        cursor: "pointer",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#252838";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <div style={{ position: "relative" }}>
        <div
          style={{
            width: 36,
            height: 36,
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
          {avatar}
        </div>
        {online && (
          <div
            style={{
              position: "absolute",
              bottom: 1,
              right: 1,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#22c55e",
              border: "2px solid #13141c",
            }}
          />
        )}
      </div>
      <span
        style={{
          color: "#c0caf5",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {name}
      </span>
    </div>
  );
}
