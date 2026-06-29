import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
      textAlign: "center",
      padding: "40px",
    }}>

      {/* Número 404 grande */}
      <div style={{
        fontSize: 120,
        fontWeight: 700,
        lineHeight: 1,
        marginBottom: 8,
        background: "linear-gradient(135deg, var(--accent), #4f46e5)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>
        404
      </div>

      {/* Logo */}
      <img
        src="/logo.png"
        style={{ width: 64, height: 64, objectFit: "contain", marginBottom: 24, opacity: 0.6 }}
        alt="Orioneta"
      />

      <h1 style={{ color: "var(--text-primary)", fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
        Esta página no existe
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 40, maxWidth: 340 }}>
        Parece que te perdiste en el universo de Orioneta. La página que buscas no existe o fue movida.
      </p>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "12px 24px",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 12,
            color: "var(--text-primary)",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
        >
          Volver atrás
        </button>
        <button
          onClick={() => navigate("/chat")}
          style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg, var(--accent), #4f46e5)",
            border: "none",
            borderRadius: 12,
            color: "white",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          Ir al chat
        </button>
      </div>

      {/* Estrellas decorativas */}
      {[
        { top: "15%", left: "10%", size: 3 },
        { top: "25%", left: "80%", size: 2 },
        { top: "70%", left: "15%", size: 2 },
        { top: "60%", left: "85%", size: 3 },
        { top: "40%", left: "5%",  size: 2 },
        { top: "80%", left: "70%", size: 2 },
        { top: "10%", left: "60%", size: 3 },
      ].map((s, i) => (
        <div key={i} style={{
          position: "fixed",
          top: s.top, left: s.left,
          width: s.size, height: s.size,
          borderRadius: "50%",
          background: "var(--accent)",
          opacity: 0.4,
          pointerEvents: "none",
        }} />
      ))}
    </div>
  );
}