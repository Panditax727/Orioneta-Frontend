import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AuthLayout from "./AuthLayout";
import { forgotPassword } from "../../../services/authService";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await forgotPassword(email);
      setMessage(response.message || "Código enviado correctamente");
      setTimeout(() => navigate("/verify-code", { state: { email } }), 2000);
    } catch (err) {
      setError(
        err.message ||
          "Ocurrió un error al enviar el código. Por favor, intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout variant="forgot">
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => navigate("/login")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "transparent", border: "none", color: "#9aa5ce",
            cursor: "pointer", fontSize: 14, marginBottom: 24, padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#b599ff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9aa5ce")}
        >
          <ArrowLeft size={16} />
          Volver al login
        </button>
        <h2 style={{ color: "white", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          ¿Olvidaste tu contraseña?
        </h2>
        <p style={{ color: "#9aa5ce", fontSize: 14 }}>
          Ingresa tu correo electrónico para recibir un código de recuperación
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={{ display: "block", color: "#9aa5ce", fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
            Correo Electrónico
          </label>
          <input
            type="email"
            required
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%", padding: "14px 16px", background: "#1a1b26",
              border: "1px solid #2f3147", borderRadius: 10, color: "white",
              fontSize: 14, outline: "none", boxSizing: "border-box", transition: "all 0.3s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#7c3aed";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#2f3147";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {message && (
          <div style={{ padding: "12px 16px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 10, color: "#10b981", fontSize: 13 }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: "#ef4444", fontSize: 13 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", padding: "14px", borderRadius: 10,
            background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            color: "white", fontSize: 14, fontWeight: 600,
            boxShadow: "0 4px 15px rgba(124,58,237,0.25)",
            opacity: loading ? 0.6 : 1, transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.boxShadow = "0 8px 25px rgba(124,58,237,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(124,58,237,0.25)";
          }}
        >
          {loading ? "Enviando código..." : "Enviar Código de Verificación"}
        </button>
      </form>
    </AuthLayout>
  );
}
