import { UserRound, X } from "lucide-react";
import ProfileBadges from "../../../status/components/ProfileBadges";
import { getAvatarImage } from "./chatUtils";

export function ProfileStat({ label, value }) {
  return (
    <div style={{ minWidth: 0, padding: "10px 11px", borderRadius: 13, background: "#0d0e14", border: "1px solid #1e2030" }}>
      <p style={{ margin: 0, color: "#565f89", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</p>
      <p style={{ margin: "4px 0 0", color: "#c0caf5", fontSize: 12, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>
    </div>
  );
}

export default function FriendProfilePanel({ profile, onClose, embedded = false }) {
  const avatarImage = getAvatarImage(profile);

  return (
    <div style={{ position: embedded ? "relative" : "absolute", top: embedded ? undefined : 60, right: embedded ? undefined : 18, zIndex: embedded ? "auto" : 35, width: embedded ? "100%" : "min(360px, calc(100% - 36px))", borderRadius: embedded ? 0 : 22, overflow: "hidden", background: "#13141c", border: embedded ? "none" : "1px solid rgba(167,139,250,0.22)", boxShadow: embedded ? "none" : "0 28px 70px rgba(0,0,0,0.46)" }}>
      {/* Banner background */}
      <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.86), rgba(79,70,229,0.54))", padding: "20px 18px 44px", position: "relative" }}>
        <button type="button" onClick={onClose} title="Cerrar perfil" style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 10, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(0,0,0,0.18)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} /></button>
      </div>

      {/* Avatar - centered on the border between banner and content */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: -38 }}>
        <div style={{ width: 76, height: 76, borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", border: "4px solid #13141c", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 24, fontWeight: 900 }}>
          {avatarImage ? <img src={avatarImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : profile.avatar || profile.name?.[0] || <UserRound size={30} />}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "10px 18px 18px" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <h3 style={{ margin: 0, color: "#f8f7ff", fontSize: 18, fontWeight: 900, letterSpacing: 0 }}>{profile.name}</h3>
            <ProfileBadges badges={profile.badges} compact max={3} />
          </div>
          <p style={{ margin: "4px 0 0", color: "#8f9ac7", fontSize: 12 }}>{profile.userName || profile.email || "Perfil Orioneta"}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <ProfileStat label="Estado" value={profile.status || "Disponible"} />
          <ProfileStat label="Codigo" value={profile.friendCode || "Privado"} />
        </div>
        <div style={{ marginTop: 14, padding: 12, borderRadius: 14, background: "#0d0e14", border: "1px solid #1e2030" }}>
          <p style={{ margin: 0, color: "#c0caf5", fontSize: 13, lineHeight: 1.45 }}>{profile.bio || "Aun no ha escrito una biografia."}</p>
        </div>
      </div>
    </div>
  );
}
