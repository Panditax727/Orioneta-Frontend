import { useEffect } from "react";
import { X } from "lucide-react";
import { theme } from "../theme";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  showCloseButton = true,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: { maxWidth: "400px" },
    md: { maxWidth: "500px" },
    lg: { maxWidth: "600px" },
    xl: { maxWidth: "800px" },
    full: { maxWidth: "95%" },
  };

  const sizeStyles = sizes[size] || sizes.md;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: theme.spacing.lg,
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...sizeStyles,
          width: "100%",
          background: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border.default}`,
          borderRadius: theme.borderRadius.xl,
          boxShadow: theme.shadow.xl,
          animation: "slideUp 0.3s ease-out",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: theme.spacing.lg,
              borderBottom: `1px solid ${theme.colors.border.default}`,
            }}
          >
            {title && (
              <h2
                style={{
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.fontSize["2xl"],
                  fontWeight: theme.typography.fontWeight.semibold,
                  margin: 0,
                }}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: theme.borderRadius.md,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.colors.text.tertiary,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.background.tertiary;
                  e.currentTarget.style.color = theme.colors.text.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                  e.currentTarget.style.color = theme.colors.text.tertiary;
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: theme.spacing.lg,
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: theme.spacing.lg,
              borderTop: `1px solid ${theme.colors.border.default}`,
              display: "flex",
              gap: theme.spacing.sm,
              justifyContent: "flex-end",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
