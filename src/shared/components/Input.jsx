import { useState } from "react";

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
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      {label && (
        <label
          style={{
            color: "#c0caf5",
            fontSize: 13,
            fontWeight: 500,
            display: "block",
            marginBottom: 8,
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
              color: "#565f89",
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
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: `12px ${rightElement ? "44px" : "14px"} 12px ${icon ? "40px" : "14px"}`,
            background: "#1a1b26",
            border: `1px solid ${error ? "#ef4444" : focused ? "#7c3aed" : "#1e2030"}`,
            borderRadius: 12,
            color: "#c0caf5",
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s",
            fontFamily: "system-ui, sans-serif",
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
        <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{error}</p>
      )}
    </div>
  );
}
