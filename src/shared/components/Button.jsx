import { useState } from "react";
import { theme } from "../theme";

const VARIANTS = {
  primary: {
    background: theme.colors.primaryGradient || "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "white",
    border: "none",
  },
  ghost: {
    background: "transparent",
    color: theme.colors.text.secondary,
    border: `1px solid ${theme.colors.border.default}`,
  },
  danger: {
    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
    color: "white",
    border: "none",
  },
  subtle: {
    background: theme.colors.background.tertiary,
    color: theme.colors.text.secondary,
    border: `1px solid ${theme.colors.border.default}`,
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
  icon = null,
  ...buttonProps
}) {
  const [hovered, setHovered] = useState(false);

  const padding = { sm: "7px 14px", md: "12px 20px", lg: "14px 28px" }[size];
  const fontSize = theme.typography.fontSize[size] || theme.typography.fontSize.md;
  const styles = VARIANTS[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...buttonProps}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles,
        padding,
        fontSize,
        width: fullWidth ? "100%" : "auto",
        borderRadius: theme.borderRadius.lg,
        fontWeight: theme.typography.fontWeight.semibold,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : hovered ? 0.88 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: theme.spacing.sm,
        transition: "all 0.15s",
        fontFamily: theme.typography.fontFamily,
        boxShadow: variant === "primary" && !disabled ? theme.shadow.primary : "none",
      }}
    >
      {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}
      {children}
    </button>
  );
}
