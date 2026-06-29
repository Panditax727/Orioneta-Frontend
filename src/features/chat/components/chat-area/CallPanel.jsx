import { useEffect, useState } from "react";
import { Camera, CameraOff, Clock, Mic, MicOff, MonitorUp, Phone, PhoneOff, Video } from "lucide-react";
import { getCallTitle, getCallModeText, getElapsedSeconds, formatDuration, callButtonStyle } from "./chatUtils";

export function CallModeButton({ active, children, title, onClick }) {
  return (
    <button type="button" title={title} onClick={onClick} disabled={active} style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid #1e2030", background: active ? "#7c3aed" : "#1e2030", color: active ? "white" : "#8f9ac7", display: "flex", alignItems: "center", justifyContent: "center", cursor: active ? "default" : "pointer", opacity: active ? 1 : 0.82 }}>
      {children}
    </button>
  );
}

export default function CallPanel({ conversationName, callSession, localVideoRef, remoteMediaRef, participantAvatar, studioEnabled, isMobile, onAccept, onDecline, onToggleAudio, onToggleCamera, onSwitchMode, onEnd }) {
  if (!callSession) return null;
  
  const isVideoLike = callSession.mode === "video" || callSession.mode === "screen";
  const callTitle = getCallTitle(callSession.mode);
  const isIncoming = callSession.status === "ringing";
  const isConnecting = callSession.status === "calling" || callSession.status === "reconnecting";
  const hasRemoteStream = Boolean(callSession.remoteStream);
  const [elapsed, setElapsed] = useState(() => getElapsedSeconds(callSession.startedAt));

  useEffect(() => {
    const interval = window.setInterval(() => setElapsed(getElapsedSeconds(callSession.startedAt)), 1000);
    return () => window.clearInterval(interval);
  }, [callSession.startedAt]);

  return (
    <div style={{ position: "absolute", inset: isMobile ? "64px 10px 104px" : "76px 24px 128px", zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ width: isVideoLike ? "min(980px, 100%)" : "min(680px, 100%)", maxHeight: "100%", border: "1px solid rgba(167, 139, 250, 0.28)", borderRadius: 24, overflow: "hidden", background: "linear-gradient(180deg, rgba(19,20,28,0.96), rgba(7,8,13,0.98))", boxShadow: "0 28px 80px rgba(0,0,0,0.52)", pointerEvents: "auto", backdropFilter: "blur(14px)" }}>
        {!isVideoLike && (
          <div style={{ minHeight: isMobile ? 240 : 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "radial-gradient(circle at center, rgba(124,58,237,0.22), transparent 58%), linear-gradient(135deg, rgba(124,58,237,0.16), #05060a)" }}>
            {hasRemoteStream && <audio ref={remoteMediaRef} autoPlay playsInline />}
            <div style={{ width: 86, height: 86, borderRadius: "50%", background: "linear-gradient(135deg, #8b5cf6, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", overflow: "hidden", boxShadow: "0 0 0 10px rgba(124,58,237,0.10)" }}>
              {participantAvatar ? <img src={participantAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Phone size={30} />}
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, color: "#f8f7ff", fontSize: 18, fontWeight: 900 }}>{isIncoming ? "Llamada entrante" : "Voz activa"}</p>
              <p style={{ margin: "6px 0 0", color: "#8f9ac7", fontSize: 13 }}>{isIncoming ? "Puedes aceptar o rechazar" : isConnecting ? "Conectando con la otra persona" : "Microfono listo para hablar"}</p>
            </div>
          </div>
        )}

        {isVideoLike && (
          <div style={{ height: isMobile ? "52vh" : "min(58vh, 520px)", minHeight: 320, background: "#05060a", position: "relative", overflow: "hidden" }}>
            {hasRemoteStream ? (
              <video ref={remoteMediaRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: callSession.mode === "screen" ? "contain" : "cover" }} />
            ) : (
              <video ref={localVideoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: callSession.mode === "screen" ? "contain" : "cover", opacity: callSession.cameraOff || isIncoming ? 0.2 : 1 }} />
            )}
            {hasRemoteStream && callSession.localStream && (
              <video ref={localVideoRef} autoPlay muted playsInline style={{ position: "absolute", right: 12, bottom: 12, width: isMobile ? 108 : 168, height: isMobile ? 72 : 104, objectFit: "cover", borderRadius: 16, border: "1px solid rgba(255,255,255,0.16)", background: "#0d0e14", boxShadow: "0 16px 40px rgba(0,0,0,0.35)" }} />
            )}
            {(callSession.cameraOff || isIncoming || isConnecting) && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#565f89", fontSize: 14, fontWeight: 800 }}>
                {isIncoming ? "Llamada entrante" : isConnecting ? "Conectando..." : callSession.mode === "screen" ? "Pantalla pausada" : "Cámara desactivada"}
              </div>
            )}
          </div>
        )}

        <div style={{ padding: isMobile ? 12 : 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: isMobile ? "wrap" : "nowrap" }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, color: "#c0caf5", fontSize: 14, fontWeight: 700 }}>{callTitle}</p>
            <p style={{ margin: "3px 0 0", color: "#565f89", fontSize: 12 }}>{conversationName} • {getCallModeText(callSession.mode)}</p>
            {!isIncoming && <p style={{ margin: "7px 0 0", color: "#8f9ac7", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 5 }}><Clock size={12} />{formatDuration(elapsed)}</p>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isIncoming ? (
              <>
                <button type="button" onClick={onDecline} title="Rechazar llamada" style={callButtonStyle("#ef4444")}><PhoneOff size={17} /></button>
                <button type="button" onClick={onAccept} title="Aceptar llamada" style={callButtonStyle("#22c55e")}><Phone size={17} /></button>
              </>
            ) : (
              <>
                {studioEnabled && (
                  <>
                    <CallModeButton active={callSession.mode === "audio"} title="Cambiar a voz" onClick={() => onSwitchMode("audio")}><Phone size={15} /></CallModeButton>
                    <CallModeButton active={callSession.mode === "video"} title="Cambiar a video" onClick={() => onSwitchMode("video")}><Video size={15} /></CallModeButton>
                    <CallModeButton active={callSession.mode === "screen"} title="Compartir pantalla" onClick={() => onSwitchMode("screen")}><MonitorUp size={15} /></CallModeButton>
                  </>
                )}
                <button type="button" onClick={onToggleAudio} title={callSession.muted ? "Activar micrófono" : "Silenciar micrófono"} style={callButtonStyle(callSession.muted ? "#ef4444" : "#1e2030")}>
                  {callSession.muted ? <MicOff size={17} /> : <Mic size={17} />}
                </button>
                {isVideoLike && (
                  <button type="button" onClick={onToggleCamera} title={callSession.mode === "screen" ? (callSession.cameraOff ? "Reanudar pantalla" : "Pausar pantalla") : callSession.cameraOff ? "Activar cámara" : "Desactivar cámara"} style={callButtonStyle(callSession.cameraOff ? "#ef4444" : "#1e2030")}>
                    {callSession.cameraOff ? <CameraOff size={17} /> : <Camera size={17} />}
                  </button>
                )}
                <button type="button" onClick={onEnd} title="Finalizar llamada" style={{ ...callButtonStyle("#ef4444"), boxShadow: "0 8px 18px rgba(239,68,68,0.28)" }}><PhoneOff size={17} /></button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
