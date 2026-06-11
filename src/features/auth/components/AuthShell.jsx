import { Link } from "react-router-dom";
import heroImage from "../../../assets/Orioneta-Hero.png";
import logoImage from "../../../assets/logo.png";

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  features = [],
  children,
}) {
  return (
    <main className="auth-page">
      <section
        className="auth-hero"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="auth-hero-overlay" />

        <div className="auth-brand">
          <div className="auth-brand-logo">
            <img src={logoImage} alt="Orioneta" />
          </div>
          <span>Orioneta</span>
        </div>

        <div className="auth-hero-content">
          <p className="auth-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>

          {features.length > 0 && (
            <div className="auth-features">
              {features.map((feature) => (
                <article className="auth-feature" key={feature.title}>
                  <div className="auth-feature-icon">{feature.icon}</div>
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <p className="auth-footer">
          © 2026 Orioneta. Hecho para conectar personas.
          <Link to="/privacidad">Privacidad y datos</Link>
        </p>
      </section>

      <section className="auth-panel">
        <div className="auth-card">{children}</div>
      </section>
    </main>
  );
}
