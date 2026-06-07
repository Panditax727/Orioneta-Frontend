import { useEffect, useMemo, useState } from "react";
import { Copy, LogOut, RefreshCcw, Save, Settings, UserRound, Wifi } from "lucide-react";
import { statusService } from "../../status/services/statusService";
import { copyToClipboard } from "../../../shared/utils/helpers";

const VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "Publica" },
  { value: "PRIVATE", label: "Privada" },
];

function buildForm(profile) {
  return {
    displayName: profile?.name || "",
    bio: profile?.bio || "",
    profilePhoto: profile?.profilePhoto || "",
    visibility: profile?.visibility || "PUBLIC",
  };
}

export default function SettingsPanel({ style, realtime, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(() => buildForm(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

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
    ? <img src={form.profilePhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    : <UserRound size={24} />;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
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
        profilePhoto: form.profilePhoto.trim(),
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

  return (
    <aside
      style={{
        width: 360,
        flexShrink: 0,
        background: "#13141c",
        borderRight: "1px solid #1e2030",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid #1e2030" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "#1a1b26", color: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Settings size={16} />
          </div>
          <div>
            <h2 style={{ color: "#c0caf5", fontSize: 16, fontWeight: 600, margin: 0 }}>
              Configuracion
            </h2>
            <p style={{ color: "#565f89", fontSize: 12, margin: "2px 0 0" }}>
              {loading ? "Cargando..." : saving ? "Guardando..." : realtime?.label || "Perfil"}
            </p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {(notice || error) && (
          <Notice text={notice || error} error={Boolean(error && !notice)} />
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0 18px" }}>
          <div style={{ width: 58, height: 58, borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {avatar}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: "#c0caf5", fontSize: 15, fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profile?.name || "Perfil Orioneta"}
            </p>
            <p style={{ color: "#565f89", fontSize: 12, margin: "3px 0 0" }}>
              @{profile?.userName || "usuario"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <SectionTitle title="Perfil" />

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
              rows={4}
              disabled={loading || saving}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.4 }}
            />
          </Field>

          <Field label="Foto de perfil">
            <input
              value={form.profilePhoto}
              onChange={(event) => updateField("profilePhoto", event.target.value)}
              maxLength={500}
              placeholder="https://..."
              disabled={loading || saving}
              style={inputStyle}
            />
          </Field>

          <Field label="Visibilidad">
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

          <button
            type="submit"
            disabled={!dirty || saving || loading}
            style={{
              width: "100%",
              height: 40,
              borderRadius: 8,
              border: "none",
              background: dirty && !saving && !loading ? "#7c3aed" : "#1e2030",
              color: dirty && !saving && !loading ? "white" : "#565f89",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: dirty && !saving && !loading ? "pointer" : "default",
              marginTop: 14,
            }}
          >
            <Save size={15} />
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>

        <SectionTitle title="Cuenta" />

        <InfoRow label="Friend code">
          <button
            type="button"
            onClick={handleCopyFriendCode}
            disabled={!profile?.friendCode}
            title="Copiar friend code"
            style={{ display: "flex", alignItems: "center", gap: 7, border: "none", background: "transparent", color: "#a78bfa", fontSize: 12, fontWeight: 700, cursor: profile?.friendCode ? "pointer" : "default", minWidth: 0 }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profile?.friendCode || "No disponible"}
            </span>
            <Copy size={13} />
          </button>
        </InfoRow>

        <InfoRow label="Email">
          <span style={infoValueStyle}>{profile?.email || "No disponible"}</span>
        </InfoRow>

        <p style={{ color: "#565f89", fontSize: 11, lineHeight: 1.4, margin: "10px 0 0" }}>
          El ID interno se mantiene oculto porque solo sirve para integraciones tecnicas.
        </p>

        <SectionTitle title="Tiempo real" />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 12, border: "1px solid #1e2030", borderRadius: 8, background: "#10111a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: realtime?.connected ? "rgba(34, 197, 94, 0.14)" : "rgba(245, 158, 11, 0.12)", color: realtime?.connected ? "#22c55e" : "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Wifi size={16} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: "#c0caf5", fontSize: 13, fontWeight: 700, margin: 0 }}>
                {realtime?.label || "Tiempo real inactivo"}
              </p>
              <p style={{ color: "#565f89", fontSize: 11, margin: "2px 0 0" }}>
                {realtime?.lastEventAt
                  ? `Ultimo evento ${realtime.lastEventAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "WebSocket /ws/chat"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={realtime?.reconnect}
            title="Reconectar realtime"
            style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #1e2030", background: "#1a1b26", color: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
          >
            <RefreshCcw size={14} />
          </button>
        </div>

        <button
          type="button"
          onClick={onLogout}
          style={{ width: "100%", height: 38, borderRadius: 8, border: "1px solid rgba(239, 68, 68, 0.32)", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", marginTop: 18 }}
        >
          <LogOut size={15} />
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}

function SectionTitle({ title }) {
  return (
    <p style={{ color: "#c0caf5", fontSize: 13, fontWeight: 700, margin: "18px 0 10px" }}>
      {title}
    </p>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 11 }}>
      <span style={{ color: "#565f89", fontSize: 11, display: "block", marginBottom: 6 }}>
        {label}
      </span>
      {children}
    </label>
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

function Notice({ text, error }) {
  return (
    <div style={{ padding: "9px 10px", borderRadius: 8, background: error ? "rgba(239, 68, 68, 0.1)" : "rgba(124, 58, 237, 0.12)", border: `1px solid ${error ? "rgba(239, 68, 68, 0.25)" : "rgba(124, 58, 237, 0.25)"}`, color: error ? "#ef4444" : "#a78bfa", fontSize: 12 }}>
      {text}
    </div>
  );
}

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
