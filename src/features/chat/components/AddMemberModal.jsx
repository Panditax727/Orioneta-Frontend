import { useEffect, useMemo, useState } from "react";
import { Search, UserPlus, X } from "lucide-react";
import { ensureCurrentUserProfile } from "../../../services/userService";
import { listFriends } from "../../../services/friendshipService";
import { chatService } from "../services/chatService";

export default function AddMemberModal({
  isOpen,
  onClose,
  conversationId,
  onMemberAdded,
}) {
  const [friendSearch, setFriendSearch] = useState("");
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [inviting, setInviting] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setFriendSearch("");
      setNotice("");
      setInviting(null);
      return;
    }

    let cancelled = false;

    async function loadFriends() {
      setFriendsLoading(true);

      try {
        const profile = await ensureCurrentUserProfile();
        const userId = profile?.id || profile?.userId || profile?.userID;

        if (userId) {
          const friendsList = await listFriends(userId);

          if (!cancelled) {
            setFriends(friendsList.filter((friend) => friend.friend));
          }
        }
      } catch {
        // friends list may not be available
      } finally {
        if (!cancelled) {
          setFriendsLoading(false);
        }
      }
    }

    loadFriends();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const filteredFriends = useMemo(() => {
    const query = friendSearch.trim().toLowerCase();

    if (!query) {
      return friends;
    }

    return friends.filter(
      (friend) =>
        friend.name?.toLowerCase().includes(query) ||
        friend.email?.toLowerCase().includes(query),
    );
  }, [friends, friendSearch]);

  const handleInvite = async (friend) => {
    const friendId = friend.targetUserId || friend.friendId || friend.id;

    if (!friendId) {
      setNotice("No se pudo identificar al amigo");
      return;
    }

    try {
      setInviting(friendId);
      setNotice("");

      await chatService.addParticipant(conversationId, friendId);

      setNotice(`${friend.name} ha sido agregado al grupo`);
      onMemberAdded?.(friend);

      setFriends((prev) => prev.filter((f) => {
        const fId = f.targetUserId || f.friendId || f.id;
        return fId !== friendId;
      }));
    } catch (err) {
      setNotice(err.message || "No se pudo agregar al miembro");
    } finally {
      setInviting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 24,
      }}
    >
      <style>{`
        @keyframes addMemberFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes addMemberSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#13141c",
          border: "1px solid #1e2030",
          borderRadius: 16,
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.4)",
          animation: "addMemberSlideUp 0.3s ease-out",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #1e2030",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#1a1b26",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#7c3aed",
              }}
            >
              <UserPlus size={16} />
            </div>
            <h2
              style={{
                color: "#c0caf5",
                fontSize: 16,
                fontWeight: 600,
                margin: 0,
              }}
            >
              Agregar miembros
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#565f89",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1a1b26";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "16px 20px" }}>
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#565f89",
              }}
            />
            <input
              type="text"
              value={friendSearch}
              onChange={(event) => setFriendSearch(event.target.value)}
              placeholder="Buscar amigos..."
              style={{
                width: "100%",
                padding: "8px 12px 8px 32px",
                background: "#1a1b26",
                border: "1px solid #1e2030",
                borderRadius: 8,
                color: "#c0caf5",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#7c3aed";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#1e2030";
              }}
            />
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 20px 16px",
          }}
        >
          {friendsLoading ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "#565f89",
                fontSize: 13,
              }}
            >
              Cargando amigos...
            </div>
          ) : filteredFriends.length === 0 ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "#565f89",
                fontSize: 13,
              }}
            >
              {friendSearch
                ? "No se encontraron amigos"
                : "No tienes amigos agregados"}
            </div>
          ) : (
            filteredFriends.map((friend) => {
              const friendId = friend.targetUserId || friend.friendId || friend.id;
              const isInviting = inviting === friendId;
              const initial =
                friend.name?.trim().charAt(0).toUpperCase() || "?";

              return (
                <div
                  key={friendId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 8,
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #7c3aed, #4f46e5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: 13,
                      fontWeight: 600,
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    {friend.profilePhoto ? (
                      <img
                        src={friend.profilePhoto}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      initial
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        color: "#c0caf5",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {friend.name}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInvite(friend)}
                    disabled={isInviting}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 6,
                      background: isInviting ? "#1e2030" : "#7c3aed",
                      border: "none",
                      color: isInviting ? "#565f89" : "white",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: isInviting ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isInviting ? "Agregando..." : "Agregar"}
                  </button>
                </div>
              );
            })
          )}

          {notice && (
            <p
              style={{
                color: notice.includes("agregado") ? "#22c55e" : "#ef4444",
                fontSize: 12,
                margin: "8px 0 0",
                textAlign: "center",
              }}
            >
              {notice}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
