export default function IconButton({ children, title, color, hoverColor, onClick }) {
  return (
    <button type="button" title={title} onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", color, padding: "6px", borderRadius: 8, transition: "all 0.15s", flexShrink: 0 }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#1a1b26"; e.currentTarget.style.color = hoverColor; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = color; }}
    >
      {children}
    </button>
  );
}
