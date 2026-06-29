import { useMemo } from "react";

export default function TypingIndicator({ typingUsers, participantNames = {} }) {
  const labels = useMemo(() => {
    const userIds = Object.keys(typingUsers);
    if (userIds.length === 0) return null;

    const names = userIds.map((id) => participantNames[id] || "Alguien");

    if (names.length === 1) return `${names[0]} esta escribiendo...`;
    if (names.length === 2) return `${names[0]} y ${names[1]} estan escribiendo...`;
    return `${names[0]} y ${names.length - 1} mas estan escribiendo...`;
  }, [typingUsers, participantNames]);

  if (!labels) return null;

  return (
    <div style={{ padding: "4px 20px 6px", display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", gap: 3 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed", animation: "typingBounce 1.4s infinite", animationDelay: "0s" }} />
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed", animation: "typingBounce 1.4s infinite", animationDelay: "0.2s" }} />
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed", animation: "typingBounce 1.4s infinite", animationDelay: "0.4s" }} />
      </div>
      <span style={{ color: "#565f89", fontSize: 12, fontStyle: "italic" }}>{labels}</span>
    </div>
  );
}
