import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  ImagePlus,
  LogOut,
  Palette,
  Save,
  Settings,
  Shield,
  Trash2,
  UserRound,
} from "lucide-react";
import { useCustomization } from "../../customization/hooks/useCustomization";
import {
  FONT_PRESETS,
  GLOBAL_THEME_PRESETS,
} from "../../customization/services/customizationService";
import { statusService } from "../../status/services/statusService";
import { copyToClipboard } from "../../../shared/utils/helpers";
import {
  removeLocalProfilePhoto,
  resolveProfilePhoto,
  storeLocalProfilePhoto,
} from "../../../services/profilePhotoService";

const VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "Publica" },
  { value: "PRIVATE", label: "Privada" },
];

const SETTING_SECTIONS = [
  { id: "profile", label: "Perfil", icon: UserRound },
  { id: "account", label: "Cuenta", icon: Settings },
  { id: "privacy", label: "Privacidad", icon: Shield },
  { id: "appearance", label: "Apariencia", icon: Palette },
  { id: "session", label: "Sesion", icon: LogOut },
];

function buildForm(profile) {
  const profilePhoto = profile?.profilePhotoReference || profile?.profilePhoto || "";

  return {
    displayName: profile?.name || "",
    bio: profile?.bio || "",
    profilePhoto,
    profilePhotoPreview: profile?.profilePhoto || resolveProfilePhoto(profilePhoto),
    visibility: profile?.visibility || "PUBLIC",
  };
}

export default function SettingsPanel({ style, onLogout }) {
  const [activeSection, setActiveSection] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(() => buildForm(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const {
    userCustomization,
    visuals,
    saving: savingAppearance,
    updateUserCustomization,
  } = useCustomization(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const nextProfile = await statusService.getUserProfile();

        if (mounted) {
          setProfile(nextProfile);
          setForm(buildForm(nextProfile));
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || "No se pudo cargar la configuracion");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    queueMicrotask(() => {
      void loadProfile();
    });

    return () => {
      mounted = false;
    };
  }, []);

  const dirty = useMemo(() => {
    if (!profile) return false;
    const initial = buildForm(profile);

    return form.displayName !== initial.displayName
      || form.bio !== initial.bio
      || form.profilePhoto !== initial.profilePhoto
      || form.visibility !== initial.visibility;
  }, [form, profile]);

  const avatar = form.profilePhoto?.trim()
    ? <img src={form.profilePhotoPreview || resolveProfilePhoto(form.profilePhoto)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    : <UserRound size={32} />;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleProfilePhotoFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !profile?.userID) {
      return;
    }

    try {
      setError("");
      setNotice("");

      const storedPhoto = await storeLocalProfilePhoto(profile.userID, file);

      setForm((current) => {
        removeLocalProfilePhoto(current.profilePhoto);

        return {
          ...current,
          profilePhoto: storedPhoto.reference,
          profilePhotoPreview: storedPhoto.previewUrl,
        };
      });
      setNotice("Foto lista para guardar");
    } catch (photoError) {
      setError(photoError.message || "No se pudo preparar la imagen");
    }
  };

  const handleRemoveProfilePhoto = () => {
    removeLocalProfilePhoto(form.profilePhoto);
    setForm((current) => ({
      ...current,
      profilePhoto: "",
      profilePhotoPreview: "",
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!dirty || saving) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setNotice("");

      let nextProfile = await statusService.updateUserProfile({
        displayName: form.displayName.trim(),
        bio: form.bio,
        profilePhotoReference: form.profilePhoto.trim(),
      });

      if (form.visibility !== (profile?.visibility || "PUBLIC")) {
        nextProfile = await statusService.updateUserVisibility(form.visibility);
      }

      setProfile(nextProfile);
      setForm(buildForm(nextProfile));
      setNotice("Perfil actualizado");
    } catch (saveError) {
      setError(saveError.message || "No se pudo guardar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyFriendCode = async () => {
    if (!profile?.friendCode) {
      return;
    }

    const copied = await copyToClipboard(profile.friendCode);
    setNotice(copied ? "Friend code copiado" : "No se pudo copiar");
  };

  const updateAppearance = async (updates, message) => {
    try {
      setError("");
      setNotice("");
      await updateUserCustomization(updates);
      setNotice(message);
    } catch (appearanceError) {
      setError(appearanceError.message || "No se pudo guardar la apariencia");
    }
  };

  return (
    <aside
      style={{
        width: 720,
        flexShrink: 0,
        background: "#13141c",
        borderRight: "1px solid #1e2030",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      <div style={{ padding: "20px 18px 14px", borderBottom: "1px solid #1e2030" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "#1a1b26", color: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Settings size={17} />
          </div>
          <div>
            <h2 style={{ color: "#c0caf5", fontSize: 16, fontWeight: 700, margin: 0 }}>
              Configuracion
            </h2>
            <p style={{ color: "#565f89", fontSize: 12, margin: "2px 0 0" }}>
              {loading ? "Cargando..." : saving || savingAppearance ? "Guardando..." : "Perfil, cuenta y apariencia"}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "190px minmax(0, 1fr)", flex: 1, minHeight: 0 }}>
        <nav style={{ borderRight: "1px solid #1e2030", padding: "14px 10px", overflowY: "auto" }}>
          {SETTING_SECTIONS.map((section) => (
            <SectionButton
              key={section.id}
              section={section}
              active={activeSection === section.id}
              onClick={() => setActiveSection(section.id)}
            />
          ))}
        </nav>

        <div style={{ overflowY: "auto", padding: "18px 20px" }}>
          {(notice || error) && (
            <Notice text={notice || error} error={Boolean(error && !notice)} />
          )}

          {activeSection === "profile" && (
            <ProfileSection
              avatar={avatar}
              form={form}
              loading={loading}
              saving={saving}
              dirty={dirty}
              updateField={updateField}
              onFileChange={handleProfilePhotoFile}
              onRemovePhoto={handleRemoveProfilePhoto}
              onSave={handleSave}
            />
          )}

          {activeSection === "account" && (
            <AccountSection profile={profile} onCopyFriendCode={handleCopyFriendCode} />
          )}

          {activeSection === "privacy" && (
            <PrivacySection
              form={form}
              loading={loading}
              saving={saving}
              dirty={dirty}
              updateField={updateField}
              onSave={handleSave}
            />
          )}

          {activeSection === "appearance" && (
            <AppearanceSection
              userCustomization={userCustomization}
              visuals={visuals}
              saving={savingAppearance}
              onUpdate={updateAppearance}
            />
          )}

          {activeSection === "session" && (
            <SessionSection profile={profile} onLogout={onLogout} />
          )}
        </div>
      </div>
    </aside>
  );
}

function SectionButton({ section, active, onClick }) {
  const Icon = section.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ width: "100%", border: "none", borderRadius: 7, background: active ? "#1e2030" : "transparent", color: active ? "#c0caf5" : "#565f89", display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", fontSize: 13, fontWeight: active ? 700 : 600, cursor: "pointer", textAlign: "left", marginBottom: 4 }}
    >
      <Icon size={15} />
      {section.label}
    </button>
  );
}

function ProfileSection({ avatar, form, loading, saving, dirty, updateField, onFileChange, onRemovePhoto, onSave }) {
  return (
    <form onSubmit={onSave}>
      <SectionHeader title="Perfil" subtitle="Tu identidad publica dentro de Orioneta." />

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div style={{ width: 76, height: 76, borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {avatar}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <label style={{ height: 36, borderRadius: 8, border: "1px solid #1e2030", background: "#1a1b26", color: "#c0caf5", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 12px", fontSize: 12, fontWeight: 700, cursor: loading || saving ? "not-allowed" : "pointer", opacity: loading || saving ? 0.6 : 1 }}>
            <ImagePlus size={15} />
            Elegir imagen
            <input
              type="file"
              accept="image/*"
              disabled={loading || saving}
              onChange={onFileChange}
              style={{ display: "none" }}
            />
          </label>

          <button
            type="button"
            onClick={onRemovePhoto}
            disabled={loading || saving || !form.profilePhoto}
            title="Quitar foto"
            style={{ height: 36, borderRadius: 8, border: "1px solid #1e2030", background: "#1a1b26", color: form.profilePhoto ? "#ef4444" : "#565f89", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 12px", cursor: form.profilePhoto ? "pointer" : "default", opacity: loading || saving ? 0.6 : 1, fontSize: 12, fontWeight: 700 }}
          >
            <Trash2 size={15} />
            Quitar
          </button>
        </div>
      </div>

      <Field label="Nombre visible">
        <input
          value={form.displayName}
          onChange={(event) => updateField("displayName", event.target.value)}
          minLength={3}
          maxLength={60}
          disabled={loading || saving}
          style={inputStyle}
        />
      </Field>

      <Field label="Biografia">
        <textarea
          value={form.bio}
          onChange={(event) => updateField("bio", event.target.value)}
          maxLength={260}
          rows={5}
          disabled={loading || saving}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.45 }}
        />
      </Field>

      <SaveButton dirty={dirty} saving={saving} loading={loading} />
    </form>
  );
}

function AccountSection({ profile, onCopyFriendCode }) {
  return (
    <section>
      <SectionHeader title="Cuenta" subtitle="Datos publicos y de acceso." />
      <InfoRow label="Usuario">
        <span style={infoValueStyle}>@{profile?.userName || "usuario"}</span>
      </InfoRow>
      <InfoRow label="Friend code">
        <button type="button" onClick={onCopyFriendCode} disabled={!profile?.friendCode} title="Copiar friend code" style={{ display: "flex", alignItems: "center", gap: 7, border: "none", background: "transparent", color: "#a78bfa", fontSize: 12, fontWeight: 700, cursor: profile?.friendCode ? "pointer" : "default", minWidth: 0 }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {profile?.friendCode || "No disponible"}
          </span>
          <Copy size={13} />
        </button>
      </InfoRow>
      <InfoRow label="Email">
        <span style={infoValueStyle}>{profile?.email || "No disponible"}</span>
      </InfoRow>
      <p style={{ color: "#565f89", fontSize: 12, lineHeight: 1.45, margin: "14px 0 0" }}>
        El ID interno se mantiene oculto porque solo sirve para integraciones tecnicas.
      </p>
    </section>
  );
}

function PrivacySection({ form, loading, saving, dirty, updateField, onSave }) {
  return (
    <form onSubmit={onSave}>
      <SectionHeader title="Privacidad" subtitle="Controla como aparece tu cuenta para otros usuarios." />
      <Field label="Visibilidad de cuenta">
        <select
          value={form.visibility}
          onChange={(event) => updateField("visibility", event.target.value)}
          disabled={loading || saving}
          style={inputStyle}
        >
          {VISIBILITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      <SaveButton dirty={dirty} saving={saving} loading={loading} />
    </form>
  );
}

function AppearanceSection({ userCustomization, visuals, saving, onUpdate }) {
  return (
    <section>
      <SectionHeader title="Apariencia" subtitle="Preferencias globales de interfaz." />

      <p style={fieldLabelStyle}>Tema global</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginBottom: 14 }}>
        {GLOBAL_THEME_PRESETS.map((theme) => (
          <button
            key={theme.id}
            type="button"
            disabled={saving}
            onClick={() => onUpdate({ activeGlobalThemeId: theme.id }, "Tema aplicado")}
            style={{ border: `1px solid ${userCustomization?.activeGlobalThemeId === theme.id ? theme.accent : "#1e2030"}`, background: userCustomization?.activeGlobalThemeId === theme.id ? "#1a1b26" : "#10111a", borderRadius: 8, padding: 10, cursor: saving ? "wait" : "pointer", textAlign: "left" }}
          >
            <div style={{ display: "flex", gap: 5, marginBottom: 7 }}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: theme.accent }} />
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: theme.accentSecondary }} />
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: theme.incoming }} />
            </div>
            <span style={{ color: "#c0caf5", fontSize: 12, fontWeight: 700 }}>{theme.name}</span>
          </button>
        ))}
      </div>

      <Field label="Fuente">
        <select
          value={userCustomization?.activeFontId || "system"}
          onChange={(event) => onUpdate({ activeFontId: event.target.value }, "Fuente actualizada")}
          disabled={saving}
          style={inputStyle}
        >
          {FONT_PRESETS.map((font) => (
            <option key={font.id} value={font.id}>{font.name}</option>
          ))}
        </select>
      </Field>

      <SettingRow label="Modo compacto">
        <Toggle
          checked={Boolean(userCustomization?.compactMode)}
          onChange={() => onUpdate({ compactMode: !userCustomization?.compactMode }, "Densidad actualizada")}
        />
      </SettingRow>

      <SettingRow label="Animacion">
        <input
          type="range"
          min="0"
          max="5"
          value={userCustomization?.animationLevel ?? 3}
          onChange={(event) => onUpdate({ animationLevel: Number(event.target.value) }, "Animacion actualizada")}
          style={{ accentColor: visuals.accent, width: 180 }}
        />
      </SettingRow>
    </section>
  );
}

function SessionSection({ profile, onLogout }) {
  return (
    <section>
      <SectionHeader title="Sesion" subtitle={profile?.email || "Cuenta actual"} />
      <button type="button" onClick={onLogout} style={{ width: "100%", height: 40, borderRadius: 8, border: "1px solid rgba(239, 68, 68, 0.32)", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
        <LogOut size={15} />
        Cerrar sesion
      </button>
    </section>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h3 style={{ color: "#c0caf5", fontSize: 18, fontWeight: 800, margin: 0 }}>{title}</h3>
      <p style={{ color: "#565f89", fontSize: 12, margin: "4px 0 0" }}>{subtitle}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span style={fieldLabelStyle}>{label}</span>
      {children}
    </label>
  );
}

function SettingRow({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "12px 0", borderBottom: "1px solid #1e2030" }}>
      <span style={{ color: "#c0caf5", fontSize: 13 }}>{label}</span>
      {children}
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, borderBottom: "1px solid #1e2030", padding: "10px 0" }}>
      <span style={{ color: "#565f89", fontSize: 12 }}>{label}</span>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={onChange} style={{ width: 42, height: 24, borderRadius: 999, border: "1px solid #1e2030", background: checked ? "#7c3aed" : "#1a1b26", padding: 2, cursor: "pointer" }}>
      <span style={{ display: "block", width: 18, height: 18, borderRadius: "50%", background: "white", transform: checked ? "translateX(18px)" : "translateX(0)", transition: "transform 0.16s ease" }} />
    </button>
  );
}

function SaveButton({ dirty, saving, loading }) {
  return (
    <button type="submit" disabled={!dirty || saving || loading} style={{ width: "100%", height: 40, borderRadius: 8, border: "none", background: dirty && !saving && !loading ? "#7c3aed" : "#1e2030", color: dirty && !saving && !loading ? "white" : "#565f89", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, fontWeight: 700, cursor: dirty && !saving && !loading ? "pointer" : "default", marginTop: 14 }}>
      <Save size={15} />
      {saving ? "Guardando..." : "Guardar cambios"}
    </button>
  );
}

function Notice({ text, error }) {
  return (
    <div style={{ padding: "9px 10px", borderRadius: 8, background: error ? "rgba(239, 68, 68, 0.1)" : "rgba(124, 58, 237, 0.12)", border: `1px solid ${error ? "rgba(239, 68, 68, 0.25)" : "rgba(124, 58, 237, 0.25)"}`, color: error ? "#ef4444" : "#a78bfa", fontSize: 12, marginBottom: 14 }}>
      {text}
    </div>
  );
}

const fieldLabelStyle = {
  color: "#565f89",
  fontSize: 11,
  display: "block",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "9px 10px",
  background: "#1a1b26",
  border: "1px solid #1e2030",
  borderRadius: 8,
  color: "#c0caf5",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

const infoValueStyle = {
  color: "#c0caf5",
  fontSize: 12,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  textAlign: "right",
};
