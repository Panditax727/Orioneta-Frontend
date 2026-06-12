import {
  Camera,
  CameraOff,
  Clock,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  Paperclip,
  Phone,
  PhoneOff,
  Search,
  Send,
  Smile,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { uploadMediaFile } from "../../../services/mediaService";
import { ensureCurrentUserProfile } from "../../../services/userService";
import { useCustomization } from "../../customization/hooks/useCustomization";
import {
  publishRealtimeEvent,
  subscribeRealtimeEvents,
} from "../../realtime/services/realtimeService";
import ProfileBadges from "../../status/components/ProfileBadges";
import { useChat } from "../hooks/useChat";

const MAX_ATTACHMENT_SIZE = 12 * 1024 * 1024;
const QUICK_EMOTES = ["✨", "💜", "🔥", "ok", "dale"];
const CALL_SIGNAL_TYPES = new Set([
  "CALL_OFFER",
  "CALL_ANSWER",
  "CALL_ICE_CANDIDATE",
  "CALL_ENDED",
  "CALL_DECLINED",
]);
const RTC_CONFIGURATION = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const DEFAULT_VISUALS = {
  chatBackground: "#0d0e14",
  accent: "#a78bfa",
  accentGradient: "linear-gradient(135deg, #a78bfa, #7c3aed)",
  incomingBubble: "#13141c",
  fontFamily: "Inter, system-ui, sans-serif",
};

export default function ChatArea({ conversation, isMobile, onBack }) {
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [callSession, setCallSession] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const fileInputRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteMediaRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);
  const callSessionRef = useRef(null);

  const { messages, loading, sending, error, sendMessage } = useChat(
    conversation?.id,
  );
  const conversationId = conversation?.backend ? conversation.id : null;

  const {
    userCustomization,
    conversationCustomization,
    visuals: customizationVisuals,
  } = useCustomization(conversationId);

  const visuals = {
    ...DEFAULT_VISUALS,
    ...(customizationVisuals || {}),
  };

  const compactMode = Boolean(userCustomization?.compactMode);
  const bubbleStyle = conversationCustomization?.bubbleStyle || "DEFAULT";
  const messageFontSize = conversationCustomization?.fontSize || 14;
  const messagePadding = compactMode ? "14px 16px" : "20px";
  const inputPadding = compactMode ? "10px 16px" : "16px 20px";
  const messageGap = compactMode ? 2 : 4;
  const conversationAvatarImage = getAvatarImage(conversation);
  const enabledMods = useMemo(
    () => new Set(userCustomization?.enabledMods || []),
    [userCustomization?.enabledMods],
  );
  const quickEmotesEnabled = enabledMods.has("quick-emotes");
  const ambientChatEnabled = enabledMods.has("ambient-chat");
  const callStudioEnabled = enabledMods.has("call-studio");

  useEffect(() => {
    callSessionRef.current = callSession;
  }, [callSession]);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = callSession?.localStream || null;
    }
  }, [callSession?.localStream]);

  useEffect(() => {
    if (remoteMediaRef.current) {
      remoteMediaRef.current.srcObject = callSession?.remoteStream || null;
    }
  }, [callSession?.remoteStream]);

  useEffect(() => {
    let mounted = true;

    async function resolveCurrentUser() {
      try {
        const profile = await ensureCurrentUserProfile();

        if (mounted) {
          setCurrentUserId(getProfileId(profile));
        }
      } catch {
        if (mounted) {
          setCurrentUserId(null);
        }
      }
    }

    queueMicrotask(() => {
      void resolveCurrentUser();
    });

    return () => {
      mounted = false;
    };
  }, [conversation?.id]);

  useEffect(() => {
    return () => {
      revokeAttachmentPreview(pendingAttachment);
    };
  }, [pendingAttachment]);

  const visibleMessages = useMemo(() => {
    if (!messageSearch.trim()) {
      return messages;
    }

    const normalizedSearch = messageSearch.trim().toLowerCase();

    return messages.filter((item) =>
      getSearchableMessageText(item).includes(normalizedSearch),
    );
  }, [messageSearch, messages]);

  const handleAttachmentSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      setNotice("El archivo no puede superar los 12 MB por ahora");
      return;
    }

    try {
      const attachment = await buildAttachmentPayload(file);
      setPendingAttachment((current) => {
        revokeAttachmentPreview(current);
        return attachment;
      });
      setNotice("");
    } catch (attachmentError) {
      setNotice(attachmentError.message || "No se pudo preparar el archivo");
    }
  };

  const handleSend = async () => {
    if ((!message.trim() && !pendingAttachment) || sending) {
      return;
    }

    try {
      if (pendingAttachment) {
        setNotice("Subiendo archivo...");
        const ownerUserId = currentUserId || getProfileId(await ensureCurrentUserProfile());
        const uploadedMedia = await uploadMediaFile({
          ownerUserId,
          file: pendingAttachment.file,
          purpose: "MESSAGE_ATTACHMENT",
        });
        const uploadedAttachment = buildUploadedAttachment(
          pendingAttachment,
          uploadedMedia,
        );
        const payload = JSON.stringify({
          text: message.trim(),
          attachment: uploadedAttachment,
        });

        await sendMessage(payload, { type: uploadedAttachment.messageType });
        revokeAttachmentPreview(pendingAttachment);
        setPendingAttachment(null);
      } else {
        await sendMessage(message.trim());
      }

      setMessage("");
      setNotice("");
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      setNotice(
        err.status === 502
          ? "El servicio de archivos aun no esta disponible en el servidor"
          : "No se pudo enviar el mensaje",
      );
    }
  };

  const publishCallSignal = async (type, payload = {}) => {
    if (!conversation?.id) {
      return;
    }

    const profile = await ensureCurrentUserProfile();
    const senderId = getProfileId(profile);

    publishRealtimeEvent({
      type,
      conversationId,
      senderId,
      messageType: "CALL_SIGNAL",
      content: JSON.stringify(payload),
    });
  };

  const createPeerConnection = (callId) => {
    const peerConnection = new RTCPeerConnection(RTC_CONFIGURATION);

    peerConnection.onicecandidate = (event) => {
      if (!event.candidate) {
        return;
      }

      void publishCallSignal("CALL_ICE_CANDIDATE", {
        callId,
        candidate: event.candidate.toJSON(),
      });
    };

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;

      if (!remoteStream) {
        return;
      }

      setCallSession((current) =>
        current?.callId === callId
          ? {
              ...current,
              status: "connected",
              remoteStream,
              startedAt: current.startedAt || new Date(),
            }
          : current,
      );
    };

    peerConnection.onconnectionstatechange = () => {
      if (["failed", "closed", "disconnected"].includes(peerConnection.connectionState)) {
        setCallSession((current) =>
          current?.callId === callId
            ? { ...current, status: "reconnecting" }
            : current,
        );
      }

      if (peerConnection.connectionState === "connected") {
        setCallSession((current) =>
          current?.callId === callId
            ? { ...current, status: "connected" }
            : current,
        );
      }
    };

    peerConnectionRef.current = peerConnection;

    return peerConnection;
  };

  const startCall = async (mode) => {
    try {
      closeCallResources();
      setNotice("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setNotice("Tu navegador no permite iniciar llamadas desde aqui");
        return;
      }

      if (!window.isSecureContext && window.location.hostname !== "localhost") {
        setNotice("Las llamadas y pantalla necesitan HTTPS en el navegador");
        return;
      }

      if (mode === "screen" && !navigator.mediaDevices?.getDisplayMedia) {
        setNotice("Tu navegador no permite compartir pantalla");
        return;
      }

      if (!conversation?.backend) {
        setNotice("Las llamadas funcionan en conversaciones sincronizadas");
        return;
      }

      const stream = await requestCallStream(mode);
      const callId = createCallId();
      const peerConnection = createPeerConnection(callId);

      if (mode === "screen") {
        stream.getVideoTracks().forEach((track) => {
          track.addEventListener("ended", () => {
            setCallSession((current) =>
              current?.localStream === stream ? null : current,
            );
          });
        });
      }

      localStreamRef.current = stream;
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      setCallSession({
        callId,
        mode,
        status: "calling",
        direction: "outgoing",
        localStream: stream,
        remoteStream: null,
        muted: false,
        cameraOff: false,
        startedAt: new Date(),
        participantName: conversation.name,
      });

      await publishCallSignal("CALL_OFFER", {
        callId,
        mode,
        offer,
      });
    } catch (callError) {
      const label =
        mode === "screen" ? "compartir pantalla" : "iniciar la llamada";

      setNotice(
        callError?.name === "NotAllowedError"
          ? "Permiso rechazado por el navegador"
          : `No se pudo ${label}`,
      );
    }
  };

  const acceptCall = async () => {
    const incomingCall = callSessionRef.current;

    if (!incomingCall?.offer) {
      return;
    }

    try {
      setNotice("");
      const stream = await requestCallStream(
        incomingCall.mode === "screen" ? "audio" : incomingCall.mode,
      );
      const peerConnection = createPeerConnection(incomingCall.callId);

      localStreamRef.current = stream;
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer),
      );
      await flushPendingIceCandidates(peerConnection, incomingCall.callId);

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      setCallSession((current) =>
        current?.callId === incomingCall.callId
          ? {
              ...current,
              status: "connected",
              direction: "incoming",
              localStream: stream,
              startedAt: new Date(),
            }
          : current,
      );

      await publishCallSignal("CALL_ANSWER", {
        callId: incomingCall.callId,
        answer,
      });
    } catch (callError) {
      setNotice(
        callError?.name === "NotAllowedError"
          ? "Permiso rechazado por el navegador"
          : "No se pudo aceptar la llamada",
      );
    }
  };

  const declineCall = async () => {
    const activeCall = callSessionRef.current;

    if (activeCall?.callId) {
      await publishCallSignal("CALL_DECLINED", {
        callId: activeCall.callId,
      });
    }

    closeCallResources();
    setCallSession(null);
  };

  const endCall = async () => {
    const activeCall = callSessionRef.current;

    if (activeCall?.callId) {
      await publishCallSignal("CALL_ENDED", {
        callId: activeCall.callId,
      });
    }

    closeCallResources();
    setCallSession(null);
  };

  const toggleAudio = () => {
    const stream = callSession?.localStream;

    if (!stream) {
      return;
    }

    const muted = !callSession.muted;

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });

    setCallSession((current) => (current ? { ...current, muted } : current));
  };

  const toggleCamera = () => {
    const stream = callSession?.localStream;

    if (!stream) {
      return;
    }

    const cameraOff = !callSession.cameraOff;

    stream.getVideoTracks().forEach((track) => {
      track.enabled = !cameraOff;
    });

    setCallSession((current) =>
      current ? { ...current, cameraOff } : current,
    );
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  async function handleCallSignal(event) {
    const payload = parseCallPayload(event.content);

    if (!payload?.callId) {
      return;
    }

    if (event.type === "CALL_OFFER") {
      if (callSessionRef.current && callSessionRef.current.callId !== payload.callId) {
        await publishCallSignal("CALL_DECLINED", {
          callId: payload.callId,
          reason: "busy",
        });
        return;
      }

      setCallSession({
        callId: payload.callId,
        mode: payload.mode || "audio",
        status: "ringing",
        direction: "incoming",
        offer: payload.offer,
        localStream: null,
        remoteStream: null,
        muted: false,
        cameraOff: false,
        startedAt: null,
        participantName: conversation.name,
      });
      return;
    }

    if (event.type === "CALL_ANSWER") {
      const peerConnection = peerConnectionRef.current;

      if (callSessionRef.current?.callId !== payload.callId || !peerConnection) {
        return;
      }

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(payload.answer),
      );
      await flushPendingIceCandidates(peerConnection, payload.callId);
      setCallSession((current) =>
        current?.callId === payload.callId
          ? { ...current, status: "connected" }
          : current,
      );
      return;
    }

    if (event.type === "CALL_ICE_CANDIDATE") {
      await addRemoteIceCandidate(payload);
      return;
    }

    if (event.type === "CALL_DECLINED" || event.type === "CALL_ENDED") {
      if (callSessionRef.current?.callId === payload.callId) {
        closeCallResources();
        setCallSession(null);
        setNotice(
          event.type === "CALL_DECLINED"
            ? "La llamada fue rechazada"
            : "La llamada finalizo",
        );
      }
    }
  }

  async function addRemoteIceCandidate({ callId, candidate }) {
    if (!candidate) {
      return;
    }

    const peerConnection = peerConnectionRef.current;

    if (callSessionRef.current?.callId !== callId || !peerConnection) {
      pendingIceCandidatesRef.current.push({ callId, candidate });
      return;
    }

    if (!peerConnection.remoteDescription) {
      pendingIceCandidatesRef.current.push({ callId, candidate });
      return;
    }

    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  async function flushPendingIceCandidates(peerConnection, callId) {
    const pendingCandidates = pendingIceCandidatesRef.current;

    pendingIceCandidatesRef.current = pendingCandidates.filter(
      (candidate) => candidate.callId !== callId,
    );

    for (const pendingCandidate of pendingCandidates) {
      if (pendingCandidate.callId === callId) {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(pendingCandidate.candidate),
        );
      }
    }
  }

  function closeCallResources() {
    stopMediaStream(localStreamRef.current);
    localStreamRef.current = null;

    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    pendingIceCandidatesRef.current = [];
  }

  useEffect(() => () => {
    closeCallResources();
  }, []);

  useEffect(() => {
    if (!conversationId || !currentUserId) {
      return undefined;
    }

    return subscribeRealtimeEvents((event) => {
      if (!isCallSignalForConversation(event, conversationId, currentUserId)) {
        return;
      }

      void handleCallSignal(event);
    });
    // El handler lee refs para usar el estado vivo de la llamada sin reabrir el socket en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, currentUserId]);

  if (!conversation) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: visuals.chatBackground,
          fontFamily: visuals.fontFamily,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#13141c",
            border: "1px solid #1e2030",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <MessageSquare size={28} color="#565f89" strokeWidth={1.5} />
        </div>

        <p style={{ color: "#565f89", fontSize: 15, fontWeight: 500 }}>
          Selecciona una conversación
        </p>

        <p style={{ color: "#2d2f45", fontSize: 13, marginTop: 4 }}>
          para empezar a chatear
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: visuals.chatBackground,
        backgroundImage: ambientChatEnabled
          ? "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)"
          : "none",
        backgroundSize: ambientChatEnabled ? "28px 28px" : "auto",
        minWidth: 0,
        fontFamily: visuals.fontFamily,
      }}
    >
      <div
        style={{
          padding: isMobile ? "0 16px 0 56px" : "0 20px",
          height: compactMode ? 54 : 60,
          flexShrink: 0,
          borderBottom: "1px solid #1e2030",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(13, 14, 20, 0.94)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isMobile && (
            <button
              type="button"
              onClick={onBack}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#c0caf5",
                padding: 4,
                marginRight: 4,
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              overflow: "hidden",
              background: visuals.accentGradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {conversationAvatarImage ? (
              <img
                src={conversationAvatarImage}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              conversation.avatar || conversation.name?.[0] || "?"
            )}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <p
                style={{
                  color: "#c0caf5",
                  fontSize: 14,
                  fontWeight: 600,
                  margin: 0,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {conversation.name}
              </p>
              <ProfileBadges badges={conversation.badges} compact max={2} />
            </div>

            <p
              style={{
                color: "#22c55e",
                fontSize: 11,
                margin: 0,
              }}
            >
              {conversation.backend
                ? "Listo para conversar"
                : conversation.online
                  ? "En línea"
                  : "Disponible en este dispositivo"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          <HeaderActionButton title="Llamada" onClick={() => void startCall("audio")}>
            <Phone size={18} />
          </HeaderActionButton>
          <HeaderActionButton title="Video" onClick={() => void startCall("video")}>
            <Video size={18} />
          </HeaderActionButton>
          <HeaderActionButton
            title="Compartir pantalla"
            onClick={() => void startCall("screen")}
          >
            <MonitorUp size={18} />
          </HeaderActionButton>
          <HeaderActionButton
            title="Buscar mensajes"
            onClick={() => setSearchOpen((current) => !current)}
          >
            <Search size={18} />
          </HeaderActionButton>
        </div>
      </div>

      {callSession && (
        <CallPanel
          conversationName={conversation.name}
          callSession={callSession}
          localVideoRef={localVideoRef}
          remoteMediaRef={remoteMediaRef}
          studioEnabled={callStudioEnabled}
          onAccept={acceptCall}
          onDecline={declineCall}
          onToggleAudio={toggleAudio}
          onToggleCamera={toggleCamera}
          onSwitchMode={startCall}
          onEnd={endCall}
        />
      )}

      {(searchOpen || notice || error) && (
        <div
          style={{
            padding: searchOpen ? "10px 20px" : "8px 20px",
            borderBottom: "1px solid #1e2030",
            background: "rgba(13, 14, 20, 0.94)",
          }}
        >
          {searchOpen && (
            <div style={{ position: "relative" }}>
              <Search
                size={14}
                color="#565f89"
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />

              <input
                autoFocus
                value={messageSearch}
                onChange={(event) => setMessageSearch(event.target.value)}
                placeholder="Buscar dentro de esta conversación"
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 32px",
                  background: "#13141c",
                  border: "1px solid #1e2030",
                  borderRadius: 10,
                  color: "#c0caf5",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          {(notice || error) && (
            <p
              style={{
                color: error ? "#ef4444" : "#a78bfa",
                fontSize: 12,
                textAlign: "center",
                margin: searchOpen ? "8px 0 0" : 0,
              }}
            >
              {error || notice}
            </p>
          )}
        </div>
      )}

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: messagePadding,
          display: "flex",
          flexDirection: "column",
          gap: messageGap,
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <span style={{ color: "#565f89" }}>Cargando mensajes...</span>
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <span style={{ color: "#565f89" }}>No hay mensajes aún</span>
          </div>
        ) : visibleMessages.length === 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <span style={{ color: "#565f89" }}>
              No hay mensajes que coincidan
            </span>
          </div>
        ) : (
          visibleMessages.map((msg, index) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              visuals={visuals}
              bubbleStyle={bubbleStyle}
              compactMode={compactMode}
              fontSize={messageFontSize}
              pushToBottom={index === 0}
            />
          ))
        )}
      </div>

      <div
        style={{
          padding: inputPadding,
          borderTop: "1px solid #1e2030",
          background: "rgba(13, 14, 20, 0.94)",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.txt,.zip,.doc,.docx"
          onChange={handleAttachmentSelect}
          style={{ display: "none" }}
        />

        {pendingAttachment && (
          <AttachmentComposerPreview
            attachment={pendingAttachment}
            onRemove={() => setPendingAttachment(null)}
          />
        )}

        {quickEmotesEnabled && (
          <QuickEmoteBar
            accent={visuals.accent}
            onSelect={(emote) =>
              setMessage((current) =>
                current.trim() ? `${current} ${emote}` : emote,
              )
            }
          />
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "#13141c",
            border: "1px solid #1e2030",
            borderRadius: 16,
            padding: "10px 14px",
            transition: "border-color 0.2s",
          }}
          onFocus={(event) => {
            event.currentTarget.style.borderColor = visuals.accent;
          }}
          onBlur={(event) => {
            event.currentTarget.style.borderColor = "#1e2030";
          }}
          tabIndex={-1}
        >
          <IconButton
            title="Adjuntar archivo"
            color="#565f89"
            hoverColor={visuals.accent}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={18} />
          </IconButton>

          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Escribe un mensaje a ${conversation.name}...`}
            rows={1}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "#c0caf5",
              fontSize: messageFontSize,
              resize: "none",
              fontFamily: visuals.fontFamily,
              lineHeight: 1.5,
              maxHeight: 100,
              overflowY: "auto",
              padding: "4px 0",
            }}
          />

          <IconButton
            title="Emojis"
            color="#565f89"
            hoverColor={visuals.accent}
            onClick={() => setMessage((current) => `${current}✨`)}
          >
            <Smile size={18} />
          </IconButton>

          <button
            type="button"
            onClick={handleSend}
            disabled={sending || (!message.trim() && !pendingAttachment)}
            title={sending ? "Enviando..." : "Enviar mensaje"}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              flexShrink: 0,
              background:
                (message.trim() || pendingAttachment) && !sending
                  ? visuals.accentGradient
                  : "#1e2030",
              border: "none",
              cursor:
                (message.trim() || pendingAttachment) && !sending
                  ? "pointer"
                  : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color:
                (message.trim() || pendingAttachment) && !sending
                  ? "white"
                  : "#565f89",
              transition: "all 0.2s",
              boxShadow:
                (message.trim() || pendingAttachment) && !sending
                  ? `0 4px 12px ${visuals.accent}40`
                  : "none",
            }}
            onMouseEnter={(event) => {
              if ((message.trim() || pendingAttachment) && !sending) {
                event.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = "scale(1)";
            }}
          >
            <Send size={16} />
          </button>
        </div>

        <p
          style={{
            color: "#2d2f45",
            fontSize: 11,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          Enter para enviar • Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  );
}

function MessageBubble({
  msg,
  visuals,
  bubbleStyle,
  compactMode,
  fontSize,
  pushToBottom = false,
}) {
  const radius = getBubbleRadius(bubbleStyle, msg.mine);
  const padding = getBubblePadding(bubbleStyle, compactMode);
  const parsed = parseMessageContent(msg.content);

  const text =
    parsed.text || (!parsed.attachment ? String(msg.content || "") : "");
  const attachment = parsed.attachment;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: msg.mine ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: compactMode ? 6 : 8,
        marginTop: pushToBottom ? "auto" : 0,
        marginBottom: compactMode ? 2 : 4,
      }}
    >
      {!msg.mine && (
        <MessageAvatar
          photo={msg.senderAvatarPhoto}
          initial={msg.senderInitial || msg.sender?.[0] || "?"}
          compactMode={compactMode}
          visuals={visuals}
        />
      )}

      <div
        style={{
          maxWidth: compactMode ? "72%" : "65%",
          background: msg.mine ? visuals.accent : visuals.incomingBubble,
          borderRadius: radius,
          padding,
          border:
            msg.mine || bubbleStyle === "MINIMAL"
              ? "none"
              : "1px solid #1e2030",
          overflow: "hidden",
        }}
      >
        {!msg.mine && (
          <p
            style={{
              color: visuals.accent,
              fontSize: 11,
              fontWeight: 600,
              marginBottom: compactMode ? 2 : 4,
            }}
          >
            {msg.sender}
          </p>
        )}

        {text && (
          <p
            style={{
              color: msg.mine ? "white" : "#c0caf5",
              fontSize,
              lineHeight: 1.4,
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {text}
          </p>
        )}

        {attachment && (
          <MessageAttachment
            attachment={attachment}
            mine={msg.mine}
            visuals={visuals}
          />
        )}

        <p
          style={{
            color: msg.mine ? "rgba(255,255,255,0.58)" : "#565f89",
            fontSize: 10,
            textAlign: "right",
            marginTop: compactMode ? 3 : 4,
            marginBottom: 0,
          }}
        >
          {msg.time}
        </p>
      </div>
    </div>
  );
}

function MessageAvatar({ photo, initial, compactMode, visuals }) {
  return (
    <div
      style={{
        width: compactMode ? 24 : 28,
        height: compactMode ? 24 : 28,
        borderRadius: "50%",
        flexShrink: 0,
        background: visuals.accentGradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: 11,
        fontWeight: 700,
        overflow: "hidden",
      }}
    >
      {photo ? (
        <img
          src={photo}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        initial
      )}
    </div>
  );
}

function MessageAttachment({ attachment, mine, visuals }) {
  const isImage =
    attachment.kind === "image" || attachment.messageType === "IMAGE";
  const isVideo =
    attachment.kind === "video" || attachment.messageType === "VIDEO";
  const isAudio =
    attachment.kind === "audio" || attachment.messageType === "AUDIO";
  const iconColor = mine ? "white" : visuals.accent;
  const sourceUrl = getAttachmentSourceUrl(attachment);

  if (isImage && sourceUrl) {
    return (
      <div style={{ marginTop: 8 }}>
        <img
          src={sourceUrl}
          alt={attachment.name || "Imagen adjunta"}
          style={{
            maxWidth: 260,
            width: "100%",
            borderRadius: 12,
            display: "block",
            border: mine
              ? "1px solid rgba(255,255,255,0.18)"
              : "1px solid #1e2030",
          }}
        />

        <p
          style={{
            margin: "6px 0 0",
            fontSize: 11,
            color: mine ? "rgba(255,255,255,0.65)" : "#565f89",
          }}
        >
          {attachment.name} • {formatFileSize(attachment.size)}
        </p>
      </div>
    );
  }

  if (isVideo && sourceUrl) {
    return (
      <div style={{ marginTop: 8 }}>
        <video
          controls
          src={sourceUrl}
          style={{
            maxWidth: 320,
            width: "100%",
            maxHeight: 240,
            borderRadius: 12,
            display: "block",
            background: "#05060a",
            border: mine
              ? "1px solid rgba(255,255,255,0.18)"
              : "1px solid #1e2030",
          }}
        />

        <AttachmentCaption attachment={attachment} mine={mine} />
      </div>
    );
  }

  if (isAudio && sourceUrl) {
    return (
      <div
        style={{
          marginTop: 8,
          padding: "10px 12px",
          borderRadius: 12,
          background: mine ? "rgba(255,255,255,0.14)" : "#0d0e14",
          border: mine
            ? "1px solid rgba(255,255,255,0.16)"
            : "1px solid #1e2030",
        }}
      >
        <audio controls src={sourceUrl} style={{ width: 260 }} />
        <AttachmentCaption attachment={attachment} mine={mine} />
      </div>
    );
  }

  return (
    <a
      href={sourceUrl || undefined}
      target={sourceUrl ? "_blank" : undefined}
      rel={sourceUrl ? "noreferrer" : undefined}
      style={{
        marginTop: 8,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 12,
        background: mine ? "rgba(255,255,255,0.14)" : "#0d0e14",
        border: mine ? "1px solid rgba(255,255,255,0.16)" : "1px solid #1e2030",
        textDecoration: "none",
        cursor: sourceUrl ? "pointer" : "default",
      }}
    >
      {isVideo ? (
        <Video size={18} color={iconColor} />
      ) : isAudio ? (
        <Mic size={18} color={iconColor} />
      ) : (
        <FileText size={18} color={iconColor} />
      )}

      <div style={{ minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            color: mine ? "white" : "#c0caf5",
            fontSize: 13,
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 190,
          }}
        >
          {attachment.name || "Archivo"}
        </p>

        <p
          style={{
            margin: "2px 0 0",
            color: mine ? "rgba(255,255,255,0.65)" : "#565f89",
            fontSize: 11,
          }}
        >
          {formatFileSize(attachment.size)}
        </p>
      </div>
    </a>
  );
}

function AttachmentCaption({ attachment, mine }) {
  return (
    <p
      style={{
        margin: "6px 0 0",
        fontSize: 11,
        color: mine ? "rgba(255,255,255,0.65)" : "#565f89",
      }}
    >
      {attachment.name} • {formatFileSize(attachment.size)}
    </p>
  );
}

function AttachmentComposerPreview({ attachment, onRemove }) {
  const isImage = attachment.kind === "image";
  const isVideo = attachment.kind === "video";
  const isAudio = attachment.kind === "audio";

  return (
    <div
      style={{
        marginBottom: 10,
        padding: 10,
        borderRadius: 14,
        background: "#13141c",
        border: "1px solid #1e2030",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "#0d0e14",
          border: "1px solid #1e2030",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {isImage && attachment.previewUrl ? (
          <img
            src={attachment.previewUrl}
            alt={attachment.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : isVideo && attachment.previewUrl ? (
          <video
            src={attachment.previewUrl}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : isImage ? (
          <ImageIcon size={20} color="#a78bfa" />
        ) : isVideo ? (
          <Video size={20} color="#a78bfa" />
        ) : isAudio ? (
          <Mic size={20} color="#a78bfa" />
        ) : (
          <FileText size={20} color="#a78bfa" />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            color: "#c0caf5",
            fontSize: 13,
            fontWeight: 600,
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {attachment.name}
        </p>

        <p
          style={{
            color: "#565f89",
            fontSize: 11,
            margin: "3px 0 0",
          }}
        >
          {attachment.type || "Archivo"} • {formatFileSize(attachment.size)}
        </p>
      </div>

      <button
        type="button"
        onClick={onRemove}
        title="Quitar archivo"
        style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          border: "none",
          background: "#1e2030",
          color: "#c0caf5",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

function QuickEmoteBar({ accent, onSelect }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 10,
        overflowX: "auto",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          color: "#565f89",
          fontSize: 11,
          fontWeight: 800,
          marginRight: 2,
          whiteSpace: "nowrap",
        }}
      >
        <Sparkles size={12} color={accent} />
        Rapido
      </span>

      {QUICK_EMOTES.map((emote) => (
        <button
          key={emote}
          type="button"
          onClick={() => onSelect(emote)}
          style={{
            height: 28,
            borderRadius: 999,
            border: "1px solid #1e2030",
            background: "#13141c",
            color: "#c0caf5",
            padding: "0 10px",
            fontSize: 12,
            fontWeight: 800,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {emote}
        </button>
      ))}
    </div>
  );
}

function CallPanel({
  conversationName,
  callSession,
  localVideoRef,
  remoteMediaRef,
  studioEnabled,
  onAccept,
  onDecline,
  onToggleAudio,
  onToggleCamera,
  onSwitchMode,
  onEnd,
}) {
  const isVideoLike =
    callSession.mode === "video" || callSession.mode === "screen";
  const callTitle = getCallTitle(callSession.mode);
  const isIncoming = callSession.status === "ringing";
  const isConnecting =
    callSession.status === "calling" || callSession.status === "reconnecting";
  const hasRemoteStream = Boolean(callSession.remoteStream);
  const [elapsed, setElapsed] = useState(() =>
    getElapsedSeconds(callSession.startedAt),
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsed(getElapsedSeconds(callSession.startedAt));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [callSession.startedAt]);

  return (
    <div
      style={{
        padding: "14px 20px",
        borderBottom: "1px solid #1e2030",
        background:
          "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(13,14,20,0.96))",
      }}
    >
      <div
        style={{
          border: "1px solid #2d2f45",
          borderRadius: 18,
          overflow: "hidden",
          background: "#0d0e14",
        }}
      >
        {!isVideoLike && (
          <div
            style={{
              minHeight: 112,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.12), #05060a)",
            }}
            >
              {hasRemoteStream && (
                <audio ref={remoteMediaRef} autoPlay playsInline />
              )}
              <div
                style={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <Phone size={24} />
            </div>
              <div>
                <p style={{ margin: 0, color: "#c0caf5", fontSize: 15, fontWeight: 800 }}>
                  {isIncoming ? "Llamada entrante" : "Voz activa"}
                </p>
                <p style={{ margin: "3px 0 0", color: "#565f89", fontSize: 12 }}>
                  {isIncoming
                    ? "Puedes aceptar o rechazar"
                    : isConnecting
                      ? "Conectando con la otra persona"
                      : "Microfono listo para hablar"}
                </p>
              </div>
            </div>
        )}

        {isVideoLike && (
          <div
            style={{
              height: 180,
              background: "#05060a",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {hasRemoteStream ? (
              <video
                ref={remoteMediaRef}
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: callSession.cameraOff || isIncoming ? 0.2 : 1,
                }}
              />
            )}

            {hasRemoteStream && callSession.localStream && (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                style={{
                  position: "absolute",
                  right: 12,
                  bottom: 12,
                  width: 112,
                  height: 72,
                  objectFit: "cover",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "#0d0e14",
                }}
              />
            )}

            {(callSession.cameraOff || isIncoming || isConnecting) && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#565f89",
                  fontSize: 13,
                }}
              >
                {isIncoming
                  ? "Llamada entrante"
                  : isConnecting
                    ? "Conectando..."
                    : callSession.mode === "screen"
                      ? "Pantalla pausada"
                      : "Cámara desactivada"}
              </div>
            )}
          </div>
        )}

        <div
          style={{
            padding: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                color: "#c0caf5",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {callTitle}
            </p>

            <p
              style={{
                margin: "3px 0 0",
                color: "#565f89",
                fontSize: 12,
              }}
            >
              {conversationName} • {getCallModeText(callSession.mode)}
            </p>

            {!isIncoming && (
              <p
                style={{
                  margin: "7px 0 0",
                  color: "#8f9ac7",
                  fontSize: 11,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Clock size={12} />
                {formatDuration(elapsed)}
              </p>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isIncoming ? (
              <>
                <button
                  type="button"
                  onClick={onDecline}
                  title="Rechazar llamada"
                  style={callButtonStyle("#ef4444")}
                >
                  <PhoneOff size={17} />
                </button>
                <button
                  type="button"
                  onClick={onAccept}
                  title="Aceptar llamada"
                  style={callButtonStyle("#22c55e")}
                >
                  <Phone size={17} />
                </button>
              </>
            ) : (
              <>
            {studioEnabled && (
              <>
                <CallModeButton
                  active={callSession.mode === "audio"}
                  title="Cambiar a voz"
                  onClick={() => onSwitchMode("audio")}
                >
                  <Phone size={15} />
                </CallModeButton>

                <CallModeButton
                  active={callSession.mode === "video"}
                  title="Cambiar a video"
                  onClick={() => onSwitchMode("video")}
                >
                  <Video size={15} />
                </CallModeButton>

                <CallModeButton
                  active={callSession.mode === "screen"}
                  title="Compartir pantalla"
                  onClick={() => onSwitchMode("screen")}
                >
                  <MonitorUp size={15} />
                </CallModeButton>
              </>
            )}

            <button
              type="button"
              onClick={onToggleAudio}
              title={
                callSession.muted ? "Activar micrófono" : "Silenciar micrófono"
              }
              style={callButtonStyle(callSession.muted ? "#ef4444" : "#1e2030")}
            >
              {callSession.muted ? <MicOff size={17} /> : <Mic size={17} />}
            </button>

            {isVideoLike && (
              <button
                type="button"
                onClick={onToggleCamera}
                title={
                  callSession.mode === "screen"
                    ? callSession.cameraOff
                      ? "Reanudar pantalla"
                      : "Pausar pantalla"
                    : callSession.cameraOff
                      ? "Activar cámara"
                      : "Desactivar cámara"
                }
                style={callButtonStyle(
                  callSession.cameraOff ? "#ef4444" : "#1e2030",
                )}
              >
                {callSession.cameraOff ? (
                  <CameraOff size={17} />
                ) : (
                  <Camera size={17} />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onEnd}
              title="Finalizar llamada"
              style={{
                ...callButtonStyle("#ef4444"),
                boxShadow: "0 8px 18px rgba(239,68,68,0.28)",
              }}
            >
              <PhoneOff size={17} />
            </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CallModeButton({ active, children, title, onClick }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={active}
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        border: "1px solid #1e2030",
        background: active ? "#7c3aed" : "#1e2030",
        color: active ? "white" : "#8f9ac7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: active ? "default" : "pointer",
        opacity: active ? 1 : 0.82,
      }}
    >
      {children}
    </button>
  );
}

function HeaderActionButton({ children, title, onClick }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#565f89",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = "#1a1b26";
        event.currentTarget.style.color = "#c0caf5";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "transparent";
        event.currentTarget.style.color = "#565f89";
      }}
    >
      {children}
    </button>
  );
}

function IconButton({ children, title, color, hoverColor, onClick }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color,
        padding: "6px",
        borderRadius: 8,
        transition: "all 0.15s",
        flexShrink: 0,
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = "#1a1b26";
        event.currentTarget.style.color = hoverColor;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "none";
        event.currentTarget.style.color = color;
      }}
    >
      {children}
    </button>
  );
}

function getAvatarImage(conversation) {
  const candidate = conversation?.avatarPhoto || conversation?.profilePhoto || conversation?.avatar;

  if (typeof candidate !== "string") {
    return "";
  }

  return /^(data:image|blob:|https?:\/\/)/i.test(candidate) ? candidate : "";
}

function stopMediaStream(stream) {
  if (!stream) {
    return;
  }

  stream.getTracks().forEach((track) => {
    track.stop();
  });
}

async function buildAttachmentPayload(file) {
  if (!file) {
    throw new Error("Archivo inválido");
  }

  const previewUrl = URL.createObjectURL(file);
  const kind = getAttachmentKind(file.type);
  const messageType = getMessageTypeFromFile(file.type);

  return {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    file,
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    kind,
    messageType,
    previewUrl,
    createdAt: new Date().toISOString(),
  };
}

function getAttachmentKind(mimeType = "") {
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("audio/")) {
    return "audio";
  }

  if (mimeType.startsWith("video/")) {
    return "video";
  }

  return "file";
}

function buildUploadedAttachment(draftAttachment, uploadedMedia) {
  return {
    id: uploadedMedia.id || draftAttachment.id,
    mediaId: uploadedMedia.id,
    name: uploadedMedia.fileName || uploadedMedia.name || draftAttachment.name,
    size: uploadedMedia.size || draftAttachment.size,
    type: uploadedMedia.contentType || uploadedMedia.type || draftAttachment.type,
    kind: draftAttachment.kind,
    messageType: draftAttachment.messageType,
    url: uploadedMedia.url,
    createdAt: uploadedMedia.createdAt || new Date().toISOString(),
  };
}

function revokeAttachmentPreview(attachment) {
  if (attachment?.previewUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(attachment.previewUrl);
  }
}

async function requestCallStream(mode) {
  if (mode === "screen") {
    return navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
  }

  return navigator.mediaDevices.getUserMedia({
    audio: true,
    video: mode === "video",
  });
}

function createCallId() {
  return crypto.randomUUID?.() || `call-${Date.now()}-${Math.random()}`;
}

function getProfileId(profile) {
  return profile?.id || profile?.userId || profile?.userID || profile?.uuid || null;
}

function isCallSignalForConversation(event, conversationId, currentUserId) {
  if (!CALL_SIGNAL_TYPES.has(event?.type)) {
    return false;
  }

  if (!event.conversationId || String(event.conversationId) !== String(conversationId)) {
    return false;
  }

  return String(event.senderId || "") !== String(currentUserId || "");
}

function parseCallPayload(content) {
  try {
    return typeof content === "string" ? JSON.parse(content) : content;
  } catch {
    return null;
  }
}

function getMessageTypeFromFile(mimeType = "") {
  if (mimeType.startsWith("image/")) {
    return "IMAGE";
  }

  if (mimeType.startsWith("audio/")) {
    return "AUDIO";
  }

  if (mimeType.startsWith("video/")) {
    return "VIDEO";
  }

  return "FILE";
}

function getSearchableMessageText(message) {
  const parsed = parseMessageContent(message.content);

  return [
    message.sender,
    parsed.text,
    parsed.attachment?.name,
    parsed.attachment?.type,
    message.content,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getAttachmentSourceUrl(attachment) {
  return (
    attachment?.url ||
    attachment?.contentUrl ||
    attachment?.downloadUrl ||
    attachment?.dataUrl ||
    attachment?.previewUrl ||
    ""
  );
}

function parseMessageContent(content) {
  if (!content) {
    return {
      text: "",
      attachment: null,
    };
  }

  if (typeof content !== "string") {
    return {
      text: String(content),
      attachment: null,
    };
  }

  try {
    const parsed = JSON.parse(content);

    if (parsed && typeof parsed === "object" && parsed.attachment) {
      return {
        text: parsed.text || "",
        attachment: parsed.attachment,
      };
    }

    return {
      text: content,
      attachment: null,
    };
  } catch {
    return {
      text: content,
      attachment: null,
    };
  }
}

function getBubbleRadius(style, mine) {
  if (style === "COMPACT") {
    return mine ? "12px 12px 4px 12px" : "12px 12px 12px 4px";
  }

  if (style === "ROUNDED") {
    return "22px";
  }

  if (style === "MINIMAL") {
    return 8;
  }

  return mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px";
}

function getBubblePadding(style, compactMode) {
  if (style === "COMPACT" || compactMode) {
    return "7px 11px";
  }

  if (style === "MINIMAL") {
    return "8px 0";
  }

  return "10px 14px";
}

function getCallTitle(mode) {
  if (mode === "video") {
    return "Videollamada activa";
  }

  if (mode === "screen") {
    return "Compartiendo pantalla";
  }

  return "Llamada de voz activa";
}

function getCallModeText(mode) {
  if (mode === "screen") {
    return "pantalla en uso";
  }

  if (mode === "video") {
    return "camara y microfono activos";
  }

  return "microfono activo";
}

function getElapsedSeconds(startedAt) {
  if (!startedAt) {
    return 0;
  }

  return Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function callButtonStyle(background) {
  return {
    width: 36,
    height: 36,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background,
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

function formatFileSize(size = 0) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
