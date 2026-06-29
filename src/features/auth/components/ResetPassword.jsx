import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Check, X } from "lucide-react";
import AuthLayout from "./AuthLayout";
import { resetPassword } from "../../../services/authService";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const code = location.state?.code || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const rules = [
    { label: "Al menos 8 caracteres",  test: (p) => p.length >= 8 },
    { label: "Una letra mayúscula",     test: (p) => /[A-Z]/.test(p) },
    { label: "Un número",               test: (p) => /[0-9]/.test(p) },
    { label: "Un símbolo (!@#$...)",    test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    const passed = rules.filter((r) => r.test(pwd)).length;
    if (passed <= 2) return { label: "Débil",  color: "#ef4444", width: "33%" };
    if (passed === 3) return { label: "Media",  color: "#f59e0b", width: "66%" };
    return               { label: "Fuerte", color: "#10b981", width: "100%" };
  };

  const validatePassword = (pwd) => {
    for (const rule of rules) {
      if (!rule.test(pwd)) return `Falta: ${rule.label.toLowerCase()}`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    const validationError = validatePassword(newPassword);
    if (validationError) { setError(validationError); setLoading(false); return; }
    if (newPassword !== confirmPassword) { setError("Las contraseñas no coinciden"); setLoading(false); return; }
    try {
      const response = await resetPassword({ email, token: code, newPassword });
      setMessage(response.message || "Contraseña actualizada correctamente");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Error al actualizar la contraseña. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(newPassword);

  const inputWrapperStyle = { position: "relative" };

  const inputStyle = {
    width: "100%", padding: "14px 48px 14px 16px", background: "#1a1b26",
    border: "1px solid #2f3147", borderRadius: 10, color: "white",
    fontSize: 14, outline: "none", boxSizing: "border-box", transition: "all 0.3s ease",
  };

  const toggleBtnStyle = {
    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
    background: "transparent", border: "none", cursor: "pointer",
    color: "#9aa5ce", display: "flex", alignItems: "center", padding: 0,
  };

  return (
    <AuthLayout variant="reset" heroEmail={email}>
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => navigate("/verify-code")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "transparent", border: "none", color: "#9aa5ce",
            cursor: "pointer", fontSize: 14, marginBottom: 24, padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#34d399")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9aa5ce")}
        >
          <ArrowLeft size={16} />
          Volver
        </button>
        <h2 style={{ color: "white", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          Nueva Contraseña
        </h2>
        <p style={{ color: "#9aa5ce", fontSize: 14 }}>
          Establece tu nueva contraseña para completar la recuperación
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Campo nueva contraseña */}
        <div>
          <label style={{ display: "block", color: "#9aa5ce", fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
            Nueva Contraseña
          </label>
          <div style={inputWrapperStyle}>
            <input
              type={showNew ? "text" : "password"}
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#10b981";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#2f3147";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              style={toggleBtnStyle}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#9aa5ce")}
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Barra de fortaleza */}
          {newPassword && strength && (
            <div style={{ marginTop: 8 }}>
              <div style={{ height: 4, borderRadius: 999, background: "#2f3147", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: strength.width, background: strength.color,
                  borderRadius: 999, transition: "width 0.3s ease, background 0.3s ease",
                }} />
              </div>
              <p style={{ fontSize: 12, color: strength.color, marginTop: 4, textAlign: "right" }}>
                {strength.label}
              </p>
            </div>
          )}

        {/* Campo confirmar contraseña */}
        <div>
          <label style={{ display: "block", color: "#9aa5ce", fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
            Confirmar Contraseña
          </label>
          <div style={inputWrapperStyle}>
            <input
              type={showConfirm ? "text" : "password"}
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#10b981";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#2f3147";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={toggleBtnStyle}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#9aa5ce")}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Checklist de requisitos */}
          {newPassword && (
            <div style={{
              marginTop: 12, padding: "12px 14px",
              background: "#12131e", border: "1px solid #2f3147",
              borderRadius: 10, display: "flex", flexDirection: "column", gap: 6,
            }}>
              {rules.map((rule) => {
                const passed = rule.test(newPassword);
                return (
                  <div key={rule.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: passed ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.1)",
                      border: `1px solid ${passed ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.3)"}`,
                    }}>
                      {passed
                        ? <Check size={11} color="#10b981" strokeWidth={3} />
                        : <X size={11} color="#ef4444" strokeWidth={3} />
                      }
                    </div>
                    <span style={{ fontSize: 12, color: passed ? "#10b981" : "#ef4444" }}>
                      {rule.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

          {/* Indicador de coincidencia */}
          {confirmPassword && (
            <p style={{
              fontSize: 12, marginTop: 6,
              color: confirmPassword === newPassword ? "#10b981" : "#ef4444",
            }}>
              {confirmPassword === newPassword ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
            </p>
          )}
        </div>

        {message && (
          <div style={{ padding: "12px 16px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 10, color: "#10b981", fontSize: 13 }}>
            {message} Redirigiendo al login...
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
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            color: "white", fontSize: 14, fontWeight: 600,
            boxShadow: "0 4px 15px rgba(16,185,129,0.25)",
            opacity: loading ? 0.6 : 1, transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.boxShadow = "0 8px 25px rgba(16,185,129,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(16,185,129,0.25)";
          }}
        >
          {loading ? "Actualizando..." : "Actualizar Contraseña"}
        </button>
      </form>
    </AuthLayout>
  );
}