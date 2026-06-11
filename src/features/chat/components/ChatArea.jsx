import {
  Camera,
  CameraOff,
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
  Video,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCustomization } from "../../customization/hooks/useCustomization";
import { useChat } from "../hooks/useChat";

const MAX_ATTACHMENT_SIZE = 8 * 1024 * 1024;

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

  const fileInputRef = useRef(null);
  const callVideoRef = useRef(null);

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

  useEffect(() => {
    return () => {
      stopMediaStream(callSession?.stream);
    };
  }, [callSession?.stream]);

  useEffect(() => {
    if (callVideoRef.current) {
      callVideoRef.current.srcObject = callSession?.stream || null;
    }
  }, [callSession?.stream]);

  const visibleMessages = useMemo(() => {
    if (!messageSearch.trim()) {
      return messages;
    }

    const normalizedSearch = messageSearch.trim().toLowerCase();

    return messages.filter((item) =>
      getSearchableMessageText(item).includes(normalizedSearch),
    );
  }, [messageSearch, messages]);

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

  const handleAttachmentSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      setNotice("El archivo no puede superar los 8 MB");
      return;
    }

    try {
      const attachment = await buildAttachmentPayload(file);
      setPendingAttachment(attachment);
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
        const payload = JSON.stringify({
          text: message.trim(),
          attachment: pendingAttachment,
        });

        await sendMessage(payload, { type: pendingAttachment.messageType });
        setPendingAttachment(null);
      } else {
        await sendMessage(message.trim());
      }

      setMessage("");
      setNotice("");
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      setNotice("No se pudo enviar el mensaje");
    }
  };

  const startCall = async (mode) => {
    try {
      stopMediaStream(callSession?.stream);
      setNotice("");

      const stream =
        mode === "screen"
          ? await navigator.mediaDevices.getDisplayMedia({
              video: true,
              audio: false,
            })
          : await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: mode === "video",
            });

      setCallSession({
        mode,
        stream,
        muted: false,
        cameraOff: false,
        startedAt: new Date(),
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

  const endCall = () => {
    stopMediaStream(callSession?.stream);
    setCallSession(null);
  };

  const toggleAudio = () => {
    const stream = callSession?.stream;

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
    const stream = callSession?.stream;

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

  const showTemporaryNotice = (text) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const headerActions = [
    {
      icon: <Phone size={18} />,
      key: "phone",
      title: "Llamada",
      onClick: () => startCall("audio"),
    },
    {
      icon: <Video size={18} />,
      key: "video",
      title: "Video",
      onClick: () => startCall("video"),
    },
    {
      icon: <MonitorUp size={18} />,
      key: "screen",
      title: "Compartir pantalla",
      onClick: () => startCall("screen"),
    },
    {
      icon: <Search size={18} />,
      key: "search",
      title: "Buscar mensajes",
      onClick: () => setSearchOpen((current) => !current),
    },
  ];

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: visuals.chatBackground,
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
            <p
              style={{
                color: "#c0caf5",
                fontSize: 14,
                fontWeight: 600,
                margin: 0,
              }}
            >
              {conversation.name}
            </p>

            <p
              style={{
                color: "#22c55e",
                fontSize: 11,
                margin: 0,
              }}
            >
              {conversation.backend
                ? "Backend local"
                : conversation.online
                  ? "En línea"
                  : "Modo local"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {headerActions.map(({ icon, key, title, onClick }) => (
            <button
              key={key}
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
              {icon}
            </button>
          ))}
        </div>
      </div>

      {callSession && (
        <CallPanel
          conversationName={conversation.name}
          callSession={callSession}
          videoRef={callVideoRef}
          onToggleAudio={toggleAudio}
          onToggleCamera={toggleCamera}
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
          visibleMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              visuals={visuals}
              bubbleStyle={bubbleStyle}
              compactMode={compactMode}
              fontSize={messageFontSize}
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
          onChange={handleAttachmentSelect}
          style={{ display: "none" }}
        />

        {pendingAttachment && (
          <AttachmentComposerPreview
            attachment={pendingAttachment}
            onRemove={() => setPendingAttachment(null)}
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
            onClick={() =>
              showTemporaryNotice(
                "Selector de emojis pendiente para la siguiente mejora visual",
              )
            }
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

function MessageBubble({ msg, visuals, bubbleStyle, compactMode, fontSize }) {
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
        marginBottom: compactMode ? 2 : 4,
      }}
    >
      {!msg.mine && (
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
            fontWeight: 600,
          }}
        >
          {msg.sender?.[0] || "?"}
        </div>
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

function MessageAttachment({ attachment, mine, visuals }) {
  const isImage =
    attachment.kind === "image" || attachment.messageType === "IMAGE";
  const iconColor = mine ? "white" : visuals.accent;

  if (isImage && attachment.dataUrl) {
    return (
      <div style={{ marginTop: 8 }}>
        <img
          src={attachment.dataUrl}
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

  return (
    <div
      style={{
        marginTop: 8,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 12,
        background: mine ? "rgba(255,255,255,0.14)" : "#0d0e14",
        border: mine ? "1px solid rgba(255,255,255,0.16)" : "1px solid #1e2030",
      }}
    >
      <FileText size={18} color={iconColor} />

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
    </div>
  );
}

function AttachmentComposerPreview({ attachment, onRemove }) {
  const isImage = attachment.kind === "image";

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
        {isImage && attachment.dataUrl ? (
          <img
            src={attachment.dataUrl}
            alt={attachment.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : isImage ? (
          <ImageIcon size={20} color="#a78bfa" />
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

function CallPanel({
  conversationName,
  callSession,
  videoRef,
  onToggleAudio,
  onToggleCamera,
  onEnd,
}) {
  const isVideoLike =
    callSession.mode === "video" || callSession.mode === "screen";
  const callTitle = getCallTitle(callSession.mode);

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
        {isVideoLike && (
          <div
            style={{
              height: 180,
              background: "#05060a",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: callSession.cameraOff ? 0.2 : 1,
              }}
            />

            {callSession.cameraOff && (
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
                Cámara desactivada
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
              {conversationName} • llamada local de prueba
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                  callSession.cameraOff ? "Activar cámara" : "Desactivar cámara"
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
          </div>
        </div>
      </div>
    </div>
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

  const dataUrl = await readFileAsDataURL(file);
  const kind = getAttachmentKind(file.type);
  const messageType = getMessageTypeFromFile(file.type);

  return {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    kind,
    messageType,
    dataUrl,
    createdAt: new Date().toISOString(),
  };
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));

    reader.readAsDataURL(file);
  });
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
