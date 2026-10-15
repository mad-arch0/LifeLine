"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [patientId, setPatientId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return alert("Please enter Subject ID");

    router.push(`/dashboard?patientId=${patientId}`);
  };

  return (
    <main style={pageStyle}>
      <div style={backgroundGlow1} />
      <div style={backgroundGlow2} />

      <form onSubmit={handleSubmit} style={cardStyle}>
        <div style={brandBadge}>
          <span>LifeLine Subject Registry</span>
        </div>

        <h1 style={titleStyle}>Subject Access Portal</h1>
        <p style={subtitleStyle}>Please log in with Subject ID or register an unidentified Jane/John Doe record.</p>

        <div style={inputContainer}>
          <input
            type="text"
            placeholder="Subject ID (e.g. S001 or P001)"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "hsl(245, 75%, 60%)";
              e.currentTarget.style.boxShadow = "0 0 0 4px rgba(99, 102, 241, 0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        <button
          type="submit"
          style={buttonStyleBlue}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = "brightness(1.05)";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(99, 102, 241, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = "none";
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 8px 20px -6px rgba(99, 102, 241, 0.3)";
          }}
        >
          Access Terminal
        </button>

        <div style={dividerContainer}>
          <div style={dividerLine} />
          <span style={dividerText}>OR</span>
          <div style={dividerLine} />
        </div>

        <button
          type="button"
          style={buttonStyleRed}
          onClick={() => router.push("/register")}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f8fafc";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.borderColor = "#cbd5e1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#ffffff";
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.borderColor = "#e2e8f0";
          }}
        >
          Register New Subject (Jane/John Doe)
        </button>
      </form>
    </main>
  );
}

/* ================= STYLES ================= */

const pageStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "calc(100vh - 80px)",
  backgroundColor: "#f8fafc",
  fontFamily: "'Inter', sans-serif",
  position: "relative",
  overflow: "hidden",
};

const backgroundGlow1: React.CSSProperties = {
  position: "absolute",
  width: 500,
  height: 500,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(255, 255, 255, 0) 70%)",
  top: "-10%",
  left: "-10%",
  zIndex: 0,
};

const backgroundGlow2: React.CSSProperties = {
  position: "absolute",
  width: 600,
  height: 600,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, rgba(255, 255, 255, 0) 70%)",
  bottom: "-10%",
  right: "-10%",
  zIndex: 0,
};

const cardStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  borderRadius: 24,
  padding: 40,
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.04), 0 0 1px 1px rgba(0, 0, 0, 0.02)",
  backgroundColor: "#ffffff",
  border: "1px solid rgba(241, 245, 249, 0.8)",
  width: 440,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const brandBadge: React.CSSProperties = {
  backgroundColor: "hsl(245, 75%, 96%)",
  color: "hsl(245, 75%, 55%)",
  padding: "6px 12px",
  borderRadius: 30,
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: 20,
};

const titleStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
  color: "#0f172a",
  margin: "0 0 8px 0",
  letterSpacing: "-0.5px",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#64748b",
  textAlign: "center",
  margin: "0 0 30px 0",
  lineHeight: 1.5,
};

const inputContainer: React.CSSProperties = {
  width: "100%",
  marginBottom: 16,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: "1.5px solid #e2e8f0",
  fontSize: 15,
  height: 50,
  boxSizing: "border-box",
  outline: "none",
  color: "#1e293b",
  backgroundColor: "#f8fafc",
  transition: "all 0.2s ease",
};

const buttonStyle: React.CSSProperties = {
  padding: "14px 20px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 15,
  height: 50,
  width: "100%",
  boxSizing: "border-box",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
};

const buttonStyleBlue: React.CSSProperties = {
  ...buttonStyle,
  background: "linear-gradient(135deg, hsl(245, 75%, 60%) 0%, hsl(245, 75%, 50%) 100%)",
  color: "#fff",
  boxShadow: "0 8px 20px -6px rgba(99, 102, 241, 0.3)",
};

const buttonStyleRed: React.CSSProperties = {
  ...buttonStyle,
  background: "#ffffff",
  border: "1.5px solid #e2e8f0",
  color: "#475569",
};

const dividerContainer: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  margin: "24px 0",
};

const dividerLine: React.CSSProperties = {
  flex: 1,
  height: 1,
  backgroundColor: "#f1f5f9",
};

const dividerText: React.CSSProperties = {
  padding: "0 12px",
  fontSize: 11,
  color: "#94a3b8",
  fontWeight: 700,
};
