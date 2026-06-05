import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, MessageCircle, Users, Lock, Cloud } from "lucide-react";
import { FaGoogle, FaDiscord, FaGithub } from "react-icons/fa";
import Loader from "../../../shared/components/Loader";

const OAUTH_PROVIDERS = [
  { id: "google", Icon: FaGoogle, color: "#4285F4" },
  { id: "github", Icon: FaGithub, color: "#ffffff" },
];

const FEATURES = [
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Mensajería en tiempo real",
    desc: "Envía mensajes, archivos y stickers al instante.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Grupos y comunidades",
    desc: "Crea grupos, organiza equipos y comparte ideas.",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Seguro y privado",
    desc: "Tus conversaciones están protegidas con cifrado de extremo a extremo.",
  },
  {
    icon: <Cloud className="w-6 h-6" />,
    title: "En la nube",
    desc: "Accede desde cualquier dispositivo, en cualquier lugar.",
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOAuth = (id) => {
    console.log("OAuth:", id);
  };

  const handleLogin = async (e) => {
    e?.preventDefault();

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate("/chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0d0e14",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* ── LADO IZQUIERDO — hero ── */}
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "32px",
          background:
            "url('/src/assets/Orioneta-Hero.png') center/cover no-repeat",
        }}
      >
        {/* Overlay oscuro para legibilidad */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(13,14,20,0.2) 0%, rgba(13,14,20,0.6) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Navbar izquierdo */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <img
              src="/src/assets/logo.png"
              style={{ width: "90%", height: "90%", objectFit: "contain" }}
              alt="Orioneta"
            />
          </div>
          <span style={{ color: "white", fontWeight: 600, fontSize: 18 }}>
            Orioneta
          </span>
        </div>

        {/* Contenido central izquierdo */}
        <div style={{ position: "relative" }}>
          <p
            style={{
              display: "inline-block",
              padding: "6px 16px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.8)",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            Conecta. <span style={{ color: "#a78bfa" }}>Comunica.</span>{" "}
            Colabora.
          </p>

          <h2
            style={{
              color: "white",
              fontSize: 32,
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            Bienvenido a <span style={{ color: "#a78bfa" }}>Orioneta</span>
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 14,
              marginBottom: 32,
              maxWidth: 340,
            }}
          >
            Más que mensajería, es tu universo de conexiones.
            <br />
            ¡Únete y forma parte de algo increíble! 🚀
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  backdropFilter: "blur(8px)",
                  maxWidth: 360,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "rgba(124,58,237,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {f.icon}
                </div>
                <div>
                  <p
                    style={{
                      color: "white",
                      fontWeight: 600,
                      fontSize: 13,
                      marginBottom: 2,
                    }}
                  >
                    {f.title}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer izquierdo */}
        <p
          style={{
            position: "relative",
            color: "rgba(255,255,255,0.3)",
            fontSize: 12,
          }}
        >
          © 2025 Orioneta. Hecho con 💜 para conectar personas.
        </p>
      </div>

      {/* ── LADO DERECHO — form ── */}
      <div
        style={{
          width: 440,
          flexShrink: 0,
          background: "#13141c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 40px",
          borderLeft: "1px solid #1e2030",
        }}
      >
        <div style={{ width: "100%", maxWidth: 360 }}>
          {/* Avatar decorativo */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                border: "3px solid #7c3aed",
                background: "linear-gradient(135deg, #1a1b26, #2d2f45)",
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <img
                src="/src/assets/logo.png"
                style={{ width: "80%", height: "80%", objectFit: "contain" }}
                alt="Orioneta"
              />
            </div>
            <h1
              style={{
                color: "white",
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              ¡Hola de <span style={{ color: "#a78bfa" }}>nuevo!</span>
            </h1>
            <p style={{ color: "#565f89", fontSize: 14 }}>
              Inicia sesión en tu cuenta de Orioneta
            </p>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                color: "#c0caf5",
                fontSize: 13,
                fontWeight: 500,
                display: "block",
                marginBottom: 8,
              }}
            >
              Correo electrónico
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#565f89",
                  fontSize: 16,
                }}
              >
                ✉
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@orioneta.com"
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 40px",
                  background: "#1a1b26",
                  border: "1px solid #1e2030",
                  borderRadius: 12,
                  color: "#c0caf5",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                onBlur={(e) => (e.target.style.borderColor = "#1e2030")}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <label
                style={{ color: "#c0caf5", fontSize: 13, fontWeight: 500 }}
              >
                Contraseña
              </label>
              <a
                href="/forgot-password"
                style={{
                  color: "#a78bfa",
                  fontSize: 12,
                  textDecoration: "none",
                }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#565f89",
                  fontSize: 14,
                }}
              >
                ✦
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                style={{
                  width: "100%",
                  padding: "12px 44px 12px 40px",
                  background: "#1a1b26",
                  border: "1px solid #1e2030",
                  borderRadius: 12,
                  color: "#c0caf5",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                onBlur={(e) => (e.target.style.borderColor = "#1e2030")}
              />
              <button
                onClick={() => setShowPassword((p) => !p)}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.8 : 1,
                  color: "#565f89",
                  fontSize: 16,
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Botón login */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              border: "none",
              borderRadius: 12,
              color: "white",
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.8 : 1,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {loading ? (
              <>
                <Loader size={16} color="white" />
                Iniciando...
              </>
            ) : (
              "Iniciar sesión →"
            )}
          </button>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div style={{ flex: 1, height: 1, background: "#1e2030" }} />
            <span style={{ color: "#565f89", fontSize: 12 }}>
              o continúa con
            </span>
            <div style={{ flex: 1, height: 1, background: "#1e2030" }} />
          </div>

          {/* OAuth buttons */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            {OAUTH_PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleOAuth(p.id)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#1a1b26",
                  border: "1px solid #1e2030",
                  borderRadius: 12,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.8 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#7c3aed";
                  e.currentTarget.style.background = "#1e2030";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#1e2030";
                  e.currentTarget.style.background = "#1a1b26";
                }}
              >
                <p.Icon size={22} color={p.color} />
              </button>
            ))}
          </div>

          {/* Registro */}
          <p style={{ textAlign: "center", color: "#565f89", fontSize: 13 }}>
            ¿No tienes cuenta?{" "}
            <a
              href="/register"
              style={{
                color: "#a78bfa",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Crear cuenta ↗
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
