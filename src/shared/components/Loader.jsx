import { theme } from "../theme";

export default function Loader({ size = 24, color = null }) {
  const loaderColor = color || theme.colors.primary;
  
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `3px solid ${theme.colors.border.default}`,
        borderTopColor: loaderColor,
        animation: "spin 0.7s linear infinite",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
