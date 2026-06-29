import { useState } from "react";
import { Settings, LogOut, Edit2, Check, X } from "lucide-react";
import ProfileBadges from "./ProfileBadges";
import { resolveProfilePhoto } from "../../../services/profilePhotoService";

const STATUS_OPTIONS = [
  { value: "online", label: "En línea", color: "#22c55e" },
  { value: "idle", label: "Ausente", color: "#f59e0b" },
  { value: "dnd", label: "No molestar", color: "#ef4444" },
  { value: "offline", label: "Invisible", color: "#565f89" },
];

export default function UserProfile({ profile, onUpdateStatus, onOpenSettings }) {
  const [isEditing, setIsEditing] = useState(false);
  const [customActivity, setCustomActivity] = useState(profile?.activity || "");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleStatusChange = async (status) => {
    try {
      await onUpdateStatus(status, customActivity);
      setShowStatusMenu(false);
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  const handleSaveActivity = async () => {
    try {
      await onUpdateStatus(profile?.status || "online", customActivity);
      setIsEditing(false);
    } catch (err) {
      console.error("Error al actualizar actividad:", err);
    }
  };

  if (!profile) return null;

  const currentStatus = STATUS_OPTIONS.find(s => s.value === profile.status) || STATUS_OPTIONS[0];

  return (
    <div style={{ padding: "16px", borderBottom: "1px solid #1e2030" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Avatar */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 20,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {(() => {
            const photoSrc = resolveProfilePhoto(profile.profilePhoto);
            if (photoSrc) {
              return <img src={photoSrc} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />;
            }
            return profile.avatar;
          })()}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ color: "#c0caf5", fontSize: 15, fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profile.name}
            </span>
            <ProfileBadges badges={profile.badges} compact max={2} />
          </div>
          <p style={{ color: "#565f89", fontSize: 11, margin: "0 0 4px" }}>
            @{profile.userName || "usuario"}
          </p>

          {/* Status */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: currentStatus.color,
                }}
              />
              <span style={{ color: "#565f89", fontSize: 12 }}>
                {profile.activity || currentStatus.label}
              </span>
            </button>

            {/* Status Menu */}
            {showStatusMenu && (
              <>
                <div
                  onClick={() => setShowStatusMenu(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 998,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: 8,
                    background: "#13141c",
                    border: "1px solid #1e2030",
                    borderRadius: 8,
                    padding: "8px",
                    zIndex: 999,
                    minWidth: 160,
                  }}
                >
                  {STATUS_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                        padding: "8px",
                        background: "none",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#1a1b26"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: option.color,
                        }}
                      />
                      <span style={{ color: "#c0caf5", fontSize: 13 }}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 4 }}>
          <button
            type="button"
            title="Configuracion de perfil"
            onClick={() => {
              if (onOpenSettings) {
                onOpenSettings();
                return;
              }

              setShowSettings((current) => !current);
            }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#565f89",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#1a1b26"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <Settings size={16} />
          </button>
          <button
            type="button"
            title="Cerrar sesion desde la barra lateral"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#565f89",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#1a1b26"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div style={{ marginTop: 12, padding: 12, background: "#10111a", border: "1px solid #1e2030", borderRadius: 10 }}>
          <p style={{ color: "#c0caf5", fontSize: 13, fontWeight: 600, margin: "0 0 8px" }}>
            Configuracion rapida
          </p>
          <ProfileSetting label="Friend code" value={profile.friendCode || "No disponible"} />
          <ProfileSetting label="Email" value={profile.email || "No disponible"} />
          <p style={{ color: "#565f89", fontSize: 11, margin: "8px 0 0" }}>
            Comparte tu friend code para que puedan encontrarte sin exponer datos innecesarios.
          </p>
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <p style={{ color: "#565f89", fontSize: 12, margin: "12px 0 0 0", lineHeight: 1.4 }}>
          {profile.bio}
        </p>
      )}

      {/* Custom Activity */}
      <div style={{ marginTop: 12 }}>
        {isEditing ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              value={customActivity}
              onChange={(e) => setCustomActivity(e.target.value)}
              placeholder="¿Qué estás haciendo?"
              style={{
                flex: 1,
                padding: "6px 10px",
                background: "#1a1b26",
                border: "1px solid #1e2030",
                borderRadius: 6,
                color: "#c0caf5",
                fontSize: 12,
                outline: "none",
                boxSizing: "border-box",
              }}
              autoFocus
            />
            <button
              onClick={handleSaveActivity}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "#22c55e",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setCustomActivity(profile.activity || "");
              }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "#ef4444",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <Edit2 size={12} style={{ color: "#565f89" }} />
            <span style={{ color: "#565f89", fontSize: 11 }}>
              {customActivity || "Añadir actividad"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function ProfileSetting({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 6 }}>
      <span style={{ color: "#565f89", fontSize: 11 }}>{label}</span>
      <span style={{ color: "#a78bfa", fontSize: 11, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}
