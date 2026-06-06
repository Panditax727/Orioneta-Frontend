import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import Loader from "../../../shared/components/Loader";
import {
  validateDisplayName,
  validateEmail,
  validatePassword,
} from "../../../shared/utils/validators";
import {
  DEFAULT_OAUTH_PROVIDERS,
  getOAuthProviders,
  redirectToOAuth,
  register,
} from "../../../services/authService";
import { saveSession } from "../session";
import { ensureCurrentUserProfile } from "../../../services/userService";
import AuthShell from "./AuthShell";
import logoImage from "../../../assets/logo.png";

const OAUTH_ICONS = {
  google: { Icon: FaGoogle, color: "#4285F4" },
  github: { Icon: FaGithub, color: "#ffffff" },
};

function mergeProviders(apiProviders) {
  return DEFAULT_OAUTH_PROVIDERS.map((provider) => {
    const backendProvider = apiProviders.find(
      (item) => item.provider === provider.id || item.id === provider.id,
    );

    return {
      ...provider,
      ...backendProvider,
      id: provider.id,
      label: provider.label,
    };
  });
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthProviders, setOauthProviders] = useState(DEFAULT_OAUTH_PROVIDERS);

  useEffect(() => {
    getOAuthProviders()
      .then((providers) => setOauthProviders(mergeProviders(providers)))
      .catch(() => setOauthProviders(DEFAULT_OAUTH_PROVIDERS));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: null }));
    setApiError("");
  };

  const validateForm = () => {
    const nextErrors = {
      displayName: validateDisplayName(form.displayName),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const session = await register({
        displayName: form.displayName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      saveSession(session);
      await ensureCurrentUserProfile({
        displayName: form.displayName.trim(),
        email: form.email.trim().toLowerCase(),
      }).catch((error) => {
        console.warn("No se pudo preparar el perfil publico:", error);
      });
      navigate("/chat");
    } catch (error) {
      setApiError(error.message || "No se pudo crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (providerId) => {
    if (loading) {
      return;
    }

    redirectToOAuth(providerId, oauthProviders);
  };

  return (
    <AuthShell
      eyebrow="Unete a Orioneta"
      title={
        <>
          Crea tu cuenta en <span>Orioneta</span>
        </>
      }
      subtitle="Tu universo de conversaciones privadas, grupos y personalizacion te espera."
    >
      <div className="auth-card-header">
        <div className="auth-logo-large">
          <img src={logoImage} alt="Orioneta" />
        </div>
        <h1>
          Bienvenido a <span>bordo</span>
        </h1>
        <p>Crea tu cuenta gratuita</p>
      </div>

      {apiError && <div className="auth-alert">{apiError}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          type="text"
          name="displayName"
          label="Nombre visible"
          placeholder="panditax"
          value={form.displayName}
          onChange={handleChange}
          error={errors.displayName}
          disabled={loading}
          autoComplete="name"
          maxLength={80}
          icon={<span style={{ color: "#565f89", fontSize: 14 }}>@</span>}
        />

        <Input
          type="email"
          name="email"
          label="Correo electronico"
          placeholder="usuario@orioneta.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          disabled={loading}
          autoComplete="email"
          maxLength={120}
          icon={<span style={{ fontSize: 15 }}>✉</span>}
        />

        <Input
          type={showPassword ? "text" : "password"}
          name="password"
          label="Contrasena"
          placeholder="Minimo 8 caracteres"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          disabled={loading}
          autoComplete="new-password"
          maxLength={120}
          icon={<span style={{ fontSize: 13 }}>✦</span>}
          rightElement={
            <button
              type="button"
              aria-label={showPassword ? "Ocultar contrasena" : "Ver contrasena"}
              onClick={() => setShowPassword((current) => !current)}
              className="auth-input-icon-button"
              disabled={loading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />

        <Button fullWidth type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader size={16} color="white" />
              Creando...
            </>
          ) : (
            "Crear cuenta"
          )}
        </Button>
      </form>

      <div className="auth-divider">
        <span />
        <p>o registrate con</p>
        <span />
      </div>

      <div className="auth-oauth-grid">
        {oauthProviders.map((provider) => {
          const oauthIcon = OAUTH_ICONS[provider.id];
          const Icon = oauthIcon.Icon;

          return (
            <button
              key={provider.id}
              type="button"
              className="auth-oauth-button"
              onClick={() => handleOAuth(provider.id)}
              disabled={loading}
              title={`Registrarte con ${provider.label}`}
            >
              <Icon size={22} color={oauthIcon.color} />
            </button>
          );
        })}
      </div>

      <p className="auth-switch">
        Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
      </p>
    </AuthShell>
  );
}
