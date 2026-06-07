import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../../../shared/components/Loader";
import { ensureCurrentUserProfile } from "../../../services/userService";
import { saveSession } from "../session";

function readOAuthParams() {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const queryParams = new URLSearchParams(window.location.search);
  const params = hashParams.size > 0 ? hashParams : queryParams;
  const getParam = (...names) => {
    for (const name of names) {
      const value = params.get(name) || queryParams.get(name);

      if (value) {
        return value;
      }
    }

    return null;
  };

  return {
    accessToken: getParam("accessToken", "access_token"),
    refreshToken: getParam("refreshToken", "refresh_token"),
    tokenType: getParam("tokenType", "token_type") || "Bearer",
    expiresIn: getParam("expiresIn", "expiresInSeconds", "expires_in"),
    userId: getParam("userId", "user_id"),
    profileUserId: getParam("profileUserId", "profile_user_id"),
    email: getParam("email"),
    role: getParam("role") || "USER",
    error: getParam("error", "error_description"),
  };
}

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const oauthParams = useMemo(() => readOAuthParams(), []);

  useEffect(() => {
    if (oauthParams.error) {
      return;
    }

    if (!oauthParams.accessToken || !oauthParams.refreshToken) {
      return;
    }

    saveSession(oauthParams);
    ensureCurrentUserProfile({ email: oauthParams.email })
      .catch((error) => {
        console.warn("No se pudo preparar el perfil publico:", error);
      })
      .finally(() => navigate("/chat", { replace: true }));
  }, [navigate, oauthParams]);

  if (oauthParams.error || !oauthParams.accessToken) {
    return (
      <main className="auth-message-page">
        <div className="auth-message-card">
          <h1>No pudimos iniciar sesion</h1>
          <p>
            {oauthParams.error ||
              "El proveedor no devolvio una sesion valida para Orioneta."}
          </p>
          <Link to="/login">Volver al login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-message-page">
      <div className="auth-message-card">
        <Loader size={24} color="#a78bfa" />
        <h1>Preparando tu sesion</h1>
        <p>Estamos conectando tu cuenta con Orioneta.</p>
      </div>
    </main>
  );
}
