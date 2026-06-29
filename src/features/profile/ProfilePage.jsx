import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, UserPlus } from "lucide-react";
import { findUserById } from "../../services/userService";
import { resolveProfilePhoto } from "../../services/profilePhotoService";
import { getSessionIdentity } from "../auth/session";

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    findUserById(userId)
      .then((user) => {
        if (mounted) setProfile(user);
      })
      .catch((err) => {
        if (mounted) setError("Usuario no encontrado");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [userId]);

  const currentUserId = getSessionIdentity()?.id;
  const isOwnProfile = currentUserId === userId;

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <p style={{ color: "#565f89" }}>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            <ArrowLeft size={20} />
          </button>
          <p style={{ color: "#ef4444", marginTop: 24 }}>{error || "Usuario no encontrado"}</p>
        </div>
      </div>
    );
  }

  const photoSrc = resolveProfilePhoto(profile.profilePhoto);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <ArrowLeft size={20} />
        </button>
        <span style={{ color: "#c0caf5", fontSize: 16, fontWeight: 600 }}>Perfil</span>
      </div>

      <div style={styles.content}>
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>
            {photoSrc ? (
              <img src={photoSrc} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <span style={{ color: "white", fontSize: 32, fontWeight: 600 }}>
                {(profile.displayName || profile.userName || "U")[0].toUpperCase()}
              </span>
            )}
          </div>
          <h1 style={{ color: "#c0caf5", fontSize: 22, fontWeight: 700, margin: "16px 0 4px" }}>
            {profile.displayName || profile.userName || "Usuario"}
          </h1>
          {profile.userName && (
            <p style={{ color: "#565f89", fontSize: 13, margin: 0 }}>@{profile.userName}</p>
          )}
        </div>

        {profile.bio && (
          <div style={styles.section}>
            <p style={{ color: "#a0a8c0", fontSize: 14, lineHeight: 1.5, margin: 0, textAlign: "center" }}>
              {profile.bio}
            </p>
          </div>
        )}

        <div style={styles.infoSection}>
          {profile.email && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Correo</span>
              <span style={styles.infoValue}>{profile.email}</span>
            </div>
          )}
          {profile.friendCode && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Friend Code</span>
              <span style={styles.infoValue} style={{ color: "#a78bfa" }}>{profile.friendCode}</span>
            </div>
          )}
        </div>

        {!isOwnProfile && (
          <div style={styles.actions}>
            <button
              onClick={() => navigate(`/chat?conversation=${userId}`)}
              style={styles.actionButton}
            >
              <MessageSquare size={16} />
              Enviar mensaje
            </button>
            <button style={{ ...styles.actionButton, ...styles.secondaryButton }}>
              <UserPlus size={16} />
              Agregar amigo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f1016",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px",
    borderBottom: "1px solid #1e2030",
    background: "#13141c",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: "none",
    border: "none",
    color: "#565f89",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    padding: "24px 16px",
    maxWidth: 480,
    width: "100%",
    margin: "0 auto",
  },
  avatarSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  section: {
    padding: "16px 0",
    borderBottom: "1px solid #1e2030",
    marginBottom: 16,
  },
  infoSection: {
    padding: "16px 0",
    borderBottom: "1px solid #1e2030",
    marginBottom: 16,
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
  },
  infoLabel: {
    color: "#565f89",
    fontSize: 13,
  },
  infoValue: {
    color: "#c0caf5",
    fontSize: 13,
  },
  actions: {
    display: "flex",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "12px",
    background: "#7c3aed",
    border: "none",
    borderRadius: 8,
    color: "white",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  secondaryButton: {
    background: "#1a1b26",
    border: "1px solid #1e2030",
    color: "#c0caf5",
  },
};
