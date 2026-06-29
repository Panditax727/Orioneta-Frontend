import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Search, Users, X, Camera, Image as LucideImage } from "lucide-react";
import { ensureCurrentUserProfile } from "../../../services/userService";
import { listFriends } from "../../../services/friendshipService";

export default function CreateGroupModal({
  isOpen,
  onClose,
  onCreateGroup,
}) {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [groupBio, setGroupBio] = useState("");
  const [groupPhoto, setGroupPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [friendSearch, setFriendSearch] = useState("");
  const [selectedFriends, setSelectedFriends] = useState(new Set());
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handlePhotoSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten imágenes");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar 5MB");
      return;
    }

    setGroupPhoto(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const removePhoto = () => {
    setGroupPhoto(null);
    setPhotoPreview(null);
  };

  useEffect(() => {
    if (!isOpen) {
      setGroupName("");
      setDescription("");
      setGroupBio("");
      setGroupPhoto(null);
      setPhotoPreview(null);
      setFriendSearch("");
      setSelectedFriends(new Set());
      setError("");
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
        friend.email?.toLowerCase().includes(query) ||
        friend.username?.toLowerCase().includes(query),
    );
  }, [friends, friendSearch]);

  const toggleFriend = (friendId) => {
    setSelectedFriends((prev) => {
      const next = new Set(prev);

      if (next.has(friendId)) {
        next.delete(friendId);
      } else {
        next.add(friendId);
      }

      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = groupName.trim();

    if (!name) {
      setError("El nombre del grupo es obligatorio");
      return;
    }

    if (selectedFriends.size === 0) {
      setError("Selecciona al menos un amigo");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const participantIds = [...selectedFriends].map((id) => {
        const friend = friends.find(
          (f) => f.targetUserId === id || f.friendId === id,
        );

        return friend?.targetUserId || friend?.friendId || id;
      });

      const groupData = await onCreateGroup({
        name,
        description: description.trim(),
        bio: groupBio.trim(),
        photoFile: groupPhoto,
        participantIds,
      });

      onClose();
    } catch (err) {
      setError(err.message || "No se pudo crear el grupo");
    } finally {
      setCreating(false);
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
        @keyframes createGroupFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes createGroupSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#13141c",
          border: "1px solid #1e2030",
          borderRadius: 16,
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.4)",
          animation: "createGroupSlideUp 0.3s ease-out",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
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
              <Users size={16} />
            </div>
            <h2
              style={{
                color: "#c0caf5",
                fontSize: 16,
                fontWeight: 600,
                margin: 0,
              }}
            >
              Crear grupo
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

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ padding: "16px 20px" }}>
            {/* Group name */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  color: "#565f89",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Nombre del grupo *
              </label>
              <input
                autoFocus
                type="text"
                value={groupName}
                onChange={(event) => {
                  setGroupName(event.target.value);
                  setError("");
                }}
                placeholder="Ej: Proyecto Orioneta"
                disabled={creating}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#1a1b26",
                  border: "1px solid #1e2030",
                  borderRadius: 8,
                  color: "#c0caf5",
                  fontSize: 14,
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

            {/* Description */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  color: "#565f89",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Descripción (opcional)
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="¿De qué trata el grupo?"
                disabled={creating}
                rows={2}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#1a1b26",
                  border: "1px solid #1e2030",
                  borderRadius: 8,
                  color: "#c0caf5",
                  fontSize: 13,
                  outline: "none",
                  resize: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#7c3aed";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#1e2030";
                }}
              />
            </div>

            {/* Group Bio */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  color: "#565f89",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Biografía del grupo (opcional)
              </label>
              <textarea
                value={groupBio}
                onChange={(event) => setGroupBio(event.target.value)}
                placeholder="Describe el propósito del grupo..."
                disabled={creating}
                rows={2}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#1a1b26",
                  border: "1px solid #1e2030",
                  borderRadius: 8,
                  color: "#c0caf5",
                  fontSize: 13,
                  outline: "none",
                  resize: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#7c3aed";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#1e2030";
                }}
              />
            </div>

            {/* Group Photo */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  color: "#565f89",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Foto del grupo (opcional)
              </label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: "none" }} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: "pointer", display: "block", width: "100%", background: "transparent", border: "none", padding: 0 }}
              >
                <div style={{
                  width: "100%", height: 140, borderRadius: 12, background: photoPreview ? "transparent" : "#1a1b26",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#565f89", fontSize: 13,
                  border: photoPreview ? "2px solid #7c3aed" : "2px dashed #2d2f45", overflow: "hidden", position: "relative"
                }}>
                  {photoPreview ? (
                    <>
                      <img src={photoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button type="button" onClick={(e) => { e.stopPropagation(); removePhoto(); }} style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} /></button>
                    </>
                  ) : groupName.trim() ? (
                    <span style={{ color: "#c0caf5", fontSize: 48, fontWeight: 700 }}>
                      {groupName.trim().charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <>
                      <Camera size={32} style={{ marginBottom: 8 }} />
                      <span>Haz clic para seleccionar una imagen (máx. 5MB)</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Friend search */}
            <div style={{ marginBottom: 10 }}>
              <label
                style={{
                  color: "#565f89",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Agregar miembros ({selectedFriends.size} seleccionados)
              </label>
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

            {/* Friend list */}
            <div
              style={{
                maxHeight: 220,
                overflowY: "auto",
                border: "1px solid #1e2030",
                borderRadius: 8,
                background: "#1a1b26",
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
                  const friendId =
                    friend.targetUserId || friend.friendId || friend.id;
                  const isSelected = selectedFriends.has(friendId);
                  const initial =
                    friend.name?.trim().charAt(0).toUpperCase() || "?";

                  return (
                    <div
                      key={friendId}
                      onClick={() => toggleFriend(friendId)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 12px",
                        cursor: "pointer",
                        background: isSelected
                          ? "rgba(124, 58, 237, 0.1)"
                          : "transparent",
                        borderBottom: "1px solid #1e2030",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "#252838";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          border: isSelected
                            ? "2px solid #7c3aed"
                            : "2px solid #2d2f45",
                          background: isSelected ? "#7c3aed" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.15s",
                        }}
                      >
                        {isSelected && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>

                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: 12,
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
                        {friend.email && (
                          <div
                            style={{
                              color: "#565f89",
                              fontSize: 11,
                              marginTop: 1,
                            }}
                          >
                            {friend.email}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Error */}
            {error && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: 12,
                  margin: "10px 0 0",
                }}
              >
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid #1e2030",
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "transparent",
                border: "1px solid #1e2030",
                color: "#c0caf5",
                fontSize: 13,
                cursor: creating ? "not-allowed" : "pointer",
                opacity: creating ? 0.5 : 1,
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating || !groupName.trim() || selectedFriends.size === 0}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                background:
                  groupName.trim() && selectedFriends.size > 0 && !creating
                    ? "#7c3aed"
                    : "#1e2030",
                border: "none",
                color:
                  groupName.trim() && selectedFriends.size > 0 && !creating
                    ? "white"
                    : "#565f89",
                fontSize: 13,
                fontWeight: 600,
                cursor:
                  groupName.trim() && selectedFriends.size > 0 && !creating
                    ? "pointer"
                    : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {creating ? "Creando..." : "Crear grupo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
