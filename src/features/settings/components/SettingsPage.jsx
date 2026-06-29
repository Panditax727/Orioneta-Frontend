import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  ChevronRight,
  Clock,
  Globe,
  Lock,
  LogOut,
  Palette,
  Save,
  Shield,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { clearSession } from "../../auth/session";
import { useSettings } from "../hooks/useSettings";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";

function calculateAccountAge(createdAt) {
  if (!createdAt) return 0;
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now - created;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 30);
}

export default function SettingsPage() {
  const { settings, loading, saving, error, updateProfile, updateAccount, updatePrivacy, updateNotifications, updateAppearance, changePassword, deleteAccount } = useSettings();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");
  const [saveMessage, setSaveMessage] = useState(null);

  const showSaveMessage = (type, message) => {
    setSaveMessage({ type, message });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSave = useCallback(() => {
    showSaveMessage("success", "Cambios guardados correctamente");
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const sections = [
    { id: "profile", label: "Perfil", icon: <User size={20} /> },
    { id: "account", label: "Cuenta", icon: <Globe size={20} /> },
    { id: "privacy", label: "Privacidad", icon: <Shield size={20} /> },
    { id: "notifications", label: "Notificaciones", icon: <Bell size={20} /> },
    { id: "appearance", label: "Apariencia", icon: <Palette size={20} /> },
    { id: "security", label: "Seguridad", icon: <Lock size={20} /> },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0d0e14" }}>
        <span style={{ color: "#565f89", fontSize: 14 }}>Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d0e14" }}>
      <div style={{ width: 280, flexShrink: 0, background: "#13141c", borderRight: "1px solid #1e2030", padding: "20px 0", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 20px 0", padding: "0 20px" }}>
          <button
            onClick={() => navigate("/chat")}
            style={{ width: 32, height: 32, borderRadius: 8, background: "#1a1b26", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#565f89", flexShrink: 0 }}
          >
            <ArrowLeft size={16} />
          </button>
          <h2 style={{ color: "#c0caf5", fontSize: 18, fontWeight: 600, margin: 0 }}>Configuración</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
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
              onMouseEnter={(e) => { if (activeSection !== section.id) e.currentTarget.style.background = "#161720"; }}
              onMouseLeave={(e) => { if (activeSection !== section.id) e.currentTarget.style.background = "transparent"; }}
            >
              {section.icon}
              {section.label}
              <ChevronRight size={16} style={{ marginLeft: "auto", opacity: 0.5 }} />
            </button>
          ))}
        </div>

        <div style={{ padding: "20px", borderTop: "1px solid #1e2030" }}>
          <button
            onClick={handleLogout}
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
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </div>

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

        {activeSection === "profile" && (
          <ProfileSection
            settings={settings}
            onSave={updateProfile}
            onSuccess={() => showSaveMessage("success", "Perfil actualizado correctamente")}
            onError={(msg) => showSaveMessage("error", msg)}
          />
        )}
        {activeSection === "account" && (
          <AccountSection
            settings={settings}
            onSave={updateAccount}
            onSuccess={() => showSaveMessage("success", "Cuenta actualizada correctamente")}
            onError={(msg) => showSaveMessage("error", msg)}
          />
        )}
        {activeSection === "privacy" && (
          <PrivacySection
            settings={settings}
            onSave={updatePrivacy}
            onSuccess={() => showSaveMessage("success", "Privacidad actualizada correctamente")}
            onError={(msg) => showSaveMessage("error", msg)}
          />
        )}
        {activeSection === "notifications" && (
          <NotificationsSection
            settings={settings}
            onSave={updateNotifications}
            onSuccess={() => showSaveMessage("success", "Notificaciones actualizadas correctamente")}
            onError={(msg) => showSaveMessage("error", msg)}
          />
        )}
        {activeSection === "appearance" && (
          <AppearanceSection
            settings={settings}
            onSave={updateAppearance}
            onSuccess={() => showSaveMessage("success", "Apariencia actualizada correctamente")}
            onError={(msg) => showSaveMessage("error", msg)}
          />
        )}
        {activeSection === "security" && (
          <SecuritySection
            onChangePassword={changePassword}
            onDeleteAccount={deleteAccount}
            onSuccess={handleSave}
            onError={(msg) => showSaveMessage("error", msg)}
          />
        )}
      </div>
    </div>
  );
}

function ProfileSection({ settings, onSave, onSuccess, onError }) {
  const [formData, setFormData] = useState(settings?.profile || {});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await onSave(formData);
      onSuccess();
    } catch (err) {
      onError(err.message);
    }
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
          <button style={{ padding: "8px 16px", borderRadius: 6, background: "#7c3aed", border: "none", cursor: "pointer", color: "white", fontSize: 13, fontWeight: 500 }}>
            Cambiar avatar
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div>
            <label style={{ display: "block", color: "#c0caf5", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Nombre de usuario</label>
            <input name="username" value={formData?.username || ""} onChange={handleChange}
              style={{ width: "100%", padding: "10px 12px", background: "#1a1b26", border: "1px solid #1e2030", borderRadius: 8, color: "#c0caf5", fontSize: 14, outline: "none" }}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#c0caf5", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Email</label>
            <input name="email" value={formData?.email || ""} onChange={handleChange}
              style={{ width: "100%", padding: "10px 12px", background: "#1a1b26", border: "1px solid #1e2030", borderRadius: 8, color: "#c0caf5", fontSize: 14, outline: "none" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", color: "#c0caf5", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Bio</label>
          <textarea name="bio" value={formData?.bio || ""} onChange={handleChange} rows={3}
            style={{ width: "100%", padding: "10px 12px", background: "#1a1b26", border: "1px solid #1e2030", borderRadius: 8, color: "#c0caf5", fontSize: 14, outline: "none", resize: "vertical" }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", color: "#c0caf5", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Estado personalizado</label>
          <input name="customStatus" value={formData?.customStatus || ""} onChange={handleChange} placeholder="¿Qué estás haciendo?"
            style={{ width: "100%", padding: "10px 12px", background: "#1a1b26", border: "1px solid #1e2030", borderRadius: 8, color: "#c0caf5", fontSize: 14, outline: "none" }}
          />
        </div>

        <button onClick={handleSubmit}
          style={{ padding: "10px 20px", borderRadius: 8, background: "#7c3aed", border: "none", cursor: "pointer", color: "white", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}
        >
          <Save size={16} />
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

function AccountSection({ settings, onSave, onSuccess, onError }) {
  const [formData, setFormData] = useState(settings?.account || {});
  const [createdAt] = useState(
    settings?.account?.createdAt || settings?.profile?.createdAt || "2024-01-15T00:00:00Z"
  );

  const accountAge = useMemo(() => calculateAccountAge(createdAt), [createdAt]);
  const seniorityPoints = accountAge * 10;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await onSave(formData);
      onSuccess();
    } catch (err) {
      onError(err.message);
    }
  };

  return (
    <div>
      <h1 style={{ color: "#c0caf5", fontSize: 24, fontWeight: 600, margin: "0 0 8px 0" }}>Cuenta</h1>
      <p style={{ color: "#565f89", fontSize: 14, margin: "0 0 32px 0" }}>Configuración de tu cuenta</p>

      <div style={{ background: "#13141c", borderRadius: 12, padding: "24px", border: "1px solid #1e2030", marginBottom: 20 }}>
        <h3 style={{ color: "#c0caf5", fontSize: 16, fontWeight: 600, margin: "0 0 16px 0" }}>Información general</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div>
            <label style={{ display: "block", color: "#c0caf5", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Idioma</label>
            <select name="language" value={formData?.language || "es"} onChange={handleChange}
              style={{ width: "100%", padding: "10px 12px", background: "#1a1b26", border: "1px solid #1e2030", borderRadius: 8, color: "#c0caf5", fontSize: 14, outline: "none", cursor: "pointer" }}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", color: "#c0caf5", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Zona horaria</label>
            <select name="timezone" value={formData?.timezone || "America/Mexico_City"} onChange={handleChange}
              style={{ width: "100%", padding: "10px 12px", background: "#1a1b26", border: "1px solid #1e2030", borderRadius: 8, color: "#c0caf5", fontSize: 14, outline: "none", cursor: "pointer" }}
            >
              <option value="America/Mexico_City">America/Mexico_City</option>
              <option value="America/Argentina/Buenos_Aires">America/Argentina/Buenos_Aires</option>
              <option value="America/Santiago">America/Santiago</option>
              <option value="America/Bogota">America/Bogota</option>
              <option value="America/Lima">America/Lima</option>
              <option value="Europe/Madrid">Europe/Madrid</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ background: "#13141c", borderRadius: 12, padding: "24px", border: "1px solid #1e2030", marginBottom: 20 }}>
        <h3 style={{ color: "#c0caf5", fontSize: 16, fontWeight: 600, margin: "0 0 16px 0" }}>Antigüedad</h3>

        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", background: "#1a1b26", borderRadius: 8 }}>
          <Clock size={20} color="#7c3aed" />
          <div>
            <p style={{ color: "#c0caf5", fontSize: 14, fontWeight: 500, margin: 0 }}>
              {accountAge} meses de antigüedad
            </p>
            <p style={{ color: "#a78bfa", fontSize: 13, margin: "2px 0 0" }}>
              {seniorityPoints} puntos de antigüedad
            </p>
          </div>
        </div>
      </div>

      <div style={{ background: "#13141c", borderRadius: 12, padding: "24px", border: "1px solid #1e2030", marginBottom: 20 }}>
        <h3 style={{ color: "#c0caf5", fontSize: 16, fontWeight: 600, margin: "0 0 16px 0" }}>Verificación</h3>
        <SettingItem label="Verificación de email" value={formData?.emailVerified ? "Verificado" : "No verificado"} verified={formData?.emailVerified} />
        <SettingItem label="Autenticación de dos factores" value={formData?.twoFactorEnabled ? "Activado" : "Desactivado"} />
      </div>

      <button onClick={handleSubmit}
        style={{ padding: "10px 20px", borderRadius: 8, background: "#7c3aed", border: "none", cursor: "pointer", color: "white", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}
      >
        <Save size={16} />
        Guardar cambios
      </button>
    </div>
  );
}

function PrivacySection({ settings, onSave, onSuccess, onError }) {
  const [formData, setFormData] = useState(settings?.privacy || {});

  const handleToggle = async (key) => {
    const next = { ...formData, [key]: !formData[key] };
    setFormData(next);
    try {
      await onSave(next);
      onSuccess();
    } catch (err) {
      onError(err.message);
      setFormData(formData);
    }
  };

  const handleSelect = async (key, value) => {
    const next = { ...formData, [key]: value };
    setFormData(next);
    try {
      await onSave(next);
      onSuccess();
    } catch (err) {
      onError(err.message);
      setFormData(formData);
    }
  };

  return (
    <div>
      <h1 style={{ color: "#c0caf5", fontSize: 24, fontWeight: 600, margin: "0 0 8px 0" }}>Privacidad</h1>
      <p style={{ color: "#565f89", fontSize: 14, margin: "0 0 32px 0" }}>Controla quién puede ver tu información</p>

      <div style={{ background: "#13141c", borderRadius: 12, padding: "24px", border: "1px solid #1e2030" }}>
        <div style={{ padding: "16px 0", borderBottom: "1px solid #1e2030" }}>
          <span style={{ color: "#c0caf5", fontSize: 14, fontWeight: 500, display: "block", marginBottom: 8 }}>Visibilidad del perfil</span>
          <select value={formData?.profileVisibility || "everyone"} onChange={(e) => handleSelect("profileVisibility", e.target.value)}
            style={{ width: "100%", padding: "10px 12px", background: "#1a1b26", border: "1px solid #1e2030", borderRadius: 8, color: "#c0caf5", fontSize: 14, outline: "none", cursor: "pointer" }}
          >
            <option value="everyone">Todos</option>
            <option value="friends">Solo amigos</option>
            <option value="nobody">Nadie</option>
          </select>
        </div>

        <div style={{ padding: "16px 0", borderBottom: "1px solid #1e2030" }}>
          <span style={{ color: "#c0caf5", fontSize: 14, fontWeight: 500, display: "block", marginBottom: 8 }}>Solicitudes de mensaje</span>
          <select value={formData?.messageRequests || "everyone"} onChange={(e) => handleSelect("messageRequests", e.target.value)}
            style={{ width: "100%", padding: "10px 12px", background: "#1a1b26", border: "1px solid #1e2030", borderRadius: 8, color: "#c0caf5", fontSize: 14, outline: "none", cursor: "pointer" }}
          >
            <option value="everyone">Todos</option>
            <option value="friends">Solo amigos</option>
            <option value="nobody">Nadie</option>
          </select>
        </div>

        <ToggleSetting label="Mostrar estado en línea" description="Permite que otros vean cuando estás en línea"
          enabled={formData?.showOnlineStatus ?? true} onChange={() => handleToggle("showOnlineStatus")}
        />
        <ToggleSetting label="Confirmación de lectura" description="Muestra cuando has leído un mensaje"
          enabled={formData?.readReceipts ?? true} onChange={() => handleToggle("readReceipts")}
        />
      </div>
    </div>
  );
}

function NotificationsSection({ settings, onSave, onSuccess, onError }) {
  const [formData, setFormData] = useState(settings?.notifications || {});

  const handleToggle = async (key) => {
    const next = { ...formData, [key]: !formData[key] };
    setFormData(next);
    try {
      await onSave(next);
      onSuccess();
    } catch (err) {
      onError(err.message);
      setFormData(formData);
    }
  };

  return (
    <div>
      <h1 style={{ color: "#c0caf5", fontSize: 24, fontWeight: 600, margin: "0 0 8px 0" }}>Notificaciones</h1>
      <p style={{ color: "#565f89", fontSize: 14, margin: "0 0 32px 0" }}>Configura tus preferencias de notificación</p>

      <div style={{ background: "#13141c", borderRadius: 12, padding: "24px", border: "1px solid #1e2030" }}>
        <ToggleSetting label="Notificaciones de escritorio" description="Recibe notificaciones en tu escritorio"
          enabled={formData?.desktop ?? true} onChange={() => handleToggle("desktop")}
        />
        <ToggleSetting label="Sonidos" description="Reproduce sonidos de notificación"
          enabled={formData?.sound ?? true} onChange={() => handleToggle("sound")}
        />
        <ToggleSetting label="Menciones" description="Notificaciones cuando te mencionan"
          enabled={formData?.mentions ?? true} onChange={() => handleToggle("mentions")}
        />
        <ToggleSetting label="Mensajes directos" description="Notificaciones de mensajes privados"
          enabled={formData?.messages ?? true} onChange={() => handleToggle("messages")}
        />
        <ToggleSetting label="Grupos" description="Notificaciones de grupos"
          enabled={formData?.groups ?? true} onChange={() => handleToggle("groups")}
        />
      </div>
    </div>
  );
}

function AppearanceSection({ settings, onSave, onSuccess, onError }) {
  const [formData, setFormData] = useState(settings?.appearance || {});

  const handleChange = async (key, value) => {
    const next = { ...formData, [key]: value };
    setFormData(next);
    try {
      await onSave(next);
    } catch (err) {
      onError(err.message);
      setFormData(formData);
    }
  };

  return (
    <div>
      <h1 style={{ color: "#c0caf5", fontSize: 24, fontWeight: 600, margin: "0 0 8px 0" }}>Apariencia</h1>
      <p style={{ color: "#565f89", fontSize: 14, margin: "0 0 32px 0" }}>Personaliza la apariencia de la aplicación</p>

      <div style={{ background: "#13141c", borderRadius: 12, padding: "24px", border: "1px solid #1e2030" }}>
        <SelectSetting label="Tema" value={formData?.theme || "dark"} options={[
          { value: "dark", label: "Oscuro" },
          { value: "light", label: "Claro" },
          { value: "auto", label: "Automático" },
        ]} onChange={(v) => handleChange("theme", v)} />

        <SelectSetting label="Tamaño de fuente" value={formData?.fontSize || "medium"} options={[
          { value: "small", label: "Pequeño" },
          { value: "medium", label: "Mediano" },
          { value: "large", label: "Grande" },
        ]} onChange={(v) => handleChange("fontSize", v)} />

        <SelectSetting label="Densidad del chat" value={formData?.chatDensity || "comfortable"} options={[
          { value: "compact", label: "Compacto" },
          { value: "comfortable", label: "Cómodo" },
          { value: "spacious", label: "Espaciado" },
        ]} onChange={(v) => handleChange("chatDensity", v)} />

        <SelectSetting label="Comportamiento del sidebar" value={formData?.sidebarBehavior || "auto-hide"} options={[
          { value: "visible", label: "Siempre visible" },
          { value: "auto-hide", label: "Auto-ocultar" },
          { value: "manual", label: "Manual" },
        ]} onChange={(v) => handleChange("sidebarBehavior", v)} />
      </div>
    </div>
  );
}

function SecuritySection({ onChangePassword, onDeleteAccount, onSuccess, onError }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogStep, setDeleteDialogStep] = useState(1);

  const handleChangePassword = async () => {
    setPasswordError("");

    if (!currentPassword || !newPassword) {
      setPasswordError("Completa todos los campos");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    try {
      await onChangePassword(currentPassword, newPassword);
      onSuccess();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  const handleDeleteAccount = () => {
    setDeleteDialogStep(1);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteDialogStep === 1) {
      setDeleteDialogStep(2);
    } else {
      onDeleteAccount()
        .then(() => {
          setDeleteDialogOpen(false);
          onSuccess();
        })
        .catch((err) => {
          setDeleteDialogOpen(false);
          onError(err.message);
        });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteDialogStep(1);
  };

  return (
    <div>
      <h1 style={{ color: "#c0caf5", fontSize: 24, fontWeight: 600, margin: "0 0 8px 0" }}>Seguridad</h1>
      <p style={{ color: "#565f89", fontSize: 14, margin: "0 0 32px 0" }}>Protege tu cuenta</p>

      <div style={{ background: "#13141c", borderRadius: 12, padding: "24px", border: "1px solid #1e2030", marginBottom: 20 }}>
        <h3 style={{ color: "#c0caf5", fontSize: 16, fontWeight: 600, margin: "0 0 16px 0" }}>Autenticación de dos factores</h3>
        <ToggleSetting label="Activar 2FA" description="Añade una capa extra de seguridad a tu cuenta"
          enabled={twoFactor} onChange={() => setTwoFactor(!twoFactor)}
        />
      </div>

      <div style={{ background: "#13141c", borderRadius: 12, padding: "24px", border: "1px solid #1e2030", marginBottom: 20 }}>
        <h3 style={{ color: "#c0caf5", fontSize: 16, fontWeight: 600, margin: "0 0 16px 0" }}>Cambiar contraseña</h3>

        {passwordError && (
          <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{passwordError}</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", color: "#c0caf5", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Contraseña actual</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", background: "#1a1b26", border: "1px solid #1e2030", borderRadius: 8, color: "#c0caf5", fontSize: 14, outline: "none" }}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#c0caf5", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Nueva contraseña</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", background: "#1a1b26", border: "1px solid #1e2030", borderRadius: 8, color: "#c0caf5", fontSize: 14, outline: "none" }}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#c0caf5", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Confirmar nueva contraseña</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", background: "#1a1b26", border: "1px solid #1e2030", borderRadius: 8, color: "#c0caf5", fontSize: 14, outline: "none" }}
            />
          </div>
          <button onClick={handleChangePassword}
            style={{ padding: "10px 20px", borderRadius: 8, background: "#7c3aed", border: "none", cursor: "pointer", color: "white", fontSize: 14, fontWeight: 500, alignSelf: "flex-start" }}
          >
            Cambiar contraseña
          </button>
        </div>
      </div>

      <div style={{ background: "rgba(239, 68, 68, 0.1)", borderRadius: 12, padding: "24px", border: "1px solid #ef4444" }}>
        <h3 style={{ color: "#ef4444", fontSize: 16, fontWeight: 600, margin: "0 0 8px 0" }}>Zona de peligro</h3>
        <p style={{ color: "#ef4444", fontSize: 13, margin: "0 0 16px 0" }}>Esta acción es irreversible. Todos tus datos serán eliminados permanentemente.</p>
        <button onClick={handleDeleteAccount}
          style={{ padding: "10px 20px", borderRadius: 8, background: "#ef4444", border: "none", cursor: "pointer", color: "white", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}
        >
          <Trash2 size={16} />
          Eliminar cuenta
        </button>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={deleteDialogStep === 1 ? "¿Estás seguro?" : "Confirmar eliminación"}
        description={
          deleteDialogStep === 1
            ? "Esta acción es irreversible. ¿Estás seguro de que deseas continuar?"
            : "Todos tus datos serán eliminados permanentemente. ¿Continuar?"
        }
        confirmText={deleteDialogStep === 1 ? "Continuar" : "Eliminar cuenta"}
        cancelText="Cancelar"
        confirmVariant="danger"
      />
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

function ToggleSetting({ label, description, enabled, onChange }) {
  return (
    <div style={{ padding: "16px 0", borderBottom: "1px solid #1e2030" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ color: "#c0caf5", fontSize: 14, fontWeight: 500, display: "block" }}>{label}</span>
          <span style={{ color: "#565f89", fontSize: 12, display: "block", marginTop: 4 }}>{description}</span>
        </div>
        <button onClick={onChange}
          style={{ width: 44, height: 24, borderRadius: 12, background: enabled ? "#7c3aed" : "#1e2030", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}
        >
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: enabled ? 22 : 2, transition: "left 0.2s" }} />
        </button>
      </div>
    </div>
  );
}

function SelectSetting({ label, value, options, onChange }) {
  return (
    <div style={{ padding: "16px 0", borderBottom: "1px solid #1e2030" }}>
      <span style={{ color: "#c0caf5", fontSize: 14, fontWeight: 500, display: "block", marginBottom: 8 }}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "10px 12px", background: "#1a1b26", border: "1px solid #1e2030", borderRadius: 8, color: "#c0caf5", fontSize: 14, outline: "none", cursor: "pointer" }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
