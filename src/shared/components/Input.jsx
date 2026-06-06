import { useState } from "react";
import { theme } from "../theme";

export default function Input({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  label,
  error,
  icon = null,
  rightElement = null,
  disabled = false,
  ...inputProps
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      {label && (
        <label
          style={{
            color: theme.colors.text.secondary,
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.medium,
            display: "block",
            marginBottom: theme.spacing.sm,
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {icon && (
          <span
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: theme.colors.text.tertiary,
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...inputProps}
          style={{
            width: "100%",
            padding: `12px ${rightElement ? "44px" : "14px"} 12px ${icon ? "40px" : "14px"}`,
            background: theme.colors.background.tertiary,
            border: `1px solid ${error ? theme.colors.functional.error : focused ? theme.colors.border.focus : theme.colors.border.default}`,
            borderRadius: theme.borderRadius.lg,
            color: theme.colors.text.secondary,
            fontSize: theme.typography.fontSize.md,
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s",
            fontFamily: theme.typography.fontFamily,
            opacity: disabled ? 0.72 : 1,
          }}
        />
        {rightElement && (
          <span
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {rightElement}
          </span>
        )}
      </div>
      {error && (
        <p style={{ color: theme.colors.functional.error, fontSize: theme.typography.fontSize.sm, marginTop: theme.spacing.xs }}>{error}</p>
      )}
    </div>
  );
}
