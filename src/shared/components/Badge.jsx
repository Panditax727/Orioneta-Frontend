export default function Badge({ count, max = 99 }) {
  if (!count || count === 0) return null;
  return (
    <div
      style={{
        minWidth: 18,
        height: 18,
        borderRadius: 999,
        background: "#7c3aed",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: 10,
        fontWeight: 700,
        padding: "0 5px",
      }}
    >
      {count > max ? `${max}+` : count}
    </div>
  );
}
