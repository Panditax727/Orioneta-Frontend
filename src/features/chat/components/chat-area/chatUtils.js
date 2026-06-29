import { resolveProfilePhoto as resolvePhoto } from "../../../../services/profilePhotoService";

export function isGroupConversation(conversation) {
  return Boolean(
    conversation?.isGroup ||
    conversation?.type === "GROUP_CHAT" ||
    conversation?.type === "GROUP",
  );
}

export function getAvatarImage(conversation) {
  const candidate = conversation?.avatarPhoto || conversation?.profilePhoto || conversation?.avatar;
  if (typeof candidate !== "string") return "";
  return resolvePhoto(candidate);
}

export function getConversationDisplayAvatar(conversation) {
  if (!conversation) {
    return "";
  }

  if (isGroupConversation(conversation)) {
    const groupPhoto = conversation.avatarPhoto || conversation.avatarUrl || conversation.imageUrl || "";
    return typeof groupPhoto === "string" ? resolvePhoto(groupPhoto) : "";
  }

  return getAvatarImage(conversation);
}

export function getConversationInitial(conversation) {
  return conversation?.name?.trim().charAt(0).toUpperCase() || "?";
}

export function buildConversationProfile(conversation, friendProfile) {
  if (!conversation && !friendProfile) return null;

  if (isGroupConversation(conversation)) {
    return {
      name: conversation.name || "Grupo",
      bio: conversation.bio || conversation.description || "",
      avatar: conversation.avatar || getConversationInitial(conversation),
      avatarPhoto: conversation.avatarPhoto || conversation.avatarUrl || "",
      badges: [],
      isGroup: true,
    };
  }

  const source = friendProfile || conversation || {};
  const name = source.displayName || source.name || source.userName || source.username || source.email || conversation?.name || "Contacto Orioneta";
  return {
    ...source,
    name,
    userName: source.userName || source.username || conversation?.userName || "",
    email: source.email || conversation?.email || "",
    friendCode: source.friendCode || conversation?.friendCode || "",
    status: source.status || (conversation?.online ? "ONLINE" : "Disponible"),
    bio: source.bio || conversation?.bio || "",
    avatar: source.avatar || conversation?.avatar || name.trim().charAt(0).toUpperCase() || "O",
    avatarPhoto: source.profilePhoto || source.avatarPhoto || source.avatarUrl || conversation?.avatarPhoto || "",
    badges: source.badges || conversation?.badges || [],
  };
}

export function playFeedbackSound(kind) {
  if (typeof window === "undefined") return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  try {
    const context = getFeedbackAudioContext(AudioContext);
    const now = context.currentTime;
    const gain = context.createGain();
    const oscillator = context.createOscillator();
    const config = getFeedbackSoundConfig(kind);
    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(config.endFrequency, now + config.duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(config.volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + config.duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + config.duration + 0.03);
  } catch { }
}

function getFeedbackAudioContext(AudioContext) {
  if (!window.__orionetaFeedbackAudioContext) {
    window.__orionetaFeedbackAudioContext = new AudioContext();
  }
  const context = window.__orionetaFeedbackAudioContext;
  if (context.state === "suspended") void context.resume();
  return context;
}

function getFeedbackSoundConfig(kind) {
  if (kind === "receive") return { type: "triangle", startFrequency: 660, endFrequency: 880, duration: 0.1, volume: 0.035 };
  if (kind === "call") return { type: "sine", startFrequency: 520, endFrequency: 700, duration: 0.16, volume: 0.045 };
  return { type: "sine", startFrequency: 880, endFrequency: 1240, duration: 0.08, volume: 0.03 };
}

export function stopMediaStream(stream) {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}

export async function buildAttachmentPayload(file) {
  if (!file) throw new Error("Archivo inválido");
  const previewUrl = URL.createObjectURL(file);
  const kind = getAttachmentKind(file.type);
  const messageType = getMessageTypeFromFile(file.type);
  return { id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`, file, name: file.name, size: file.size, type: file.type || "application/octet-stream", kind, messageType, previewUrl, createdAt: new Date().toISOString() };
}

export function getAttachmentKind(mimeType = "") {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("video/")) return "video";
  return "file";
}

export function buildUploadedAttachment(draftAttachment, uploadedMedia) {
  return { id: uploadedMedia.id || draftAttachment.id, mediaId: uploadedMedia.id, name: uploadedMedia.fileName || uploadedMedia.name || draftAttachment.name, size: uploadedMedia.size || draftAttachment.size, type: uploadedMedia.contentType || uploadedMedia.type || draftAttachment.type, kind: draftAttachment.kind, messageType: draftAttachment.messageType, url: uploadedMedia.url, createdAt: uploadedMedia.createdAt || new Date().toISOString() };
}

export function revokeAttachmentPreview(attachment) {
  if (attachment?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(attachment.previewUrl);
}

export async function requestCallStream(mode) {
  if (mode === "screen") return navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
  return navigator.mediaDevices.getUserMedia({ audio: true, video: mode === "video" });
}

export function createCallId() {
  return crypto.randomUUID?.() || `call-${Date.now()}-${Math.random()}`;
}

export function getProfileId(profile) {
  return profile?.id || profile?.userId || profile?.userID || profile?.uuid || null;
}

export const CALL_SIGNAL_TYPES = new Set(["CALL_OFFER", "CALL_ANSWER", "CALL_ICE_CANDIDATE", "CALL_ENDED", "CALL_DECLINED"]);

export function isCallSignalForConversation(event, conversationId, currentUserId) {
  if (!CALL_SIGNAL_TYPES.has(event?.type)) return false;
  if (!event.conversationId || String(event.conversationId) !== String(conversationId)) return false;
  return String(event.senderId || "") !== String(currentUserId || "");
}

export const RTC_CONFIGURATION = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    {
      urls: import.meta.env.VITE_TURN_URL || "turn:localhost:3478",
      username: import.meta.env.VITE_TURN_USERNAME || "orioneta",
      credential: import.meta.env.VITE_TURN_CREDENTIAL || "orioneta",
    },
  ],
  iceCandidatePoolSize: 10,
};

export const DEFAULT_VISUALS = { chatBackground: "#0d0e14", accent: "#a78bfa", accentGradient: "linear-gradient(135deg, #a78bfa, #7c3aed)", incomingBubble: "#13141c", fontFamily: "Inter, system-ui, sans-serif" };

export const QUICK_EMOTES = ["✨", "💜", "🔥", "ok", "dale"];
export const MAX_ATTACHMENT_SIZE = 12 * 1024 * 1024;

export function parseCallPayload(content) {
  try { return typeof content === "string" ? JSON.parse(content) : content; } catch { return null; }
}

function getMessageTypeFromFile(mimeType = "") {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("audio/")) return "AUDIO";
  if (mimeType.startsWith("video/")) return "VIDEO";
  return "FILE";
}

export function getSearchableMessageText(message) {
  const parsed = parseMessageContent(message.content);
  return [message.sender, parsed.text, parsed.attachment?.name, parsed.attachment?.type, message.content].filter(Boolean).join(" ").toLowerCase();
}

export function getAttachmentSourceUrl(attachment) {
  return attachment?.url || attachment?.contentUrl || attachment?.downloadUrl || attachment?.dataUrl || attachment?.previewUrl || "";
}

export function parseMessageContent(content) {
  if (!content) return { text: "", attachment: null };
  if (typeof content !== "string") return { text: String(content), attachment: null };
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object" && parsed.attachment) return { text: parsed.text || "", attachment: parsed.attachment };
    return { text: content, attachment: null };
  } catch { return { text: content, attachment: null }; }
}

export function getBubbleRadius(style, mine) {
  if (style === "COMPACT") return mine ? "12px 12px 4px 12px" : "12px 12px 12px 4px";
  if (style === "ROUNDED") return "22px";
  if (style === "MINIMAL") return 8;
  return mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px";
}

export function getBubblePadding(style, compactMode) {
  if (style === "COMPACT" || compactMode) return "7px 11px";
  if (style === "MINIMAL") return "8px 0";
  return "10px 14px";
}

export function getCallTitle(mode) {
  if (mode === "video") return "Videollamada activa";
  if (mode === "screen") return "Compartiendo pantalla";
  return "Llamada de voz activa";
}

export function getCallModeText(mode) {
  if (mode === "screen") return "pantalla en uso";
  if (mode === "video") return "camara y microfono activos";
  return "microfono activo";
}

export function getElapsedSeconds(startedAt) {
  if (!startedAt) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
}

export function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function callButtonStyle(background) {
  return { width: 36, height: 36, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
}

export function formatFileSize(size = 0) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
