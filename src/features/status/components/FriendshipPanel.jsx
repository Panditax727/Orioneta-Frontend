import { useMemo, useState } from "react";
import { Check, Copy, UserPlus, X } from "lucide-react";
import FriendsList from "./FriendsList";
import UserProfile from "./UserProfile";
import { usePresence } from "../hooks/usePresence";
import { copyToClipboard } from "../../../shared/utils/helpers";

function requestUserName(request, direction) {
  const user = direction === "received" ? request.sender : request.receiver;
  return user?.displayName || user?.userName || user?.email || "Usuario";
}

function pendingOnly(request) {
  return request.status === "PENDING";
}

export default function FriendshipPanel({ onFriendClick, onOpenSettings, style }) {
  const {
    friends,
    userProfile,
    requests,
    loading,
    error,
    updateStatus,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
  } = usePresence();

  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const receivedRequests = useMemo(
    () => requests.received.filter(pendingOnly),
    [requests.received],
  );

  const sentRequests = useMemo(
    () => requests.sent.filter(pendingOnly),
    [requests.sent],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!target.trim()) {
      return;
    }

    try {
      setBusy(true);
      setNotice("");
      await sendFriendRequest(target);
      setTarget("");
      setNotice("Solicitud enviada");
    } catch (requestError) {
      setNotice(requestError.message || "No se pudo enviar la solicitud");
    } finally {
      setBusy(false);
    }
  };

  const handleCopyFriendCode = async () => {
    if (!userProfile?.friendCode) {
      return;
    }

    const copied = await copyToClipboard(userProfile.friendCode);
    setNotice(copied ? "Friend code copiado" : "No se pudo copiar");
  };

  const runRequestAction = async (action, successMessage) => {
    try {
      setBusy(true);
      setNotice("");
      const result = await action();
      setNotice(successMessage);
      return result;
    } catch (requestError) {
      setNotice(requestError.message || "No se pudo actualizar la solicitud");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const handleOpenFriend = (friend) => {
    const friendId = friend.userID || friend.targetUserId || friend.friendId || friend.id;

    onFriendClick?.({
      ...friend,
      id: friendId,
      friendId,
      targetUserId: friendId,
      name: friend.name,
      avatar: friend.avatar,
      profilePhoto: friend.profilePhoto,
      friend: friend.raw?.friend || friend.friend || friend,
      lastMessage: "Aun no hay mensajes",
      time: "",
      unread: 0,
      online: friend.status === "online",
    });
  };

  const handleAcceptRequest = async (request) => {
    const accepted = await runRequestAction(
      () => acceptFriendRequest(request.id),
      "Solicitud aceptada",
    );

    if (accepted) {
      handleOpenFriend(profileToFriend(request.sender));
    }
  };

  const handleRemoveFriend = async (friend) => {
    try {
      setBusy(true);
      setNotice("");
      await removeFriend(friend.userID || friend.targetUserId || friend.id);
      setNotice("Amigo eliminado");
    } catch (requestError) {
      setNotice(requestError.message || "No se pudo eliminar el amigo");
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside
      style={{
        width: 280,
        flexShrink: 0,
        background: "#13141c",
        borderRight: "1px solid #1e2030",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      <UserProfile
        profile={userProfile}
        onUpdateStatus={updateStatus}
        onOpenSettings={onOpenSettings}
      />

      <section style={{ padding: "12px 16px", borderBottom: "1px solid #1e2030" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
          <div>
            <p style={{ color: "#c0caf5", fontSize: 13, fontWeight: 600, margin: 0 }}>
              Friend code
            </p>
            <p style={{ color: "#a78bfa", fontSize: 13, letterSpacing: 1.2, fontWeight: 700, margin: "2px 0 0" }}>
              {userProfile?.friendCode || "Preparando perfil..."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyFriendCode}
            disabled={!userProfile?.friendCode}
            title="Copiar friend code"
            style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #1e2030", background: "#1a1b26", color: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center", cursor: userProfile?.friendCode ? "pointer" : "not-allowed", opacity: userProfile?.friendCode ? 1 : 0.5 }}
          >
            <Copy size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
          <input
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            placeholder="Email o friend code"
            disabled={busy || loading}
            style={{ minWidth: 0, flex: 1, padding: "9px 10px", background: "#1a1b26", border: "1px solid #1e2030", borderRadius: 8, color: "#c0caf5", fontSize: 12, outline: "none" }}
          />
          <button
            type="submit"
            disabled={busy || loading || !target.trim()}
            title="Enviar solicitud"
            style={{ width: 36, height: 36, borderRadius: 9, border: "none", background: target.trim() ? "#7c3aed" : "#1e2030", color: target.trim() ? "white" : "#565f89", display: "flex", alignItems: "center", justifyContent: "center", cursor: target.trim() ? "pointer" : "default" }}
          >
            <UserPlus size={16} />
          </button>
        </form>

        {(notice || error) && (
          <p style={{ color: error ? "#ef4444" : "#a78bfa", fontSize: 12, margin: "8px 0 0" }}>
            {notice || error}
          </p>
        )}
      </section>

      {(receivedRequests.length > 0 || sentRequests.length > 0) && (
        <section style={{ borderBottom: "1px solid #1e2030", padding: "10px 8px" }}>
          {receivedRequests.map((request) => (
            <RequestRow
              key={request.id}
              label={requestUserName(request, "received")}
              detail="Quiere agregarte"
              disabled={busy}
              onAccept={() => handleAcceptRequest(request)}
              onReject={() => runRequestAction(
                () => rejectFriendRequest(request.id),
                "Solicitud rechazada",
              )}
            />
          ))}

          {sentRequests.map((request) => (
            <RequestRow
              key={request.id}
              label={requestUserName(request, "sent")}
              detail="Solicitud enviada"
              disabled={busy}
              onCancel={() => runRequestAction(
                () => cancelFriendRequest(request.id),
                "Solicitud cancelada",
              )}
            />
          ))}
        </section>
      )}

      <div style={{ flex: 1, minHeight: 0 }}>
        {loading ? (
          <div style={{ padding: 20, color: "#565f89", fontSize: 13, textAlign: "center" }}>
            Cargando amistades...
          </div>
        ) : (
          <FriendsList
            friends={friends}
            onFriendClick={handleOpenFriend}
            onRemoveFriend={handleRemoveFriend}
          />
        )}
      </div>
    </aside>
  );
}

function profileToFriend(profile) {
  if (!profile) {
    return {
      id: null,
      name: "Usuario",
      avatar: "U",
      status: "offline",
      activity: "Desconectado",
    };
  }

  const name = profile.displayName || profile.userName || profile.username || profile.email || "Usuario";

  return {
    ...profile,
    id: profile.userID || profile.id || profile.userId,
    userID: profile.userID || profile.id || profile.userId,
    targetUserId: profile.userID || profile.id || profile.userId,
    name,
    avatar: name.trim().charAt(0).toUpperCase() || "U",
    profilePhoto: profile.profilePhoto || profile.avatarUrl || "",
    status: profile.status === "ONLINE" ? "online" : "offline",
    activity: profile.status === "ONLINE" ? "En linea" : "Desconectado",
    friend: profile,
  };
}

function RequestRow({ label, detail, disabled, onAccept, onReject, onCancel }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px", borderRadius: 8 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: "#c0caf5", fontSize: 13, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {label}
        </p>
        <p style={{ color: "#565f89", fontSize: 11, margin: "2px 0 0" }}>
          {detail}
        </p>
      </div>

      {onAccept && (
        <IconAction title="Aceptar" color="#22c55e" disabled={disabled} onClick={onAccept}>
          <Check size={14} />
        </IconAction>
      )}
      {onReject && (
        <IconAction title="Rechazar" color="#ef4444" disabled={disabled} onClick={onReject}>
          <X size={14} />
        </IconAction>
      )}
      {onCancel && (
        <IconAction title="Cancelar" color="#ef4444" disabled={disabled} onClick={onCancel}>
          <X size={14} />
        </IconAction>
      )}
    </div>
  );
}

function IconAction({ children, title, color, disabled, onClick }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #1e2030", background: "#1a1b26", color, display: "flex", alignItems: "center", justifyContent: "center", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1 }}
    >
      {children}
    </button>
  );
}
