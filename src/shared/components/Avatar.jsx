export default function Avatar({
  name = "?",
  src = null,
  size = 36,
  radius = "50%",
  online = null,
  onClick = null,
}) {
  return (
    <div
      style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}
    >
      <div
        onClick={onClick}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          background: src
            ? "transparent"
            : "linear-gradient(135deg, #7c3aed, #4f46e5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          cursor: onClick ? "pointer" : "default",
          flexShrink: 0,
        }}
      >
        {src ? (
          <img
            src={src}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            alt={name}
          />
        ) : (
          <span
            style={{ color: "white", fontSize: size * 0.38, fontWeight: 600 }}
          >
            {name[0].toUpperCase()}
          </span>
        )}
      </div>

      {online !== null && (
        <div
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: size * 0.26,
            height: size * 0.26,
            borderRadius: "50%",
            background: online ? "#22c55e" : "#565f89",
            border: "2px solid #13141c",
          }}
        />
      )}
    </div>
  );
}
