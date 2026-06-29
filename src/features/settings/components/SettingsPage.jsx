import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clearSession } from "../../auth/session";
import SettingsPanel from "./SettingsPanel";

export default function SettingsPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0c12",
        color: "#c0caf5",
      }}
    >
      <header
        style={{
          height: 58,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 22px",
          borderBottom: "1px solid #1e2030",
          background: "#10111a",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/chat")}
          style={{
            height: 34,
            borderRadius: 8,
            border: "1px solid #1e2030",
            background: "#171824",
            color: "#c0caf5",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "0 12px",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <ArrowLeft size={15} />
          Volver al chat
        </button>

        <span style={{ color: "#565f89", fontSize: 12, fontWeight: 700 }}>
          Configuracion de Orioneta
        </span>
      </header>

      <SettingsPanel
        onLogout={handleLogout}
        style={{ height: "calc(100vh - 58px)", borderLeft: "none" }}
      />
    </div>
  );
}
