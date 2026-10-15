"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");

  return (
    <header style={headerStyle}>
      {/* Logo Container */}
      <div
        onClick={() => router.push("/")}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 12,
          transition: "all 0.3s ease",
        }}
      >
        <div style={logoWrapper}>
          <Image
            src="/logo.png"
            alt="Hospital Logo"
            width={34}
            height={34}
            style={{ objectFit: "contain" }}
          />
        </div>
        <span style={logoText}>LifeLine</span>
      </div>

      {/* Action Buttons */}
      <div style={rightStyle}>
        {pathname !== "/" && (
          <button
            style={buttonStyleGray}
            onClick={() => router.push("/")}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e2e8f0";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f1f5f9";
              e.currentTarget.style.transform = "none";
            }}
          >
            Registry Console
          </button>
        )}

        {patientId && pathname !== "/dashboard" && (
          <button
            style={buttonStyleBlue}
            onClick={() => router.push(`/dashboard?patientId=${patientId}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = "brightness(1.1)";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(99, 102, 241, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "none";
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.2)";
            }}
          >
            Back to Subject Dashboard
          </button>
        )}
      </div>
    </header>
  );
}

/* ================= STYLES ================= */

const headerStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 40px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(241, 245, 249, 0.8)",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.02)",
  position: "sticky",
  top: 0,
  zIndex: 100,
  fontFamily: "'Inter', sans-serif",
};

const logoWrapper: React.CSSProperties = {
  background: "linear-gradient(135deg, hsl(245, 75%, 95%) 0%, hsl(245, 75%, 90%) 100%)",
  padding: 8,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 8px 16px -4px rgba(99, 102, 241, 0.1)",
};

const logoText: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 22,
  letterSpacing: "-0.5px",
  background: "linear-gradient(90deg, hsl(245, 75%, 60%), hsl(210, 100%, 50%))",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const rightStyle: React.CSSProperties = {
  display: "flex",
  gap: 16,
};

const buttonBase: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
};

const buttonStyleBlue: React.CSSProperties = {
  ...buttonBase,
  background: "linear-gradient(135deg, hsl(245, 75%, 60%) 0%, hsl(245, 75%, 50%) 100%)",
  color: "#fff",
  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
};

const buttonStyleGray: React.CSSProperties = {
  ...buttonBase,
  background: "#f1f5f9",
  color: "#334155",
};
