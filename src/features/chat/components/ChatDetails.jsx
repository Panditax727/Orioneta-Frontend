import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import {
  Bell,
  BellOff,
  Check,
  Edit3,
  LogOut,
  Phone,
  Pin,
  PinOff,
  Search,
  Star,
  UserPlus,
  Video,
  X,
  Camera,
  MonitorUp,
} from "lucide-react";
import { findUserById } from "../../../services/userService";
import { resolveProfilePhoto } from "../../../services/profilePhotoService";
import { getConversationDisplayAvatar, getConversationInitial } from "./chat-area/chatUtils";
import AddMemberModal from "./AddMemberModal";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";

function isGroupEntityMember(member, conversation) {
  if (!member || !conversation?.isGroup) {
    return false;
  }

  const memberId = member.id || member.userId || member.userID;

  if (memberId && String(memberId) === String(conversation.id)) {
    return true;
  }

  const memberType = String(member.type || "").toUpperCase();

  if (memberType === "GROUP" || memberType === "GROUP_CHAT") {
    return true;
  }

  if (!memberId && member.name === conversation.name) {
    return true;
  }

  return false;
}

function buildMembersList(conversation, currentUserProfile = null) {
  if (!conversation) {
    return [];
  }

  const sourceMembers = conversation.members?.length
    ? conversation.members
    : (conversation.participants || []).map((participant) => {
        const userId = participant.userId || participant.userID || participant.id;
        const user = participant.user || participant.profile || participant;

        return {
          id: userId,
          userId,
          name: user.displayName || user.userName || user.name || participant.name || "Usuario",
          avatar: user.avatar || (user.displayName || user.name || "?").trim().charAt(0).toUpperCase(),
          avatarPhoto: user.profilePhoto || user.avatarUrl || "",
          online: user.status === "ONLINE",
          type: participant.type || user.type,
        };
      });

  const filteredMembers = sourceMembers.filter((member) => !isGroupEntityMember(member, conversation)).map((member) => ({
    ...member,
    isAdmin: Boolean(
      conversation.ownerId &&
      String(member.id || member.userId) === String(conversation.ownerId),
    ),
    role: member.role || (conversation.ownerId && String(member.id || member.userId) === String(conversation.ownerId) ? "OWNER" : "MEMBER"),
  }));

  // Add current user if not in members list
  if (currentUserProfile && conversation?.isGroup) {
    const currentUserId = currentUserProfile.id || currentUserProfile.userId || currentUserProfile.userID;
    const isCurrentUserInList = filteredMembers.some(
      (member) => String(member.id || member.userId) === String(currentUserId)
    );

    if (!isCurrentUserInList) {
      filteredMembers.push({
        id: currentUserId,
        userId: currentUserId,
        name: currentUserProfile.displayName || currentUserProfile.userName || currentUserProfile.name || "Usuario",
        avatar: (currentUserProfile.displayName || currentUserProfile.name || "Usuario").trim().charAt(0).toUpperCase(),
        avatarPhoto: currentUserProfile.profilePhoto || currentUserProfile.avatarUrl || currentUserProfile.profilePhotoReference || "",
        online: currentUserProfile.status === "ONLINE",
        isAdmin: String(currentUserId) === String(conversation.ownerId),
        role: String(currentUserId) === String(conversation.ownerId) ? "OWNER" : "MEMBER",
        isCurrentUser: true,
      });
    } else {
      // Mark existing current user
      const currentUserIndex = filteredMembers.findIndex(
        (member) => String(member.id || member.userId) === String(currentUserId)
      );
      if (currentUserIndex >= 0) {
        filteredMembers[currentUserIndex] = {
          ...filteredMembers[currentUserIndex],
          isCurrentUser: true,
          name: currentUserProfile.displayName || currentUserProfile.userName || currentUserProfile.name || filteredMembers[currentUserIndex].name,
          avatarPhoto: currentUserProfile.profilePhoto || currentUserProfile.avatarUrl || currentUserProfile.profilePhotoReference || filteredMembers[currentUserIndex].avatarPhoto,
        };
      }
    }
  }

  return filteredMembers;
}

export default function ChatDetails({
  conversation,
  currentUserId,
  currentUserProfile,
  onClose,
  onCall,
  onVideoCall,
  onScreenShare,
  onOpenMessageSearch,
  onOpenMemberProfile,
  onMute,
  onPin,
  onAddFavorite,
  onDeleteConversation,
  onConversationUpdate,
  onMemberAdded,
}) {
  const isGroup = conversation?.isGroup;
  const [muted, setMuted] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [conversationSearch, setConversationSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [savingField, setSavingField] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    setEditingTitle(false);
    setEditingBio(false);
    setTitleDraft(conversation?.name || "");
    setBioDraft(conversation?.bio || conversation?.description || "");
    setConversationSearch("");
    setPhotoPreview(null);
    setPhotoModalOpen(false);
  }, [conversation?.id, conversation?.name, conversation?.bio, conversation?.description]);

  const handlePhotoSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten imágenes");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handlePhotoUpload = async () => {
    if (!photoPreview || !conversation?.id) return;

    try {
      setPhotoUploading(true);
      await onConversationUpdate?.({ avatarPhoto: photoPreview });
      setPhotoPreview(null);
      setPhotoModalOpen(false);
    } catch {
      alert("No se pudo actualizar la foto");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSaveTitle = async () => {
    const nextTitle = titleDraft.trim();

    if (!nextTitle || nextTitle === conversation?.name) {
      setEditingTitle(false);
      setTitleDraft(conversation?.name || "");
      return;
    }

    try {
      setSavingField("title");
      await onConversationUpdate?.({ name: nextTitle });
      setEditingTitle(false);
    } catch {
      alert("No se pudo actualizar el nombre del grupo");
      setTitleDraft(conversation?.name || "");
    } finally {
      setSavingField("");
    }
  };

  const handleSaveBio = async () => {
    const nextBio = bioDraft.trim();
    const currentBio = conversation?.bio || conversation?.description || "";

    if (nextBio === currentBio) {
      setEditingBio(false);
      return;
    }

    try {
      setSavingField("bio");
      await onConversationUpdate?.({ bio: nextBio, description: nextBio });
      setEditingBio(false);
    } catch {
      alert("No se pudo actualizar la biografía");
      setBioDraft(currentBio);
    } finally {
      setSavingField("");
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setConversationSearch(query);
    onOpenMessageSearch?.(query);
  };

  const handleMemberClick = async (member) => {
    const memberId = member.id || member.userId;

    if (!memberId) {
      return;
    }

    try {
      const profile = await findUserById(memberId);

      onOpenMemberProfile?.({
        ...(profile || {}),
        id: memberId,
        name: profile?.displayName || profile?.userName || member.name,
        avatar: member.avatar,
        avatarPhoto: member.avatarPhoto || profile?.profilePhoto || profile?.avatarUrl || "",
        online: member.online,
      });
    } catch {
      onOpenMemberProfile?.({
        id: memberId,
        name: member.name,
        avatar: member.avatar,
        avatarPhoto: member.avatarPhoto || "",
        online: member.online,
      });
    }
  };

  const avatarImage = getConversationDisplayAvatar(conversation);
  const conversationInitial = getConversationInitial(conversation);

  const members = useMemo(
    () => buildMembersList(conversation, currentUserProfile),
    [conversation, currentUserProfile],
  );

  const isGroupAdmin = useMemo(() => {
    if (!isGroup || !currentUserId) {
      return false;
    }

    if (conversation?.ownerId) {
      return String(conversation.ownerId) === String(currentUserId);
    }

    return members.some(
      (member) =>
        String(member.id || member.userId) === String(currentUserId) &&
        (member.isAdmin || member.role === "OWNER"),
    );
  }, [conversation?.ownerId, currentUserId, isGroup, members]);

  const handleMute = () => {
    const next = !muted;
    setMuted(next);
    onMute?.(next);
  };

  const handlePin = () => {
    const next = !pinned;
    setPinned(next);
    onPin?.(next);
  };

  const handleFavorite = () => {
    const next = !favorited;
    setFavorited(next);
    onAddFavorite?.(next);
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteDialogOpen(false);

    try {
      setDeleting(true);
      await onDeleteConversation?.();
    } finally {
      setDeleting(false);
    }
  };

  const openPhotoPicker = () => {
    fileInputRef.current?.click();
  };

  const renderedContent = (
    <div
      style={{
        width: 320,
        flexShrink: 0,
        background: "#13141c",
        borderLeft: "1px solid #1e2030",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #1e2030",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h3
          style={{
            color: "#c0caf5",
            fontSize: 16,
            fontWeight: 600,
            margin: 0,
          }}
        >
          {isGroup ? "Información del grupo" : "Información del contacto"}
        </h3>
        <button
          onClick={onClose}
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
          onMouseEnter={(e) => { e.currentTarget.style.background = "#1a1b26"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: isGroup ? 20 : "50%",
              background: isGroup
                ? "#1e2030"
                : "linear-gradient(135deg, #7c3aed, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: isGroup ? 36 : 32,
              fontWeight: 600,
              marginBottom: 12,
              overflow: "hidden",
              flexShrink: 0,
              cursor: isGroup && isGroupAdmin ? "pointer" : "default",
              position: "relative",
            }}
            onClick={isGroup && isGroupAdmin ? () => setPhotoModalOpen(true) : undefined}
          >
            {avatarImage ? (
              <img src={avatarImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              conversationInitial
            )}
            {isGroup && isGroupAdmin && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = 0; }}
              >
                <Camera size={28} style={{ color: "white" }} />
              </div>
            )}
          </div>

          {isGroup && editingTitle && isGroupAdmin ? (
            <div style={{ width: "100%", display: "flex", gap: 6, marginBottom: 4 }}>
              <input
                autoFocus
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void handleSaveTitle();
                  }

                  if (event.key === "Escape") {
                    setEditingTitle(false);
                    setTitleDraft(conversation?.name || "");
                  }
                }}
                disabled={savingField === "title"}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  background: "#1a1b26",
                  border: "1px solid #7c3aed",
                  borderRadius: 8,
                  color: "#c0caf5",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => void handleSaveTitle()}
                disabled={savingField === "title"}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#7c3aed",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h2
                style={{
                  color: "#c0caf5",
                  fontSize: 18,
                  fontWeight: 600,
                  margin: 0,
                  textAlign: "center",
                }}
              >
                {conversation?.name}
              </h2>
              {isGroup && isGroupAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setTitleDraft(conversation?.name || "");
                    setEditingTitle(true);
                  }}
                  title="Editar nombre"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#565f89",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                  }}
                >
                  <Edit3 size={14} />
                </button>
              )}
            </div>
          )}

          {!isGroup && (
            <p
              style={{
                color: conversation?.online ? "#22c55e" : "#565f89",
                fontSize: 13,
                margin: 0,
              }}
            >
              {conversation?.online ? "En línea" : "Desconectado"}
            </p>
          )}

          {isGroup && (
            <div style={{ width: "100%", marginTop: 8 }}>
              {editingBio && isGroupAdmin ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <textarea
                    autoFocus
                    value={bioDraft}
                    onChange={(event) => setBioDraft(event.target.value)}
                    rows={3}
                    disabled={savingField === "bio"}
                    placeholder="Biografía del grupo..."
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "#1a1b26",
                      border: "1px solid #7c3aed",
                      borderRadius: 8,
                      color: "#c0caf5",
                      fontSize: 12,
                      outline: "none",
                      resize: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBio(false);
                        setBioDraft(conversation?.bio || conversation?.description || "");
                      }}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        background: "transparent",
                        border: "1px solid #1e2030",
                        color: "#c0caf5",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSaveBio()}
                      disabled={savingField === "bio"}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        background: "#7c3aed",
                        border: "none",
                        color: "white",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, justifyContent: "center" }}>
                  <p
                    style={{
                      color: "#565f89",
                      fontSize: 12,
                      margin: 0,
                      textAlign: "center",
                      lineHeight: 1.4,
                      flex: 1,
                    }}
                  >
                    {conversation?.bio || conversation?.description || "Sin biografía"}
                  </p>
                  {isGroupAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setBioDraft(conversation?.bio || conversation?.description || "");
                        setEditingBio(true);
                      }}
                      title="Editar biografía"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#565f89",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        flexShrink: 0,
                      }}
                    >
                      <Edit3 size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {!isGroup && conversation?.bio && (
            <p
              style={{
                color: "#565f89",
                fontSize: 12,
                margin: "8px 0 0",
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              {conversation.bio}
            </p>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <ActionButton onClick={onCall}>
            <Phone size={16} />
            Llamar
          </ActionButton>
          <ActionButton onClick={onVideoCall}>
            <Video size={16} />
            Video
          </ActionButton>
          {onScreenShare && (
            <ActionButton onClick={onScreenShare}>
              <MonitorUp size={16} />
              Pantalla
            </ActionButton>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
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
            Buscar en la conversación
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
              value={conversationSearch}
              onChange={handleSearchChange}
              placeholder="Buscar mensajes..."
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
              onFocus={(e) => { e.currentTarget.style.borderColor = "#7c3aed"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#1e2030"; }}
            />
          </div>
        </div>

        {isGroup && members.length > 0 && (
          <>
            <h4
              style={{
                color: "#c0caf5",
                fontSize: 14,
                fontWeight: 600,
                margin: "0 0 12px 0",
              }}
            >
              Miembros ({members.length})
            </h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 240,
                overflowY: "auto",
                paddingRight: 4,
                marginBottom: 16,
              }}
            >
              {members.map((member, index) => (
                <MemberItem
                  key={member.id || member.userId || index}
                  member={member}
                  onClick={() => void handleMemberClick(member)}
                />
              ))}
            </div>
          </>
        )}

        <Divider />

        <OptionButton
          icon={muted ? <BellOff size={18} /> : <Bell size={18} />}
          label={muted ? "Sonido activado" : "Silenciar"}
          onClick={handleMute}
        />
        <OptionButton
          icon={pinned ? <PinOff size={18} /> : <Pin size={18} />}
          label={pinned ? "Desfijar" : "Fijar conversación"}
          onClick={handlePin}
        />
        {!isGroup && (
          <OptionButton
            icon={<Star size={18} />}
            label={favorited ? "Quitar de favoritos" : "Añadir a favoritos"}
            onClick={handleFavorite}
          />
        )}
        {isGroup && (
          <OptionButton
            icon={<UserPlus size={18} />}
            label="Agregar miembros"
            onClick={() => setAddMemberOpen(true)}
          />
        )}

        <Divider />

        <OptionButton
          icon={<LogOut size={18} />}
          label={isGroup ? "Salir del grupo" : "Eliminar conversación"}
          danger
          onClick={() => void handleDelete()}
          disabled={deleting}
        />
      </div>

      <AddMemberModal
        isOpen={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        conversationId={conversation?.id}
        onMemberAdded={(friend) => {
          onMemberAdded?.(friend);
        }}
      />

      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.7)",
          display: photoModalOpen ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1100,
          padding: 24,
        }}
        onClick={() => setPhotoModalOpen(false)}
      >
        <div
          onClick={(event) => event.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 400,
            background: "#13141c",
            border: "1px solid #1e2030",
            borderRadius: 16,
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.4)",
            animation: "slideUp 0.3s ease-out",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e2030", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ color: "#c0caf5", fontSize: 16, fontWeight: 600, margin: 0 }}>Cambiar foto del grupo</h3>
            <button type="button" onClick={() => setPhotoModalOpen(false)} style={{ background: "none", border: "none", color: "#565f89", cursor: "pointer", padding: 4 }}><X size={20} /></button>
          </div>

          <div style={{ padding: "20px", textAlign: "center" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={openPhotoPicker}
              style={{
                cursor: "pointer",
                display: "inline-block",
                background: "transparent",
                border: "none",
                padding: 0,
              }}
            >
              <div style={{
                width: 100,
                height: 100,
                borderRadius: 20,
                background: photoPreview || avatarImage ? "transparent" : "#1e2030",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 36,
                fontWeight: 600,
                margin: "0 auto 16px",
                border: "2px dashed #2d2f45",
                overflow: "hidden",
                position: "relative",
              }}
              >
                {photoPreview || avatarImage ? (
                  <img src={photoPreview || avatarImage} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  conversation?.name?.trim().charAt(0).toUpperCase() || "#"
                )}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Camera size={24} style={{ color: "white" }} />
                </div>
              </div>
            </button>
            <p style={{ color: "#565f89", fontSize: 13, margin: "0 0 16px" }}>Haz clic para seleccionar una imagen (máx. 5MB)</p>
          </div>

          <div style={{ padding: "12px 20px", borderTop: "1px solid #1e2030", display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => { setPhotoPreview(null); setPhotoModalOpen(false); }} style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", border: "1px solid #1e2030", color: "#c0caf5", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
            <button type="button" onClick={() => void handlePhotoUpload()} disabled={!photoPreview || photoUploading} style={{ padding: "8px 20px", borderRadius: 8, background: photoPreview && !photoUploading ? "#7c3aed" : "#1e2030", border: "none", color: photoPreview && !photoUploading ? "white" : "#565f89", fontSize: 13, fontWeight: 600, cursor: photoPreview && !photoUploading ? "pointer" : "not-allowed" }}>{photoUploading ? "Guardando..." : "Guardar"}</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {renderedContent}

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={isGroup ? "Salir del grupo" : "Eliminar conversación"}
        description={
          isGroup
            ? `¿Estás seguro de que deseas salir de "${conversation.name}"? Ya no recibirás mensajes hasta que vuelvas a ser agregado.`
            : "¿Estás seguro de que deseas eliminar esta conversación? Esta acción no se puede deshacer."
        }
        confirmText={isGroup ? "Salir del grupo" : "Eliminar"}
        cancelText="Cancelar"
        confirmVariant="danger"
        loading={deleting}
      />
    </>
  );
}

function ActionButton({ children, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        padding: "10px",
        borderRadius: 8,
        background: hovered ? "#252838" : "#1a1b26",
        border: "1px solid #1e2030",
        cursor: onClick ? "pointer" : "default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        color: "#c0caf5",
        fontSize: 13,
        transition: "all 0.2s",
        opacity: onClick ? 1 : 0.5,
      }}
    >
      {children}
    </button>
  );
}

function OptionButton({ icon, label, danger = false, onClick, disabled = false }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: 8,
        background: hovered ? (danger ? "rgba(239, 68, 68, 0.1)" : "#252838") : "transparent",
        border: "none",
        cursor: onClick && !disabled ? "pointer" : "default",
        display: "flex",
        alignItems: "center",
        gap: 12,
        color: danger ? "#ef4444" : "#c0caf5",
        fontSize: 14,
        transition: "all 0.2s",
        textAlign: "left",
        opacity: onClick && !disabled ? 1 : 0.5,
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: "#1e2030",
        margin: "16px 0",
      }}
    />
  );
}

function MemberItem({ member, onClick }) {
  const [hovered, setHovered] = useState(false);
  const avatarImage = resolveProfilePhoto(member.avatarPhoto) || "";

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 12px",
        borderRadius: 8,
        cursor: "pointer",
        background: hovered ? "#252838" : "transparent",
        transition: "background 0.2s",
        border: "none",
        width: "100%",
        textAlign: "left",
      }}
    >
      <div style={{ position: "relative" }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 14,
            fontWeight: 600,
            overflow: "hidden",
          }}
        >
          {avatarImage ? (
            <img src={avatarImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            member.avatar || member.name?.trim().charAt(0).toUpperCase() || "?"
          )}
        </div>
        {member.online && (
          <div
            style={{
              position: "absolute",
              bottom: 1,
              right: 1,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#22c55e",
              border: "2px solid #13141c",
            }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span
            style={{
              color: "#c0caf5",
              fontSize: 14,
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {member.name}
          </span>
          {member.isCurrentUser && (
            <span
              style={{
                flexShrink: 0,
                padding: "2px 6px",
                borderRadius: 999,
                border: "1px solid rgba(167, 139, 250, 0.3)",
                background: "rgba(167, 139, 250, 0.08)",
                color: "#a78bfa",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              Tú
            </span>
          )}
          {member.isAdmin && (
            <span
              style={{
                flexShrink: 0,
                padding: "2px 8px",
                borderRadius: 999,
                background: "rgba(124, 58, 237, 0.16)",
                color: "#c4b5fd",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Admin
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
