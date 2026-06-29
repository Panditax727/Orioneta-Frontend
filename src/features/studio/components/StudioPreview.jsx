const PREVIEW_MESSAGES = [
  { id: 1, mine: false, text: "¡Me encanta el nuevo tema!", time: "10:32", sender: "Alex" },
  { id: 2, mine: true, text: "Sí, quedó muy bien con estos colores", time: "10:33" },
  { id: 3, mine: false, text: "Los bordes redondeados se ven geniales", time: "10:34", sender: "Alex" },
];

export default function StudioPreview({ state, visuals }) {
  const bubbleRadius = state.bubbles.style === "ROUNDED" ? 18
    : state.bubbles.style === "MINIMAL" ? 4
    : state.bubbles.style === "COMPACT" ? 6
    : 8;

  return (
    <div
      style={{
        flex: 1,
        background: state.colors.background,
        display: "flex",
        flexDirection: "column",
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${state.colors.border}`,
        fontFamily: state.font.family,
        fontSize: state.font.size,
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          background: state.colors.incomingBubble,
          borderBottom: `1px solid ${state.colors.border}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
        <span style={{ color: state.colors.textPrimary, fontSize: 13, fontWeight: 600 }}>
          Vista previa
        </span>
        <span style={{ color: state.colors.textSecondary, fontSize: 11, marginLeft: "auto" }}>
          {state.name}
        </span>
      </div>

      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 12, justifyContent: "flex-end" }}>
        {PREVIEW_MESSAGES.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              flexDirection: msg.mine ? "row-reverse" : "row",
              gap: 8,
            }}
          >
            {!msg.mine && (
              <div
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: visuals.accentGradient,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}
              >
                {msg.sender[0]}
              </div>
            )}

            <div
              style={{
                maxWidth: "70%",
                background: msg.mine ? visuals.accent : visuals.incomingBubble,
                borderTopLeftRadius: !msg.mine ? 4 : bubbleRadius,
                 borderTopRightRadius: msg.mine ? 4 : bubbleRadius,
                borderBottomLeftRadius: bubbleRadius,
                borderBottomRightRadius: bubbleRadius,
                padding: state.bubbles.padding > 0
                  ? `${state.bubbles.padding}px ${state.bubbles.padding + 4}px`
                  : "8px 12px",
              }}
            >
              {!msg.mine && (
                <p style={{ color: visuals.accent, fontSize: 11, fontWeight: 600, margin: "0 0 4px 0" }}>
                  {msg.sender}
                </p>
              )}
              <p style={{
                color: msg.mine ? "white" : state.colors.textPrimary,
                fontSize: state.font.size,
                lineHeight: 1.4,
                margin: 0,
              }}>
                {msg.text}
              </p>
              <p style={{
                color: msg.mine ? "rgba(255,255,255,0.58)" : state.colors.textSecondary,
                fontSize: 10,
                textAlign: "right",
                marginTop: 4,
                marginBottom: 0,
              }}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: "10px 16px",
          borderTop: `1px solid ${state.colors.border}`,
          display: "flex",
          gap: 8,
        }}
      >
        <div
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 8,
            background: state.colors.incomingBubble,
            color: state.colors.textSecondary,
            fontSize: 13,
          }}
        >
          Escribe un mensaje...
        </div>
        <div
          style={{
            width: 36, height: 36, borderRadius: 8,
            background: visuals.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
