import { useEffect, useMemo, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { MessageSquare, MonitorUp, Paperclip, Phone, Search, Send, Smile, Video } from "lucide-react";
import { uploadMediaFile } from "../../../services/mediaService";
import { chatService } from "../services/chatService";
import { ensureCurrentUserProfile, findUserById } from "../../../services/userService";
import { useCustomization } from "../../customization/hooks/useCustomization";
import { publishRealtimeEvent, subscribeRealtimeEvents } from "../../realtime/services/realtimeService";
import ProfileBadges from "../../status/components/ProfileBadges";
import { useChat } from "../hooks/useChat";
import ProfileCard from "./chat-area/ProfileCard";
import MessageBubble from "./chat-area/MessageBubble";
import AttachmentComposerPreview from "./chat-area/AttachmentComposerPreview";
import QuickEmoteBar from "./chat-area/QuickEmoteBar";
import FriendProfilePanel from "./chat-area/FriendProfilePanel";
import CallPanel from "./chat-area/CallPanel";
import HeaderActionButton from "./chat-area/HeaderActionButton";
import IconButton from "./chat-area/IconButton";
import TypingIndicator from "./chat-area/TypingIndicator";
import { useTypingIndicator } from "../hooks/useTypingIndicator";
import { useCallRingtone } from "../../call/hooks/useCallRingtone";
import {
  MAX_ATTACHMENT_SIZE, QUICK_EMOTES, RTC_CONFIGURATION, DEFAULT_VISUALS,
  getConversationDisplayAvatar, getConversationInitial, isGroupConversation,
  buildConversationProfile, playFeedbackSound, stopMediaStream, buildAttachmentPayload,
  buildUploadedAttachment, revokeAttachmentPreview, requestCallStream, createCallId, getProfileId,
  isCallSignalForConversation, parseCallPayload, getSearchableMessageText,
} from "./chat-area/chatUtils";
import { REALTIME_STATUS_EVENT } from "../../realtime/hooks/useRealtimeConnection";

const ChatArea = forwardRef(function ChatArea({
  conversation,
  isMobile,
  onBack,
  onToggleDetails,
  detailsOpen,
  messageSearchOpen: externalSearchOpen,
  onMessageSearchOpenChange,
  messageSearchQuery: externalSearchQuery,
  onMessageSearchQueryChange,
  sideProfile,
  onOpenSideProfile,
  onCloseSideProfile,
  onFriendConversation,
}, ref) {
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [callSession, setCallSession] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [friendProfile, setFriendProfile] = useState(null);
  const [profileCard, setProfileCard] = useState(null);
  const profileCardAnchorRef = useRef(null);

  const fileInputRef = useRef(null);
  const composerInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteMediaRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);
  const callSessionRef = useRef(null);
  const { startRingtone, stopRingtone } = useCallRingtone();
  const shouldStickToBottomRef = useRef(true);
  const latestMessageKeyRef = useRef(null);
  const pendingOutgoingDraftRef = useRef(null);
  const wsConnectedRef = useRef(true);

  useEffect(() => {
    const handler = (e) => { wsConnectedRef.current = e.detail.status === "connected"; };
    window.addEventListener(REALTIME_STATUS_EVENT, handler);
    return () => window.removeEventListener(REALTIME_STATUS_EVENT, handler);
  }, []);

  const { messages, loading, sending, error, sendMessage, fetchMessages } = useChat(conversation?.id);

  const handleEditMessage = async (messageId, newContent) => {
    try {
      await chatService.editMessage(conversation.id, messageId, newContent);
      await fetchMessages({ silent: true });
      setNotice("Mensaje editado");
      window.setTimeout(() => setNotice(""), 2500);
    } catch (err) {
      setNotice(err.message || "No se pudo editar el mensaje");
      window.setTimeout(() => setNotice(""), 3000);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await chatService.deleteMessage(conversation.id, messageId);
      await fetchMessages({ silent: true });
    } catch (err) {
      setNotice(err.message || "No se pudo eliminar el mensaje");
      window.setTimeout(() => setNotice(""), 3000);
    }
  };

  const handleAvatarClick = async (msg, anchorElement) => {
    const senderId = msg.senderId || (msg.mine ? currentUserId : null);

    if (!senderId || !anchorElement) {
      return;
    }

    // Set the anchor ref first
    profileCardAnchorRef.current = anchorElement;

    try {
      const profile = await findUserById(senderId);

      if (profile) {
        setProfileCard({
          ...profile,
          id: senderId,
          name: profile.displayName || profile.userName || msg.sender,
          avatarPhoto: profile.profilePhoto || profile.avatarUrl || msg.senderAvatarPhoto || "",
        });
      }
    } catch {
      setProfileCard({
        id: senderId,
        name: msg.sender,
        avatar: msg.senderInitial || msg.sender?.[0] || "?",
        avatarPhoto: msg.senderAvatarPhoto || "",
      });
    }
  };

  const handleProfileCardSendMessage = (profile) => {
    onFriendConversation?.({
      ...profile,
      id: profile.id || profile.userId,
      friendId: profile.id || profile.userId,
      name: profile.displayName || profile.name || profile.userName,
      avatar: profile.avatar || (profile.displayName || profile.name || "?").trim().charAt(0).toUpperCase(),
      avatarPhoto: profile.avatarPhoto || profile.profilePhoto || "",
      lastMessage: "Aun no hay mensajes",
      time: "",
      unread: 0,
      online: profile.status === "ONLINE",
    });
  };

  const handleHeaderAvatarClick = () => {
    if (isGroup) {
      onToggleDetails?.();
      return;
    }

    if (profileForPanel) {
      onOpenSideProfile?.(profileForPanel);
    }
  };
  const conversationId = conversation?.backend ? conversation.id : null;

  const { typingUsers, onUserTyping } = useTypingIndicator(conversationId, currentUserId);

  const { userCustomization, conversationCustomization, visuals: customizationVisuals } = useCustomization(conversationId);
  const visuals = { ...DEFAULT_VISUALS, ...(customizationVisuals || {}) };
  const compactMode = Boolean(userCustomization?.compactMode);
  const bubbleStyle = conversationCustomization?.bubbleStyle || "DEFAULT";
  const messageFontSize = conversationCustomization?.fontSize || 14;
  const messagePadding = compactMode ? "14px 16px" : "20px";
  const inputPadding = compactMode ? "10px 16px" : "16px 20px";
  const messageGap = compactMode ? 2 : 4;
  const isGroup = isGroupConversation(conversation);
  const profileForPanel = useMemo(() => buildConversationProfile(conversation, friendProfile), [conversation, friendProfile]);
  const conversationAvatarImage = getConversationDisplayAvatar(conversation);
  const conversationInitial = getConversationInitial(conversation);
  const enabledMods = useMemo(() => new Set(userCustomization?.enabledMods || []), [userCustomization?.enabledMods]);
  const quickEmotesEnabled = enabledMods.has("quick-emotes");
  const ambientChatEnabled = enabledMods.has("ambient-chat");
  const callStudioEnabled = enabledMods.has("call-studio");

  useEffect(() => {
    if (externalSearchOpen !== undefined) {
      setSearchOpen(externalSearchOpen);
    }
  }, [externalSearchOpen]);

  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setMessageSearch(externalSearchQuery);
    }
  }, [externalSearchQuery, conversation?.id]);

  const handleSearchOpenChange = (nextOpen) => {
    setSearchOpen(nextOpen);
    onMessageSearchOpenChange?.(nextOpen);
  };

  const handleSearchQueryChange = (nextQuery) => {
    setMessageSearch(nextQuery);
    onMessageSearchQueryChange?.(nextQuery);
  };

  useEffect(() => { callSessionRef.current = callSession; }, [callSession]);

  useEffect(() => {
    latestMessageKeyRef.current = null;
    shouldStickToBottomRef.current = true;
    scrollMessagesToBottom("auto");
    queueMicrotask(() => onCloseSideProfile?.());
  }, [conversation?.id, onCloseSideProfile]);

  useEffect(() => {
    let mounted = true;
    queueMicrotask(() => { if (mounted) setFriendProfile(null); });

    async function resolveFriendProfile() {
      if (!conversation?.friendId) return;
      try { const profile = await findUserById(conversation.friendId); if (mounted) setFriendProfile(profile); }
      catch { if (mounted) setFriendProfile(null); }
    }
    void resolveFriendProfile();
    return () => { mounted = false; };
  }, [conversation?.friendId]);

  useEffect(() => { if (localVideoRef.current) localVideoRef.current.srcObject = callSession?.localStream || null; }, [callSession?.localStream]);
  useEffect(() => { if (remoteMediaRef.current) remoteMediaRef.current.srcObject = callSession?.remoteStream || null; }, [callSession?.remoteStream]);

  useEffect(() => {
    let mounted = true;
    async function resolveCurrentUser() {
      try { const profile = await ensureCurrentUserProfile(); if (mounted) setCurrentUserId(getProfileId(profile)); }
      catch { if (mounted) setCurrentUserId(null); }
    }
    queueMicrotask(() => void resolveCurrentUser());
    return () => { mounted = false; };
  }, [conversation?.id]);

  useEffect(() => () => { revokeAttachmentPreview(pendingAttachment); }, [pendingAttachment]);

  const visibleMessages = useMemo(() => {
    if (!messageSearch.trim()) return messages;
    const normalizedSearch = messageSearch.trim().toLowerCase();
    return messages.filter((item) => getSearchableMessageText(item).includes(normalizedSearch));
  }, [messageSearch, messages]);

  const latestVisibleMessage = visibleMessages.at(-1);

  useEffect(() => {
    const latestKey = latestVisibleMessage ? `${latestVisibleMessage.id || latestVisibleMessage.createdAt || ""}:${latestVisibleMessage.content || ""}` : null;
    const previousKey = latestMessageKeyRef.current;
    const isNewMessage = Boolean(latestKey && previousKey && latestKey !== previousKey);
    if (latestKey) latestMessageKeyRef.current = latestKey;
    if (!latestVisibleMessage) return;
    const shouldScroll = shouldStickToBottomRef.current || latestVisibleMessage.mine || !previousKey;
    if (shouldScroll) scrollMessagesToBottom(isNewMessage ? "smooth" : "auto");
    const pendingOutgoingDraft = pendingOutgoingDraftRef.current;
    if (pendingOutgoingDraft && latestVisibleMessage.mine && latestVisibleMessage.content === pendingOutgoingDraft.content) {
      pendingOutgoingDraftRef.current = null;
      setMessage((current) => current === pendingOutgoingDraft.draftText ? "" : current);
      setNotice("");
      shouldStickToBottomRef.current = true;
      scrollMessagesToBottom("smooth");
      playFeedbackSound("send");
      window.requestAnimationFrame(() => composerInputRef.current?.focus());
    }
    if (isNewMessage && !latestVisibleMessage.mine) playFeedbackSound("receive");
  }, [latestVisibleMessage]);

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldStickToBottomRef.current = distanceFromBottom < 96;
  };

  function scrollMessagesToBottom(behavior = "smooth") {
    window.requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ block: "end", behavior }));
  }

  const handleAttachmentSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_ATTACHMENT_SIZE) { setNotice("El archivo no puede superar los 12 MB por ahora"); return; }
    try {
      const attachment = await buildAttachmentPayload(file);
      setPendingAttachment((current) => { revokeAttachmentPreview(current); return attachment; });
      setNotice("");
    } catch (attachmentError) { setNotice(attachmentError.message || "No se pudo preparar el archivo"); }
  };

  const handleSend = async () => {
    if ((!message.trim() && !pendingAttachment) || sending) return;
    let outgoingDraft = null;
    try {
      if (pendingAttachment) {
        setNotice("Subiendo archivo...");
        const ownerUserId = currentUserId || getProfileId(await ensureCurrentUserProfile());
        const uploadedMedia = await uploadMediaFile({ ownerUserId, file: pendingAttachment.file, purpose: "MESSAGE_ATTACHMENT" });
        const uploadedAttachment = buildUploadedAttachment(pendingAttachment, uploadedMedia);
        const payload = JSON.stringify({ text: message.trim(), attachment: uploadedAttachment });
        outgoingDraft = { content: payload, draftText: message };
        pendingOutgoingDraftRef.current = outgoingDraft;
        await sendMessage(payload, { type: uploadedAttachment.messageType });
        revokeAttachmentPreview(pendingAttachment);
        setPendingAttachment(null);
      } else {
        const content = message.trim();
        outgoingDraft = { content, draftText: message };
        pendingOutgoingDraftRef.current = outgoingDraft;
        await sendMessage(content);
      }
      pendingOutgoingDraftRef.current = null;
      setMessage("");
      setNotice("");
      shouldStickToBottomRef.current = true;
      scrollMessagesToBottom("smooth");
      playFeedbackSound("send");
      window.requestAnimationFrame(() => composerInputRef.current?.focus());
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      if (pendingOutgoingDraftRef.current === outgoingDraft) {
        setNotice(err.status === 502 ? "El servicio de archivos aun no esta disponible en el servidor" : "No se pudo enviar el mensaje");
      }
    }
  };

  const publishCallSignal = async (type, payload = {}) => {
    const cid = conversation?.id;
    if (!cid) { console.warn("[WebRTC-Send] publishCallSignal abortado: no hay conversation.id"); return; }
    const profile = await ensureCurrentUserProfile();
    const senderId = getProfileId(profile);
    console.log("[WebRTC-Send] Publicando señal:", type, "payload:", JSON.stringify(payload), "conversationId:", cid, "senderId:", senderId);
    publishRealtimeEvent({ type, conversationId: cid, senderId, messageType: "CALL_SIGNAL", content: JSON.stringify(payload) });
  };

  const createPeerConnection = (callId) => {
    const peerConnection = new RTCPeerConnection(RTC_CONFIGURATION);
    peerConnection.onicecandidate = (event) => {
      if (!event.candidate) return;
      void publishCallSignal("CALL_ICE_CANDIDATE", { callId, candidate: event.candidate.toJSON() });
    };
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (!remoteStream) return;
      setCallSession((current) => current?.callId === callId ? { ...current, status: "connected", remoteStream, startedAt: current.startedAt || new Date() } : current);
    };
    peerConnection.onconnectionstatechange = () => {
      if (["failed", "closed", "disconnected"].includes(peerConnection.connectionState)) {
        setCallSession((current) => current?.callId === callId ? { ...current, status: "reconnecting" } : current);
      }
      if (peerConnection.connectionState === "connected") {
        setCallSession((current) => current?.callId === callId ? { ...current, status: "connected" } : current);
      }
    };
    peerConnectionRef.current = peerConnection;
    return peerConnection;
  };

  const startCall = async (mode) => {
    try {
      closeCallResources();
      setNotice("");
      onCloseSideProfile?.();
      if (!navigator.mediaDevices?.getUserMedia) { setNotice("Tu navegador no permite iniciar llamadas desde aqui"); return; }
      if (!window.isSecureContext && window.location.hostname !== "localhost") { setNotice("Las llamadas y pantalla necesitan HTTPS en el navegador"); return; }
      if (mode === "screen" && !navigator.mediaDevices?.getDisplayMedia) { setNotice("Tu navegador no permite compartir pantalla"); return; }
      if (!wsConnectedRef.current) { setNotice("Esperando conexion de tiempo real..."); return; }
      const stream = await requestCallStream(mode);
      const callId = createCallId();
      const peerConnection = createPeerConnection(callId);
      if (mode === "screen") {
        stream.getVideoTracks().forEach((track) => { track.addEventListener("ended", () => { setCallSession((current) => current?.localStream === stream ? null : current); }); });
      }
      localStreamRef.current = stream;
      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
      const offer = await peerConnection.createOffer();
      console.log("[WebRTC-Offer] Oferta creada, signalingState:", peerConnection.signalingState, "callId:", callId);
      await peerConnection.setLocalDescription(offer);
      console.log("[WebRTC-Offer] SetLocalDescription OK, signalingState:", peerConnection.signalingState);
      setCallSession({ callId, mode, status: "calling", direction: "outgoing", localStream: stream, remoteStream: null, muted: false, cameraOff: false, startedAt: new Date(), participantName: conversation.name });
      pendingCallOfferRef.current = { callId, mode, offer };
      await publishCallSignal("CALL_OFFER", { callId, mode, offer });
      console.log("[WebRTC-Offer] CALL_OFFER publicado, esperando CALL_ANSWER...");
      playFeedbackSound("call");
    } catch (callError) {
      const label = mode === "screen" ? "compartir pantalla" : "iniciar la llamada";
      console.error("[WebRTC-Offer] Error en startCall:", callError);
      setNotice(callError?.name === "NotAllowedError" ? "Permiso rechazado por el navegador" : `No se pudo ${label}`);
    }
  };

  const acceptCall = async () => {
    stopRingtone();
    const incomingCall = callSessionRef.current;
    if (!incomingCall?.offer) { console.warn("[WebRTC-Accept] acceptCall llamado pero no hay offer en callSession"); return; }
    console.log("[WebRTC-Accept] Aceptando llamada:", incomingCall.callId, "modo:", incomingCall.mode, "offer recibido:", !!incomingCall.offer);
    try {
      setNotice("");
      const stream = await requestCallStream(incomingCall.mode === "screen" ? "audio" : incomingCall.mode);
      console.log("[WebRTC-Accept] Stream local obtenido, tracks:", stream.getTracks().length);
      const peerConnection = createPeerConnection(incomingCall.callId);
      localStreamRef.current = stream;
      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
      console.log("[WebRTC-Accept] Antes de setRemoteDescription, signalingState:", peerConnection.signalingState);
      await peerConnection.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      console.log("[WebRTC-Accept] setRemoteDescription OK, signalingState:", peerConnection.signalingState);
      const iceQueued = pendingIceCandidatesRef.current.length;
      await flushPendingIceCandidates(peerConnection, incomingCall.callId);
      console.log("[WebRTC-Accept] Flush ICE candidates:", iceQueued, "encolados, flushing completado");
      const answer = await peerConnection.createAnswer();
      console.log("[WebRTC-Accept] Answer creada, signalingState:", peerConnection.signalingState);
      await peerConnection.setLocalDescription(answer);
      console.log("[WebRTC-Accept] setLocalDescription OK, signalingState:", peerConnection.signalingState);
      setCallSession((current) => current?.callId === incomingCall.callId ? { ...current, status: "connected", direction: "incoming", localStream: stream, startedAt: new Date() } : current);
      pendingCallOfferRef.current = null;
      await publishCallSignal("CALL_ANSWER", { callId: incomingCall.callId, answer });
      console.log("[WebRTC-Accept] CALL_ANSWER publicado exitosamente");
    } catch (callError) {
      console.error("[WebRTC-Accept] Error al aceptar llamada:", callError);
      setNotice(callError?.name === "NotAllowedError" ? "Permiso rechazado por el navegador" : "No se pudo aceptar la llamada");
      closeCallResources();
    }
  };

  const declineCall = async () => {
    stopRingtone();
    const activeCall = callSessionRef.current;
    if (activeCall?.callId) await publishCallSignal("CALL_DECLINED", { callId: activeCall.callId });
    closeCallResources();
    setCallSession(null);
  };

  const endCall = async () => {
    stopRingtone();
    const activeCall = callSessionRef.current;
    if (activeCall?.callId) await publishCallSignal("CALL_ENDED", { callId: activeCall.callId });
    closeCallResources();
    setCallSession(null);
  };

  const toggleAudio = () => {
    const stream = callSession?.localStream;
    if (!stream) return;
    const muted = !callSession.muted;
    stream.getAudioTracks().forEach((track) => { track.enabled = !muted; });
    setCallSession((current) => (current ? { ...current, muted } : current));
  };

  const toggleCamera = () => {
    const stream = callSession?.localStream;
    if (!stream) return;
    const cameraOff = !callSession.cameraOff;
    stream.getVideoTracks().forEach((track) => { track.enabled = !cameraOff; });
    setCallSession((current) => (current ? { ...current, cameraOff } : current));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); handleSend(); }
  };

  async function handleCallSignal(event) {
    const payload = parseCallPayload(event.content);
    if (!payload?.callId) {
      console.warn("[WebRTC-Signaling] Evento sin callId:", event.type, event);
      return;
    }
    console.log("[WebRTC-Signaling] Recibido evento:", event.type, "payload:", JSON.stringify(payload), "callSessionActual:", callSessionRef.current?.callId);
    if (event.type === "CALL_OFFER") {
      if (callSessionRef.current && callSessionRef.current.callId !== payload.callId) {
        console.log("[WebRTC-Signaling] Ocupado, rechazando CALL_OFFER de", payload.callId);
        await publishCallSignal("CALL_DECLINED", { callId: payload.callId, reason: "busy" });
        return;
      }
      onCloseSideProfile?.();
      console.log("[WebRTC-Signaling] Mostrando pantalla de llamada entrante (ringing)");
      setCallSession({ callId: payload.callId, mode: payload.mode || "audio", status: "ringing", direction: "incoming", offer: payload.offer, localStream: null, remoteStream: null, muted: false, cameraOff: false, startedAt: null, participantName: conversation.name });
      stopRingtone();
      startRingtone();
      return;
    }
    if (event.type === "CALL_ANSWER") {
      stopRingtone();
      const peerConnection = peerConnectionRef.current;
      if (callSessionRef.current?.callId !== payload.callId || !peerConnection) {
        console.warn("[WebRTC-Signaling] CALL_ANSWER ignorado: callId mismatch o sin PeerConnection. Esperado:", callSessionRef.current?.callId, "recibido:", payload.callId, "PC existe:", !!peerConnection);
        return;
      }
      console.log("[WebRTC-Signaling] Procesando CALL_ANSWER, signalingState actual:", peerConnection.signalingState);
      await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer));
      console.log("[WebRTC-Signaling] setRemoteDescription OK, nuevo signalingState:", peerConnection.signalingState);
      await flushPendingIceCandidates(peerConnection, payload.callId);
      setCallSession((current) => current?.callId === payload.callId ? { ...current, status: "connected" } : current);
      pendingCallOfferRef.current = null;
      console.log("[WebRTC-Signaling] Llamada CONECTADA exitosamente");
      return;
    }
    if (event.type === "CALL_ICE_CANDIDATE") {
      console.log("[WebRTC-Signaling] Recibido ICE candidate, callId:", payload.callId, "candidate:", payload.candidate?.candidate?.substring(0, 80));
      await addRemoteIceCandidate(payload);
      return;
    }
    if (event.type === "CALL_DECLINED" || event.type === "CALL_ENDED") {
      console.log("[WebRTC-Signaling] Llamada finalizada por remoto:", event.type, "callId:", payload.callId);
      stopRingtone();
      if (callSessionRef.current?.callId === payload.callId) { closeCallResources(); setCallSession(null); setNotice(event.type === "CALL_DECLINED" ? "La llamada fue rechazada" : "La llamada finalizo"); }
    }
  }

  async function addRemoteIceCandidate({ callId, candidate }) {
    if (!candidate) { console.warn("[WebRTC-ICE] addRemoteIceCandidate llamado sin candidate"); return; }
    const pc = peerConnectionRef.current;
    console.log("[WebRTC-ICE] addRemoteIceCandidate - callId:", callId, "PC existe:", !!pc, "remoteDescription:", pc?.remoteDescription?.type || "null", "signalingState:", pc?.signalingState || "N/A");
    if (callSessionRef.current?.callId !== callId || !pc || !pc.remoteDescription || !pc.remoteDescription.type) {
      console.log("[WebRTC-ICE] Encolando candidato (condición no lista). callId match:", callSessionRef.current?.callId === callId, "PC:", !!pc, "remoteDesc:", pc?.remoteDescription?.type);
      pendingIceCandidatesRef.current.push({ callId, candidate }); return;
    }
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("[WebRTC-ICE] addIceCandidate EXITOSO");
    } catch (err) {
      console.error("[WebRTC-Error] Falló addIceCandidate. Estado de la conexión:", "signalingState:", pc.signalingState, "connectionState:", pc.connectionState, "iceConnectionState:", pc.iceConnectionState, "error:", err.name, err.message);
      if (err.name === "InvalidStateError") {
        console.log("[WebRTC-ICE] Re-encolando por InvalidStateError");
        pendingIceCandidatesRef.current.push({ callId, candidate });
      }
    }
  }

  async function flushPendingIceCandidates(peerConnection, callId) {
    const ourCandidates = [];
    const remaining = [];
    for (const c of pendingIceCandidatesRef.current) {
      if (c.callId === callId) ourCandidates.push(c);
      else remaining.push(c);
    }
    pendingIceCandidatesRef.current = remaining;
    console.log("[WebRTC-ICE] flushPendingIceCandidates: drenando", ourCandidates.length, "candidatos para callId:", callId);
    for (const pendingCandidate of ourCandidates) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(pendingCandidate.candidate));
      } catch (err) {
        console.warn("[WebRTC-ICE] Error al drenar candidato pendiente:", err.name, err.message);
      }
    }
  }

  function closeCallResources() {
    stopMediaStream(localStreamRef.current);
    localStreamRef.current = null;
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    pendingIceCandidatesRef.current = [];
    pendingCallOfferRef.current = null;
  }

  useEffect(() => () => { closeCallResources(); }, []);

  const handleCallSignalRef = useRef(handleCallSignal);
  handleCallSignalRef.current = handleCallSignal;

  useEffect(() => {
    const convId = conversation?.id;
    if (!convId || !currentUserId) {
      console.log("[WebRTC-Sub] useEffect saltado: convId:", convId, "currentUserId:", currentUserId);
      return undefined;
    }
    console.log("[WebRTC-Sub] Suscribiendo eventos de llamada para convId:", convId, "userId:", currentUserId);
    return subscribeRealtimeEvents((event) => {
      console.log("[WebRTC-Sub] Evento crudo recibido:", event.type, "convId evento:", event.conversationId, "esperado:", convId);
      if (!isCallSignalForConversation(event, convId, currentUserId)) {
        console.log("[WebRTC-Sub] Evento filtrado por isCallSignalForConversation");
        return;
      }
      console.log("[WebRTC-Sub] Evento PASÓ filtro, será manejado:", event.type);
      void handleCallSignalRef.current(event);
    });
  }, [conversation?.id, currentUserId]);

  const noticeTimeoutRef = useRef(null);

  useEffect(() => {
    return subscribeRealtimeEvents((event) => {
      if (event.type === "REALTIME_ERROR") {
        setNotice(event.reason || event.content || "Error en tiempo real");
        clearTimeout(noticeTimeoutRef.current);
        noticeTimeoutRef.current = window.setTimeout(() => setNotice(""), 4000);
      }
    });
  }, []);

  useEffect(() => () => clearTimeout(noticeTimeoutRef.current), []);

  const startCallRef = useRef(startCall);
  startCallRef.current = startCall;

  useImperativeHandle(ref, () => ({
    startCall: (...args) => startCallRef.current(...args),
  }), []);

  const pendingCallOfferRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail.status !== "connected" || !pendingCallOfferRef.current) return;
      const pending = pendingCallOfferRef.current;
      pendingCallOfferRef.current = null;
      console.log("[WebRTC-Offer] WebSocket reconectado, reenviando CALL_OFFER pendiente:", pending.callId);
      void publishCallSignal("CALL_OFFER", { callId: pending.callId, mode: pending.mode, offer: pending.offer });
    };
    window.addEventListener(REALTIME_STATUS_EVENT, handler);
    return () => window.removeEventListener(REALTIME_STATUS_EVENT, handler);
  }, []);

  if (!conversation) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: visuals.chatBackground, fontFamily: visuals.fontFamily }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#13141c", border: "1px solid #1e2030", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <MessageSquare size={28} color="#565f89" strokeWidth={1.5} />
        </div>
        <p style={{ color: "#565f89", fontSize: 15, fontWeight: 500 }}>Selecciona una conversación</p>
        <p style={{ color: "#2d2f45", fontSize: 13, marginTop: 4 }}>para empezar a chatear</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", minWidth: 0, background: visuals.chatBackground, fontFamily: visuals.fontFamily, position: "relative", overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: visuals.chatBackground, backgroundImage: ambientChatEnabled ? "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)" : "radial-gradient(circle at 18% 12%, rgba(124,58,237,0.08), transparent 24%), radial-gradient(circle at 86% 18%, rgba(59,130,246,0.05), transparent 28%)", backgroundSize: ambientChatEnabled ? "28px 28px" : "auto" }}>
      <div style={{ padding: isMobile ? "0 16px 0 56px" : "0 20px", height: compactMode ? 54 : 60, flexShrink: 0, borderBottom: "1px solid #1e2030", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(13, 14, 20, 0.94)", gap: 10 }}>
        <div style={{ minWidth: 0, flex: "1 1 auto", display: "flex", alignItems: "center", gap: 10 }}>
          {isMobile && (
            <button type="button" onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#c0caf5", padding: 4, marginRight: 4, display: "flex", alignItems: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </button>
          )}
          <button type="button" onClick={handleHeaderAvatarClick} title={isGroup ? "Información del grupo" : `Ver perfil de ${conversation.name}`} style={{ width: 34, height: 34, borderRadius: isGroup ? 10 : "50%", overflow: "hidden", background: isGroup ? "#1e2030" : visuals.accentGradient, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 600, border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", padding: 0, flexShrink: 0 }}>
            {conversationAvatarImage ? <img src={conversationAvatarImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : conversationInitial}
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <p style={{ color: "#c0caf5", fontSize: 14, fontWeight: 600, margin: 0, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conversation.name}</p>
              <ProfileBadges badges={conversation.badges} compact max={2} />
            </div>
            <p style={{ color: "#22c55e", fontSize: 11, margin: 0 }}>{isGroup ? `${conversation.members?.length || "Varios"} miembros` : conversation.backend ? "Listo para conversar" : conversation.online ? "En línea" : "Disponible en este dispositivo"}</p>
          </div>
        </div>
        <div style={{ maxWidth: isMobile ? 146 : "none", flexShrink: 0, display: "flex", gap: isMobile ? 2 : 4, overflowX: isMobile ? "auto" : "visible", scrollbarWidth: "none" }}>
          <HeaderActionButton title="Llamada de voz" onClick={() => startCall("audio")}><Phone size={18} /></HeaderActionButton>
          <HeaderActionButton title="Videollamada" onClick={() => startCall("video")}><Video size={18} /></HeaderActionButton>
          <HeaderActionButton title="Compartir pantalla" onClick={() => startCall("screen")}><MonitorUp size={18} /></HeaderActionButton>
          <HeaderActionButton title="Buscar mensajes" onClick={() => handleSearchOpenChange(!searchOpen)}><Search size={18} /></HeaderActionButton>
          <HeaderActionButton title="Información" onClick={() => onToggleDetails?.()} active={detailsOpen}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></HeaderActionButton>
        </div>
      </div>

      {callSession && (
        <CallPanel conversationName={conversation.name} callSession={callSession} localVideoRef={localVideoRef} remoteMediaRef={remoteMediaRef}
          participantAvatar={conversationAvatarImage} studioEnabled={callStudioEnabled} isMobile={isMobile}
          onAccept={acceptCall} onDecline={declineCall} onToggleAudio={toggleAudio} onToggleCamera={toggleCamera}
          onSwitchMode={startCall} onEnd={endCall}
        />
      )}

      {(searchOpen || notice || error) && (
        <div style={{ padding: searchOpen ? "10px 20px" : "8px 20px", borderBottom: "1px solid #1e2030", background: "rgba(13, 14, 20, 0.94)" }}>
          {searchOpen && (
            <div style={{ position: "relative" }}>
              <Search size={14} color="#565f89" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input autoFocus value={messageSearch} onChange={(event) => handleSearchQueryChange(event.target.value)} placeholder="Buscar dentro de esta conversación"
                style={{ width: "100%", padding: "9px 12px 9px 32px", background: "#13141c", border: "1px solid #1e2030", borderRadius: 10, color: "#c0caf5", fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          )}
          {(notice || error) && <p style={{ color: error ? "#ef4444" : "#a78bfa", fontSize: 12, textAlign: "center", margin: searchOpen ? "8px 0 0" : 0 }}>{error || notice}</p>}
        </div>
      )}

      <div ref={messagesContainerRef} onScroll={handleMessagesScroll} style={{ flex: 1, overflowY: "auto", padding: messagePadding, display: "flex", flexDirection: "column", gap: messageGap, scrollBehavior: "smooth" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}><span style={{ color: "#565f89" }}>Cargando mensajes...</span></div>
        ) : messages.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}><span style={{ color: "#565f89" }}>No hay mensajes aún</span></div>
        ) : visibleMessages.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}><span style={{ color: "#565f89" }}>No hay mensajes que coincidan</span></div>
        ) : (
          visibleMessages.map((msg, index) => (
            <MessageBubble key={msg.id} msg={msg} visuals={visuals} bubbleStyle={bubbleStyle}
              compactMode={compactMode} fontSize={messageFontSize} pushToBottom={index === 0}
              showAvatar={isGroup}
              onEdit={msg.mine ? handleEditMessage : undefined}
              onDelete={msg.mine ? handleDeleteMessage : undefined}
              onAvatarClick={handleAvatarClick}
            />
          ))
        )}
        <div ref={messagesEndRef} style={{ width: 1, height: 1, flexShrink: 0 }} />
      </div>

      <TypingIndicator typingUsers={typingUsers} />
      <div style={{ padding: inputPadding, borderTop: "1px solid #1e2030", background: "rgba(13, 14, 20, 0.94)" }}>
        <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*,.pdf,.txt,.zip,.doc,.docx" onChange={handleAttachmentSelect} style={{ display: "none" }} />
        {pendingAttachment && <AttachmentComposerPreview attachment={pendingAttachment} onRemove={() => setPendingAttachment(null)} />}
        {quickEmotesEnabled && <QuickEmoteBar accent={visuals.accent} onSelect={(emote) => setMessage((current) => current.trim() ? `${current} ${emote}` : emote)} />}
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#13141c", border: "1px solid #1e2030", borderRadius: 16, padding: "10px 14px", transition: "border-color 0.2s" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = visuals.accent; }} onBlur={(e) => { e.currentTarget.style.borderColor = "#1e2030"; }} tabIndex={-1}
        >
          <IconButton title="Adjuntar archivo" color="#565f89" hoverColor={visuals.accent} onClick={() => fileInputRef.current?.click()}><Paperclip size={18} /></IconButton>
          <textarea ref={composerInputRef} value={message} onChange={(event) => { setMessage(event.target.value); onUserTyping(); }} onKeyDown={handleKeyDown}
            placeholder={isMobile ? "Mensaje..." : `Escribe un mensaje a ${conversation.name}...`} rows={1}
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#c0caf5", fontSize: messageFontSize, resize: "none", fontFamily: visuals.fontFamily, lineHeight: 1.5, maxHeight: 100, overflowY: "auto", padding: "4px 0" }}
          />
          <IconButton title="Emojis" color="#565f89" hoverColor={visuals.accent} onClick={() => setMessage((current) => `${current}✨`)}><Smile size={18} /></IconButton>
          <button type="button" onClick={handleSend} disabled={sending || (!message.trim() && !pendingAttachment)} title={sending ? "Enviando..." : "Enviar mensaje"}
            style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: (message.trim() || pendingAttachment) && !sending ? visuals.accentGradient : "#1e2030", border: "none", cursor: (message.trim() || pendingAttachment) && !sending ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", color: (message.trim() || pendingAttachment) && !sending ? "white" : "#565f89", transition: "all 0.2s", boxShadow: (message.trim() || pendingAttachment) && !sending ? `0 4px 12px ${visuals.accent}40` : "none" }}
            onMouseEnter={(e) => { if ((message.trim() || pendingAttachment) && !sending) e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <Send size={16} />
          </button>
        </div>
        <p style={{ color: "#2d2f45", fontSize: 11, textAlign: "center", marginTop: 8 }}>Enter para enviar • Shift+Enter para nueva línea</p>
      </div>
      </div>

      {sideProfile && (
        <div style={{ width: 320, flexShrink: 0, borderLeft: "1px solid #1e2030", background: "#13141c", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <FriendProfilePanel embedded profile={sideProfile} onClose={() => onCloseSideProfile?.()} />
        </div>
      )}

      {profileCard && (
        <ProfileCard
          key={profileCard.id}
          profile={profileCard}
          currentUserId={currentUserId}
          onClose={() => setProfileCard(null)}
          onSendMessage={handleProfileCardSendMessage}
          anchorRef={profileCardAnchorRef}
        />
      )}
    </div>
  );
});

export default ChatArea;
