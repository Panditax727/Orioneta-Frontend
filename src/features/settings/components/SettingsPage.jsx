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
    <main
      style={{
        minHeight: "100vh",
        background: "#0d0e14",
        color: "#c0caf5",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 1040,
          height: "calc(100vh - 48px)",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/chat")}
          style={{
            width: "fit-content",
            height: 36,
            borderRadius: 8,
            border: "1px solid #1e2030",
            background: "#13141c",
            color: "#c0caf5",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "0 12px",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          <ArrowLeft size={15} />
          Volver al chat
        </button>

        <SettingsPanel
          onLogout={handleLogout}
          style={{
            width: "100%",
            minHeight: 0,
            flex: 1,
            border: "1px solid #1e2030",
            borderRadius: 10,
            overflow: "hidden",
          }}
        />
      </div>
    </main>
  );
}
