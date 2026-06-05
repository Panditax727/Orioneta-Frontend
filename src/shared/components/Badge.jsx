import { theme } from "../theme";

export default function Badge({ 
  count, 
  max = 99, 
  variant = "primary",
  size = "md",
}) {
  if (!count || count === 0) return null;

  const sizes = {
    sm: { width: 16, height: 16, fontSize: 9, padding: "0 4px" },
    md: { width: 18, height: 18, fontSize: 10, padding: "0 5px" },
    lg: { width: 20, height: 20, fontSize: 11, padding: "0 6px" },
  };

  const variants = {
    primary: theme.colors.primary,
    success: theme.colors.functional.success,
    warning: theme.colors.functional.warning,
    error: theme.colors.functional.error,
    info: theme.colors.functional.info,
  };

  const sizeStyles = sizes[size] || sizes.md;
  const backgroundColor = variants[variant] || variants.primary;

  return (
    <div
      style={{
        minWidth: sizeStyles.width,
        height: sizeStyles.height,
        borderRadius: theme.borderRadius.full,
        background: backgroundColor,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: theme.colors.text.primary,
        fontSize: sizeStyles.fontSize,
        fontWeight: theme.typography.fontWeight.bold,
        padding: sizeStyles.padding,
      }}
    >
      {count > max ? `${max}+` : count}
    </div>
  );
}
