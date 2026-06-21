import { useState } from "react";
import { User, Shield, Bell, Palette, Lock, ChevronRight, Save, LogOut, Trash2, Globe, Clock, CheckCircle, XCircle } from "lucide-react";
import { useSettings } from "../hooks/useSettings";

export default function SettingsPage() {
  const { settings, loading } = useSettings();
  const [activeSection, setActiveSection] = useState("profile");
  const [saveMessage, setSaveMessage] = useState(null);

  const handleSave = () => {
    setSaveMessage({ type: "success", message: "Cambios guardados correctamente" });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0d0e14" }}>
        <span style={{ color: "#565f89", fontSize: 14 }}>Cargando configuración...</span>
      </div>
    );
  }

  const sections = [
    { id: "profile", label: "Perfil", icon: <User size={20} /> },
    { id: "account", label: "Cuenta", icon: <Globe size={20} /> },
    { id: "privacy", label: "Privacidad", icon: <Shield size={20} /> },
    { id: "notifications", label: "Notificaciones", icon: <Bell size={20} /> },
    { id: "appearance", label: "Apariencia", icon: <Palette size={20} /> },
    { id: "security", label: "Seguridad", icon: <Lock size={20} /> },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d0e14" }}>
      {/* Sidebar */}
      <div style={{ width: 280, flexShrink: 0, background: "#13141c", borderRight: "1px solid #1e2030", padding: "20px 0" }}>
        <h2 style={{ color: "#c0caf5", fontSize: 18, fontWeight: 600, margin: "0 0 20px 20px" }}>Configuración</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                width: "100%",
                padding: "12px 20px",
                background: activeSection === section.id ? "#1a1b26" : "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: activeSection === section.id ? "#7c3aed" : "#c0caf5",
                fontSize: 14,
                transition: "all 0.2s",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.background = "#161720";
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {section.icon}
              {section.label}
              <ChevronRight size={16} style={{ marginLeft: "auto", opacity: 0.5 }} />
            </button>
          ))}
        </div>

        <div style={{ marginTop: "auto", padding: "20px", borderTop: "1px solid #1e2030" }}>
          <button
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 8,
              background: "transparent",
              border: "1px solid #ef4444",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "#ef4444",
              fontSize: 14,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "40px" }}>
        {saveMessage && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              background: saveMessage.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${saveMessage.type === "success" ? "#22c55e" : "#ef4444"}`,
              color: saveMessage.type === "success" ? "#22c55e" : "#ef4444",
              fontSize: 14,
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {saveMessage.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
            {saveMessage.message}
          </div>
        )}

        {activeSection === "profile" && <ProfileSection settings={settings} onSave={handleSave} />}
        {activeSection === "account" && <AccountSection />}
        {activeSection === "privacy" && <PrivacySection />}
        {activeSection === "notifications" && <NotificationsSection />}
        {activeSection === "appearance" && <AppearanceSection />}
        {activeSection === "security" && <SecuritySection onSave={handleSave} />}
      </div>
    </div>
  );
}

function ProfileSection({ settings, onSave }) {
  const [formData, setFormData] = useState(settings?.profile || {});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h1 style={{ color: "#c0caf5", fontSize: 24, fontWeight: 600, margin: "0 0 8px 0" }}>Perfil</h1>
      <p style={{ color: "#565f89", fontSize: 14, margin: "0 0 32px 0" }}>Personaliza tu perfil público</p>

      <div style={{ background: "#13141c", borderRadius: 12, padding: "24px", border: "1px solid #1e2030" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 32, fontWeight: 600 }}>
            {formData?.avatar || "P"}
          </div>
          <div>
            <button style={{ padding: "8px 16px", borderRadius: 6, background: "#7c3aed", border: "none", cursor: "pointer", color: "white", fontSize: 13, fontWeight: 500 }}>
              Cambiar avatar
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div>
            <label style={{ display: "block", color: "#c0caf5", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Nombre de usuario</label>
            <input
              name="username"
              value={formData?.username || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#1a1b26",
                border: "1px solid #1e2030",
                borderRadius: 8,
                color: "#c0caf5",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#c0caf5", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Email</label>
            <input
              name="email"
              value={formData?.email || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#1a1b26",
                border: "1px solid #1e2030",
                borderRadius: 8,
                color: "#c0caf5",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", color: "#c0caf5", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Bio</label>
          <textarea
            name="bio"
            value={formData?.bio || ""}
            onChange={handleChange}
            rows={3}
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "#1a1b26",
              border: "1px solid #1e2030",
              borderRadius: 8,
              color: "#c0caf5",
              fontSize: 14,
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", color: "#c0caf5", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Estado personalizado</label>
          <input
            name="customStatus"
            value={formData?.customStatus || ""}
            onChange={handleChange}
            placeholder="¿Qué estás haciendo?"
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "#1a1b26",
              border: "1px solid #1e2030",
              borderRadius: 8,
              color: "#c0caf5",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        <button
          onClick={() => onSave("profile")}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            background: "#7c3aed",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontSize: 14,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Save size={16} />
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

function AccountSection() {
  return (
    <div>
      <h1 style={{ color: "#c0caf5", fontSize: 24, fontWeight: 600, margin: "0 0 8px 0" }}>Cuenta</h1>
      <p style={{ color: "#565f89", fontSize: 14, margin: "0 0 32px 0" }}>Configuración de tu cuenta</p>

      <div style={{ background: "#13141c", borderRadius: 12, padding: "24px", border: "1px solid #1e2030" }}>
        <SettingItem label="Idioma" value="Español" />
        <SettingItem label="Zona horaria" value="America/Mexico_City" icon={<Clock size={16} />} />
        <SettingItem label="Verificación de email" value="Verificado" verified />
        <SettingItem label="Autenticación de dos factores" value="Desactivado" />
      </div>
    </div>
  );
}

function PrivacySection() {
  return (
    <div>
      <h1 style={{ color: "#c0caf5", fontSize: 24, fontWeight: 600, margin: "0 0 8px 0" }}>Privacidad</h1>
      <p style={{ color: "#565f89", fontSize: 14, margin: "0 0 32px 0" }}>Controla quién puede ver tu información</p>

      <div style={{ background: "#13141c", borderRadius: 12, padding: "24px", border: "1px solid #1e2030" }}>
        <ToggleSetting label="Visibilidad del perfil" description="Quién puede ver tu perfil" />
        <ToggleSetting label="Solicitudes de mensaje" description="Quién puede enviarte mensajes" />
        <ToggleSetting label="Mostrar estado en línea" description="Permite que otros vean cuando estás en línea" />
        <ToggleSetting label="Confirmación de lectura" description="Muestra cuando has leído un mensaje" />
      </div>
    </div>
  );
}

function NotificationsSection() {
  return (
    <div>
      <h1 style={{ color: "#c0caf5", fontSize: 24, fontWeight: 600, margin: "0 0 8px 0" }}>Notificaciones</h1>
      <p style={{ color: "#565f89", fontSize: 14, margin: "0 0 32px 0" }}>Configura tus preferencias de notificación</p>

      <div style={{ background: "#13141c", borderRadius: 12, padding: "24px", border: "1px solid #1e2030" }}>
        <ToggleSetting label="Notificaciones de escritorio" description="Recibe notificaciones en tu escritorio" />
        <ToggleSetting label="Sonidos" description="Reproduce sonidos de notificación" />
        <ToggleSetting label="Menciones" description="Notificaciones cuando te mencionan" />
        <ToggleSetting label="Mensajes directos" description="Notificaciones de mensajes privados" />
        <ToggleSetting label="Grupos" description="Notificaciones de grupos" />
      </div>
    </div>
  );
}

function AppearanceSection() {
  return (
    <div>
      <h1 style={{ color: "#c0caf5", fontSize: 24, fontWeight: 600, margin: "0 0 8px 0" }}>Apariencia</h1>
      <p style={{ color: "#565f89", fontSize: 14, margin: "0 0 32px 0" }}>Personaliza la apariencia de la aplicación</p>

      <div style={{ background: "#13141c", borderRadius: 12, padding: "24px", border: "1px solid #1e2030" }}>
        <SelectSetting label="Tema" options={["Oscuro", "Claro", "Automático"]} />
        <SelectSetting label="Tamaño de fuente" options={["Pequeño", "Mediano", "Grande"]} />
        <SelectSetting label="Densidad del chat" options={["Compacto", "Cómodo", "Espaciado"]} />
        <SelectSetting label="Comportamiento del sidebar" options={["Siempre visible", "Auto-ocultar", "Manual"]} />
      </div>
    </div>
  );
}

function SecuritySection({ onSave }) {
  return (
    <div>
      <h1 style={{ color: "#c0caf5", fontSize: 24, fontWeight: 600, margin: "0 0 8px 0" }}>Seguridad</h1>
      <p style={{ color: "#565f89", fontSize: 14, margin: "0 0 32px 0" }}>Protege tu cuenta</p>

      <div style={{ background: "#13141c", borderRadius: 12, padding: "24px", border: "1px solid #1e2030", marginBottom: 20 }}>
        <h3 style={{ color: "#c0caf5", fontSize: 16, fontWeight: 600, margin: "0 0 16px 0" }}>Cambiar contraseña</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", color: "#c0caf5", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Contraseña actual</label>
            <input
              type="password"
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#1a1b26",
                border: "1px solid #1e2030",
                borderRadius: 8,
                color: "#c0caf5",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#c0caf5", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Nueva contraseña</label>
            <input
              type="password"
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#1a1b26",
                border: "1px solid #1e2030",
                borderRadius: 8,
                color: "#c0caf5",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#c0caf5", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Confirmar nueva contraseña</label>
            <input
              type="password"
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#1a1b26",
                border: "1px solid #1e2030",
                borderRadius: 8,
                color: "#c0caf5",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
          <button
            onClick={() => onSave("security")}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              background: "#7c3aed",
              border: "none",
              cursor: "pointer",
              color: "white",
              fontSize: 14,
              fontWeight: 500,
              alignSelf: "flex-start",
            }}
          >
            Cambiar contraseña
          </button>
        </div>
      </div>

      <div style={{ background: "rgba(239, 68, 68, 0.1)", borderRadius: 12, padding: "24px", border: "1px solid #ef4444" }}>
        <h3 style={{ color: "#ef4444", fontSize: 16, fontWeight: 600, margin: "0 0 8px 0" }}>Zona de peligro</h3>
        <p style={{ color: "#ef4444", fontSize: 13, margin: "0 0 16px 0" }}>Esta acción es irreversible. Todos tus datos serán eliminados permanentemente.</p>
        <button
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            background: "#ef4444",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontSize: 14,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Trash2 size={16} />
          Eliminar cuenta
        </button>
      </div>
    </div>
  );
}

function SettingItem({ label, value, icon, verified }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #1e2030" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {icon}
        <span style={{ color: "#c0caf5", fontSize: 14 }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {verified && <CheckCircle size={16} color="#22c55e" />}
        <span style={{ color: "#565f89", fontSize: 14 }}>{value}</span>
        <ChevronRight size={16} color="#565f89" />
      </div>
    </div>
  );
}

function ToggleSetting({ label, description }) {
  const [enabled, setEnabled] = useState(true);

  return (
    <div style={{ padding: "16px 0", borderBottom: "1px solid #1e2030" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ color: "#c0caf5", fontSize: 14, fontWeight: 500, display: "block" }}>{label}</span>
          <span style={{ color: "#565f89", fontSize: 12, display: "block", marginTop: 4 }}>{description}</span>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            background: enabled ? "#7c3aed" : "#1e2030",
            border: "none",
            cursor: "pointer",
            position: "relative",
            transition: "background 0.2s",
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "white",
              position: "absolute",
              top: 2,
              left: enabled ? 22 : 2,
              transition: "left 0.2s",
            }}
          />
        </button>
      </div>
    </div>
  );
}

function SelectSetting({ label, options }) {
  const [selected, setSelected] = useState(options[0]);

  return (
    <div style={{ padding: "16px 0", borderBottom: "1px solid #1e2030" }}>
      <span style={{ color: "#c0caf5", fontSize: 14, fontWeight: 500, display: "block", marginBottom: 8 }}>{label}</span>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          background: "#1a1b26",
          border: "1px solid #1e2030",
          borderRadius: 8,
          color: "#c0caf5",
          fontSize: 14,
          outline: "none",
          cursor: "pointer",
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}
