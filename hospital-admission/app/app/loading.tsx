export default function Loading() {
  return (
    <div style={container}>
      <div style={spinner}></div>
    </div>
  );
}

/* ================= STYLES ================= */

const container: React.CSSProperties = {
  height: "100vh",
  width: "100vw",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#f0f2f5",
};

const spinner: React.CSSProperties = {
  width: 48,
  height: 48,
  border: "5px solid #ddd",
  borderTop: "8px solid #2196f3",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const text: React.CSSProperties = {
  marginTop: 14,
  fontSize: 14,
  color: "#555",
};

/* Inject animation */
const styleSheet = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = styleSheet;
  document.head.appendChild(style);
}
