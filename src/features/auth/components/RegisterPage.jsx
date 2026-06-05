import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { validateEmail, validatePassword, validateUsername } from "../../../shared/utils/validators";
import { FaGoogle, FaDiscord, FaGithub } from "react-icons/fa";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";

const OAUTH_PROVIDERS = [
  { id: "google", Icon: FaGoogle, color: "#4285F4" },
  { id: "github", Icon: FaGithub, color: "#ffffff" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = () => {
    const newErrors = {
      username: validateUsername(form.username),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };
    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }
    console.log("Registrar:", form);
    navigate("/chat");
  };

  const handleOAuth = (id) => console.log("OAuth:", id);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0d0e14",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Lado izquierdo */}
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(13,14,20,0.2) 0%, rgba(13,14,20,0.6) 100%)",
            pointerEvents: "none",
          }}
        />

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
            Unete a la comunidad
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
            Crea tu cuenta en <span style={{ color: "#a78bfa" }}>Orioneta</span>
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 14,
              maxWidth: 340,
            }}
          >
            Tu universo de conexiones te espera. Registrate gratis y empieza
            hoy.
          </p>
        </div>

        <p
          style={{
            position: "relative",
            color: "rgba(255,255,255,0.3)",
            fontSize: 12,
          }}
        >
          2025 Orioneta. Hecho con amor para conectar personas.
        </p>
      </div>

      {/* Lado derecho */}
      <div
        style={{
          width: 440,
          flexShrink: 0,
          background: "#13141c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          borderLeft: "1px solid #1e2030",
        }}
      >
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
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
              Bienvenido a <span style={{ color: "#a78bfa" }}>bordo</span>
            </h1>
            <p style={{ color: "#565f89", fontSize: 14 }}>
              Crea tu cuenta gratuita
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <Input
              type="text"
              name="username"
              label="Nombre de usuario"
              placeholder="panditax"
              value={form.username}
              onChange={handleChange}
              error={errors.username}
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
              icon={<span style={{ fontSize: 15 }}>✉</span>}
            />
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              label="Contrasena"
              placeholder="Minimo 6 caracteres"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              icon={<span style={{ fontSize: 13 }}>✦</span>}
              rightElement={
                <button
                  onClick={() => setShowPassword((p) => !p)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                  }}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              }
            />
          </div>

          <Button fullWidth onClick={handleSubmit}>
            Crear cuenta
          </Button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "20px 0",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "#1e2030" }} />
            <span style={{ color: "#565f89", fontSize: 12 }}>
              o registrate con
            </span>
            <div style={{ flex: 1, height: 1, background: "#1e2030" }} />
          </div>

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
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "border-color 0.15s",
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

          <p style={{ textAlign: "center", color: "#565f89", fontSize: 13 }}>
            Ya tienes cuenta?{" "}
            <a
              href="/login"
              style={{
                color: "#a78bfa",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Inicia sesion
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
