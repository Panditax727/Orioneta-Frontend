import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import AuthLayout from "./AuthLayout";
import { verifyResetCode, forgotPassword } from "../../../services/authService";

export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    const code = codeDigits.join("");
    try {
      await verifyResetCode(email, code);
      setMessage("Código verificado correctamente");
      setTimeout(() => navigate("/reset-password", { state: { email, code } }), 1000);
    } catch (err) {
      setError(err.message || "Código inválido o expirado. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await forgotPassword(email);
      setMessage("Nuevo código enviado a tu correo");
      setError("");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setError("Error al reenviar el código. Por favor, intenta nuevamente.");
    }
  };

  const handleDigitChange = (index, value) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length <= 1) {
      const newDigits = [...codeDigits];
      newDigits[index] = numericValue;
      setCodeDigits(newDigits);
      if (numericValue && index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = [...codeDigits];
    for (let i = 0; i < pastedData.length; i++) newDigits[i] = pastedData[i];
    setCodeDigits(newDigits);
    const nextEmpty = newDigits.findIndex((d) => d === "");
    inputRefs.current[nextEmpty !== -1 ? nextEmpty : 5]?.focus();
  };

  const allFilled = codeDigits.every((d) => d !== "");

  return (
    <AuthLayout variant="verify" heroEmail={email}>
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => navigate("/forgot-password")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "transparent", border: "none", color: "#9aa5ce",
            cursor: "pointer", fontSize: 14, marginBottom: 24, padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#b599ff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9aa5ce")}
        >
          <ArrowLeft size={16} />
          Volver
        </button>
        <h2 style={{ color: "white", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          Ingresa el código
        </h2>
        <p style={{ color: "#9aa5ce", fontSize: 14 }}>
          Código de 6 dígitos enviado a tu correo
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={{ display: "block", color: "#9aa5ce", fontSize: 13, marginBottom: 12, fontWeight: 500 }}>
            Código de verificación
          </label>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            {codeDigits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                required
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                style={{
                  width: 50, height: 60, background: "#1a1b26",
                  border: "2px solid #2f3147", borderRadius: 12,
                  color: "white", fontSize: 28, fontWeight: 700,
                  textAlign: "center", outline: "none",
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#8b5cf6";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(139, 92, 246, 0.2)";
                  e.currentTarget.style.background = "#1e1f2e";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#2f3147";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#1a1b26";
                }}
              />
            ))}
          </div>
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
          disabled={loading || !allFilled}
          style={{
            width: "100%", padding: "14px", borderRadius: 10,
            background: allFilled ? "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)" : "#1a1b26",
            border: allFilled ? "none" : "1px solid #2f3147",
            cursor: loading || !allFilled ? "not-allowed" : "pointer",
            color: allFilled ? "white" : "#9aa5ce",
            fontSize: 14, fontWeight: 600,
            boxShadow: allFilled ? "0 4px 15px rgba(124,58,237,0.25)" : "none",
            opacity: loading ? 0.6 : 1,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (!loading && allFilled) e.currentTarget.style.boxShadow = "0 8px 25px rgba(124,58,237,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = allFilled ? "0 4px 15px rgba(124,58,237,0.25)" : "none";
          }}
        >
          {loading ? "Verificando..." : "Verificar Código"}
        </button>

        <button
          type="button"
          onClick={handleResendCode}
          style={{
            width: "100%", padding: "12px", borderRadius: 10,
            background: "transparent", border: "1px solid #2f3147",
            cursor: "pointer", color: "#9aa5ce", fontSize: 13,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#7c3aed";
            e.currentTarget.style.color = "#b599ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#2f3147";
            e.currentTarget.style.color = "#9aa5ce";
          }}
        >
          <RefreshCw size={14} />
          Reenviar código
        </button>
      </form>
    </AuthLayout>
  );
}
