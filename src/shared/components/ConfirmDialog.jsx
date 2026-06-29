import { useEffect } from "react";
import { theme } from "../theme/index";

const VARIANT_COLORS = {
  danger: theme.colors.functional.error,
  primary: theme.colors.primary,
  success: theme.colors.functional.success,
  warning: theme.colors.functional.warning,
};

const VARIANT_HOVER_COLORS = {
  danger: "#dc2626",
  primary: theme.colors.primaryDark,
  success: "#16a34a",
  warning: "#d97706",
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmVariant = "primary",
  loading = false,
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && open && !loading) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, loading, onClose]);

  if (!open) return null;

  const confirmColor = VARIANT_COLORS[confirmVariant] || VARIANT_COLORS.primary;
  const confirmHoverColor = VARIANT_HOVER_COLORS[confirmVariant] || VARIANT_HOVER_COLORS.primary;

  return (
    <div
      onClick={() => !loading && onClose?.()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "440px",
          background: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border.default}`,
          borderRadius: theme.borderRadius.xl,
          boxShadow: theme.shadow.xl,
          animation: "scaleIn 0.2s ease-out",
          padding: theme.spacing["2xl"],
        }}
      >
        {/* Title */}
        {title && (
          <h2
            style={{
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize["2xl"],
              fontWeight: theme.typography.fontWeight.semibold,
              margin: "0 0 12px",
            }}
          >
            {title}
          </h2>
        )}

        {/* Description */}
        {description && (
          <p
            style={{
              color: theme.colors.text.tertiary,
              fontSize: theme.typography.fontSize.md,
              lineHeight: 1.6,
              margin: "0 0 24px",
            }}
          >
            {description}
          </p>
        )}

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: theme.spacing.md,
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={() => !loading && onClose?.()}
            disabled={loading}
            style={{
              padding: "10px 20px",
              borderRadius: theme.borderRadius.lg,
              background: "transparent",
              border: `1px solid ${theme.colors.border.default}`,
              color: theme.colors.text.tertiary,
              fontSize: theme.typography.fontSize.md,
              fontWeight: theme.typography.fontWeight.medium,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = theme.colors.background.tertiary;
                e.currentTarget.style.borderColor = theme.colors.border.hover;
                e.currentTarget.style.color = theme.colors.text.secondary;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = theme.colors.border.default;
              e.currentTarget.style.color = theme.colors.text.tertiary;
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => !loading && onConfirm?.()}
            disabled={loading}
            style={{
              padding: "10px 20px",
              borderRadius: theme.borderRadius.lg,
              background: confirmColor,
              border: "none",
              color: "white",
              fontSize: theme.typography.fontSize.md,
              fontWeight: theme.typography.fontWeight.semibold,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = confirmHoverColor;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = confirmColor;
            }}
          >
            {loading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
