import { MessageCircle, Users, Lock, Cloud, Mail, ShieldCheck, CheckCircle } from "lucide-react";

const FEATURES = [
  {
    icon: <MessageCircle className="w-5 h-5" />,
    title: "Mensajería en tiempo real",
    desc: "Envía mensajes, archivos y stickers al instante.",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Grupos y comunidades",
    desc: "Crea grupos, organiza equipos y comparte ideas.",
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "Seguro y privado",
    desc: "Tus conversaciones están protegidas con cifrado de extremo a extremo.",
  },
  {
    icon: <Cloud className="w-5 h-5" />,
    title: "En la nube",
    desc: "Accede desde cualquier dispositivo, en cualquier lugar.",
  },
];

export default function AuthLayout({ children, title, subtitle, variant = "login", heroEmail }) {
  const noHeaderVariants = ["forgot", "verify", "reset"];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0d0e14",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* ── SECCIÓN IZQUIERDA: HERO VISUAL ── */}
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          background: "url('/src/assets/Orioneta-Hero.png') center/cover no-repeat",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(13,14,20,0.2), rgba(13,14,20,0.6))",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <img src="/logo.png" style={{ width: "75%", height: "75%", objectFit: "contain" }} alt="Logo" />
          </div>
          <span style={{ color: "white", fontWeight: 700, fontSize: 20, letterSpacing: "0.5px" }}>
            Orioneta
          </span>
        </div>

        {/* CONTENIDO CENTRAL DINÁMICO */}
        <div style={{ position: "relative", maxWidth: "460px", zIndex: 2 }}>

          {/* REGISTER */}
          {variant === "register" && (
            <>
              <p style={{
                display: "inline-block", padding: "6px 16px", borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)",
                fontSize: 13, marginBottom: 20, background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(8px)", fontWeight: 500,
              }}>
                Únete a la comunidad
              </p>
              <h2 style={{ color: "white", fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 16, letterSpacing: "-0.5px" }}>
                Crea tu cuenta en <span style={{ color: "#b599ff" }}>Orioneta</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.5 }}>
                Tu universo de conexiones te espera. Regístrate gratis y empieza hoy.
              </p>
            </>
          )}

          {/* FORGOT */}
          {variant === "forgot" && (
            <>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 64, height: 64, borderRadius: "20px",
                background: "rgba(139, 92, 246, 0.2)", border: "1px solid rgba(139, 92, 246, 0.3)",
                color: "#c084fc", marginBottom: 24,
              }}>
                <Lock size={28} />
              </div>
              <h2 style={{ color: "white", fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 16, letterSpacing: "-0.5px" }}>
                Recupera tu <span style={{ color: "#b599ff" }}>cuenta</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.5, marginBottom: 28 }}>
                No te preocupes. Te guiaremos paso a paso para restablecer tu contraseña de forma segura.
              </p>
              <div style={{
                display: "flex", alignItems: "center", gap: 16,
                background: "rgba(15, 16, 26, 0.45)", border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 16, padding: "16px", backdropFilter: "blur(16px)",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.25)",
                  color: "#34d399", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Mail size={20} />
                </div>
                <div>
                  <p style={{ color: "white", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Verificación por correo</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 1.4 }}>
                    Te enviaremos un código de seguridad de 6 dígitos para validar tu identidad.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* VERIFY */}
          {variant === "verify" && (
            <>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 64, height: 64, borderRadius: "20px",
                background: "rgba(139, 92, 246, 0.2)", border: "1px solid rgba(139, 92, 246, 0.3)",
                color: "#c084fc", marginBottom: 24,
              }}>
                <ShieldCheck size={28} />
              </div>
              <h2 style={{ color: "white", fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 16, letterSpacing: "-0.5px" }}>
                Verifica tu <span style={{ color: "#b599ff" }}>código</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.5, marginBottom: 28 }}>
                Ingresa el código de 6 dígitos que enviamos a tu correo para continuar con la recuperación.
              </p>
              <div style={{
                display: "flex", alignItems: "center", gap: 16,
                background: "rgba(15, 16, 26, 0.45)", border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 16, padding: "16px", backdropFilter: "blur(16px)",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.25)",
                  color: "#34d399", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p style={{ color: "white", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Código enviado a</p>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, lineHeight: 1.4, fontWeight: 500 }}>
                    {heroEmail}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* RESET */}
          {variant === "reset" && (
            <>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 64, height: 64, borderRadius: "20px",
                background: "rgba(16, 185, 129, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#34d399", marginBottom: 24,
              }}>
                <CheckCircle size={28} />
              </div>
              <h2 style={{ color: "white", fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 16, letterSpacing: "-0.5px" }}>
                Crea tu nueva <span style={{ color: "#34d399" }}>contraseña</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.5, marginBottom: 28 }}>
                Tu código ha sido verificado. Ahora establece una contraseña segura para proteger tu cuenta.
              </p>
              <div style={{
                display: "flex", alignItems: "center", gap: 16,
                background: "rgba(15, 16, 26, 0.45)", border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 16, padding: "16px", backdropFilter: "blur(16px)",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.25)",
                  color: "#34d399", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p style={{ color: "white", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Código verificado</p>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, lineHeight: 1.4, fontWeight: 500 }}>
                    {heroEmail}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* LOGIN */}
          {variant === "login" && (
            <>
              <p style={{
                display: "inline-block", padding: "6px 16px", borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)",
                fontSize: 13, marginBottom: 20, background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(8px)", fontWeight: 500,
              }}>
                Conecta. <span style={{ color: "#b599ff", fontWeight: 600 }}>Comunica.</span> Colabora.
              </p>
              <h2 style={{ color: "white", fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 32, letterSpacing: "-0.5px" }}>
                Lleva tus comunidades al <span style={{ color: "#b599ff" }}>siguiente nivel</span>
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {FEATURES.map((f) => (
                  <div key={f.title} style={{
                    display: "flex", alignItems: "center", gap: 16,
                    background: "rgba(15, 16, 26, 0.45)", border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 16, padding: "16px", backdropFilter: "blur(16px)",
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: "rgba(139, 92, 246, 0.2)", border: "1px solid rgba(139, 92, 246, 0.3)",
                      color: "#c084fc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {f.icon}
                    </div>
                    <div>
                      <p style={{ color: "white", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{f.title}</p>
                      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 1.4 }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <p style={{ position: "relative", color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 500, margin: 0 }}>
          {variant === "register"
            ? "© 2026 Orioneta. Hecho con amor para conectar personas."
            : "© 2026 Orioneta. Todos los derechos reservados."
          }
        </p>
      </div>

      {/* ── SECCIÓN DERECHA: FORMULARIOS ── */}
      <div
        style={{
          width: "500px",
          flexShrink: 0,
          background: "#13141f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          borderLeft: "1px solid #1e2030",
        }}
      >
        <div style={{ width: "100%", maxWidth: "380px" }}>

          {/* Header con logo — solo en login y register */}
          {!noHeaderVariants.includes(variant) && (
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{
                width: 72, height: 72, borderRadius: "20px",
                background: "#1a1b26", border: "1px solid #2f3147",
                margin: "0 auto 16px", display: "flex", alignItems: "center",
                justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              }}>
                <img src="/logo.png" style={{ width: "65%", height: "65%", objectFit: "contain" }} alt="Logo" />
              </div>
              <h1 style={{ color: "white", fontSize: 26, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.5px" }}>
                {title}
              </h1>
              <p style={{ color: "#9aa5ce", fontSize: 14, lineHeight: 1.5, padding: "0 10px" }}>
                {subtitle}
              </p>
            </div>
          )}

          {children}

        </div>
      </div>
    </div>
  );
}

