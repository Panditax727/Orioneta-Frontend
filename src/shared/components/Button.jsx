import { useState } from "react";

const VARIANTS = {
  primary: {
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "white",
    border: "none",
  },
  ghost: {
    background: "transparent",
    color: "#c0caf5",
    border: "1px solid #1e2030",
  },
  danger: {
    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
    color: "white",
    border: "none",
  },
  subtle: {
    background: "#1a1b26",
    color: "#c0caf5",
    border: "1px solid #1e2030",
  },
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  onClick,
  type = "button",
}) {
  const [hovered, setHovered] = useState(false);

  const padding = { sm: "7px 14px", md: "12px 20px", lg: "14px 28px" }[size];
  const fontSize = { sm: 12, md: 14, lg: 15 }[size];
  const styles = VARIANTS[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles,
        padding,
        fontSize,
        width: fullWidth ? "100%" : "auto",
        borderRadius: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : hovered ? 0.88 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "opacity 0.15s",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {children}
    </button>
  );
}
