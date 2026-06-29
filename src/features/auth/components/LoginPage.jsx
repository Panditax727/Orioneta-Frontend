import { Eye, EyeOff, Lock, MessageCircle, Palette, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import logoImage from "../../../assets/logo.png";
import {
  DEFAULT_OAUTH_PROVIDERS,
  getOAuthProviders,
  login,
  mergeOAuthProviders,
  redirectToOAuth,
} from "../../../services/authService";
import { ensureCurrentUserProfile } from "../../../services/userService";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import Loader from "../../../shared/components/Loader";
import {
  validateEmail,
  validateRequiredPassword,
} from "../../../shared/utils/validators";
import { saveSession } from "../session";
import AuthShell from "./AuthShell";

const LOGIN_FEATURES = [
  {
    icon: <MessageCircle size={24} />,
    title: "Conversaciones vivas",
    description: "Mensajes, archivos y presencia para hablar sin friccion.",
  },
  {
    icon: <Users size={24} />,
    title: "Tu circulo, sin ruido",
    description: "Chats privados y grupos cerrados para la gente que eliges.",
  },
  {
    icon: <Lock size={24} />,
    title: "Acceso seguro",
    description: "Entra con correo, Google o GitHub manteniendo tu cuenta protegida.",
  },
  {
    icon: <Palette size={24} />,
    title: "Un espacio con estilo",
    description: "Personaliza perfil, temas y detalles para sentirlo tuyo.",
  },
];

const OAUTH_ICONS = {
  google: { Icon: FaGoogle, color: "#ffffff" },
  github: { Icon: FaGithub, color: "#ffffff" },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthProviders, setOauthProviders] = useState(DEFAULT_OAUTH_PROVIDERS);

  useEffect(() => {
    getOAuthProviders()
      .then((providers) => setOauthProviders(mergeOAuthProviders(providers)))
      .catch(() => setOauthProviders(mergeOAuthProviders()));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: null }));
    setApiError("");
  };

  const validateForm = () => {
    const nextErrors = {
      email: validateEmail(form.email),
      password: validateRequiredPassword(form.password),
    };

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const session = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      saveSession(session);
      await ensureCurrentUserProfile({
        email: form.email.trim().toLowerCase(),
      }).catch((error) => {
        console.warn("No se pudo preparar el perfil publico:", error);
      });
      navigate("/chat");
    } catch (error) {
      setApiError(error.message || "No se pudo iniciar sesion");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (providerId) => {
    if (loading) {
      return;
    }

    try {
      redirectToOAuth(providerId, oauthProviders);
    } catch (error) {
      setApiError(error.message || "No se pudo continuar con ese proveedor");
    }
  };

  return (
    <AuthShell
      eyebrow={
        <>
          Conecta. <span>Comunica.</span> Personaliza.
        </>
      }
      title={
        <>
          Bienvenido a <span>Orioneta</span>
        </>
      }
      subtitle={
        <>
          Mas que mensajeria, es tu universo de conexiones privadas y grupos
          personalizables.
        </>
      }
      features={LOGIN_FEATURES}
    >
      <div className="auth-card-header">
        <div className="auth-logo-large">
          <img src={logoImage} alt="Orioneta" />
        </div>
        <h1>
          Hola de <span>nuevo</span>
        </h1>
        <p>Vuelve a tus conversaciones</p>
      </div>

      {apiError && <div className="auth-alert">{apiError}</div>}

      <form className="auth-form" onSubmit={handleLogin}>
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
          icon={<span style={{ color: "#565f89", fontSize: 14 }}>✉</span>}
        />

        <Input
          type={showPassword ? "text" : "password"}
          name="password"
          label="Contrasena"
          placeholder="Tu contrasena"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          disabled={loading}
          autoComplete="current-password"
          maxLength={120}
          icon={<span style={{ fontSize: 13 }}>✦</span>}
          rightElement={
            <button
              type="button"
              aria-label={
                showPassword ? "Ocultar contrasena" : "Ver contrasena"
              }
              onClick={() => setShowPassword((current) => !current)}
              className="auth-input-icon-button"
              disabled={loading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link to="/forgot-password" style={{ color: "#9aa5ce", fontSize: 13, textDecoration: "none" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#b599ff"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#9aa5ce"}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button fullWidth type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader size={16} color="white" />
              Iniciando...
            </>
          ) : (
            "Iniciar sesion"
          )}
        </Button>
      </form>

      <div className="auth-divider">
        <span />
        <p>o entra con</p>
        <span />
      </div>

      <div className="auth-oauth-grid">
        {oauthProviders.map((provider) => {
          const oauthIcon = OAUTH_ICONS[provider.id] || OAUTH_ICONS.github;
          const Icon = oauthIcon.Icon;

          return (
            <button
              key={provider.id}
              type="button"
              className="auth-oauth-button"
              onClick={() => handleOAuth(provider.id)}
              disabled={loading || provider.enabled === false}
              title={`Continuar con ${provider.label}`}
            >
              <Icon size={22} color={oauthIcon.color} />
              <span>{provider.label}</span>
            </button>
          );
        })}
      </div>

      <p className="auth-switch">
        No tienes cuenta? <Link to="/register">Crear cuenta</Link>
      </p>

      <p className="auth-legal-copy">
        Al continuar aceptas nuestro{" "}
        <Link to="/privacidad">Acuerdo de privacidad y datos</Link>.
      </p>
    </AuthShell>
  );
}
