"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    patientId: "",
    name: "",
    address: "",
    aadhar: "",
    phone: "",
    bloodGroup: "",
    allergies: "",
    emergencyContact: "",
    fingerprintUrl: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, fingerprintUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.patientId || !form.name || !form.address || !form.aadhar || !form.phone) {
      alert("Please fill all required fields");
      return;
    }

    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    alert("Subject registered successfully!");
    router.push("/");
  };

  return (
    <main style={pageStyle}>
      <div style={backgroundGlow1} />
      <div style={backgroundGlow2} />

      <div style={{ display: "flex", justifyContent: "center", width: "100%", zIndex: 1 }}>
        <form onSubmit={handleSubmit} style={cardStyle}>
          <div style={brandBadge}>New Subject Registry</div>
          <h1 style={titleStyle}>Unidentified Subject Registration</h1>
          <p style={subtitleStyle}>Register an unidentified Jane/John Doe with observable details and fingerprint matching.</p>

          {/* Subject General Info */}
          <div style={sectionHeader}>
            <span style={sectionNumber}>1</span>
            <h3 style={sectionTitle}>Subject General Information</h3>
          </div>
          <div style={formGrid}>
            <input
              name="patientId"
              placeholder="Subject ID (e.g. S001)"
              value={form.patientId}
              onChange={handleChange}
              style={inputStyle}
              required
            />
            <input
              name="name"
              placeholder="Temporary Assigned Name / Identifier"
              value={form.name}
              onChange={handleChange}
              style={inputStyle}
              required
            />
            <input
              name="address"
              placeholder="Discovery / Intake Location"
              value={form.address}
              onChange={handleChange}
              style={inputStyle}
              required
            />
            <input
              name="aadhar"
              placeholder="Aadhaar / Gov Registry ID (if any)"
              value={form.aadhar}
              onChange={handleChange}
              style={inputStyle}
              required
            />
            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          {/* Medical Info */}
          <div style={sectionHeader}>
            <span style={sectionNumber}>2</span>
            <h3 style={sectionTitle}>Medical Information</h3>
          </div>
          <div style={formGrid}>
            <input
              name="bloodGroup"
              placeholder="Blood Group (e.g. O+)"
              value={form.bloodGroup}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="allergies"
              placeholder="Known Allergies (if any)"
              value={form.allergies}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="emergencyContact"
              placeholder="Emergency Contact Phone"
              value={form.emergencyContact}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* Fingerprint Upload */}
          <div style={sectionHeader}>
            <span style={sectionNumber}>🔒</span>
            <h3 style={sectionTitle}>Biometric Fingerprint Intake Encoding</h3>
          </div>
          <div style={{ position: "relative", marginBottom: 24 }}>
            <label style={fileInputStyle}>
              <span style={{ fontSize: 28, marginBottom: 8 }}>🖐️</span>
              <span>
                {form.fingerprintUrl ? "Fingerprint Encoded Successfully" : "Click to Upload Biometric Fingerprint Image"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={fileInputHidden}
              />
            </label>
          </div>

          <div style={buttonGroup}>
            <button type="submit" style={buttonStyleBlue}>
              Register Subject
            </button>
            <button
              type="button"
              style={buttonStyleGray}
              onClick={() => router.push("/")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

/* ================= STYLES ================= */

const pageStyle: React.CSSProperties = {
  padding: "40px 24px",
  backgroundColor: "#f8fafc",
  fontFamily: "'Inter', sans-serif",
  minHeight: "100vh",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const backgroundGlow1: React.CSSProperties = {
  position: "absolute",
  width: 500,
  height: 500,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(255, 255, 255, 0) 70%)",
  top: "-5%",
  left: "-5%",
  zIndex: 0,
};

const backgroundGlow2: React.CSSProperties = {
  position: "absolute",
  width: 600,
  height: 600,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(255, 255, 255, 0) 70%)",
  bottom: "-5%",
  right: "-5%",
  zIndex: 0,
};

const cardStyle: React.CSSProperties = {
  width: 640,
  maxWidth: "100%",
  borderRadius: 24,
  padding: 40,
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.04), 0 0 1px 1px rgba(0, 0, 0, 0.02)",
  backgroundColor: "#ffffff",
  border: "1px solid rgba(241, 245, 249, 0.8)",
  boxSizing: "border-box",
};

const brandBadge: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "hsl(245, 75%, 96%)",
  color: "hsl(245, 75%, 55%)",
  padding: "6px 12px",
  borderRadius: 30,
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: 16,
};

const titleStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 800,
  color: "#0f172a",
  margin: "0 0 6px 0",
  letterSpacing: "-0.5px",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 15,
  color: "#64748b",
  margin: "0 0 35px 0",
  lineHeight: 1.5,
};

const sectionHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 20,
  borderBottom: "1px solid #f1f5f9",
  paddingBottom: 8,
};

const sectionNumber: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  backgroundColor: "hsl(245, 75%, 96%)",
  color: "hsl(245, 75%, 55%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: 700,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#334155",
  margin: 0,
};

const formGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  marginBottom: 30,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  border: "1.5px solid #e2e8f0",
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
  color: "#1e293b",
  backgroundColor: "#f8fafc",
  transition: "all 0.2s ease",
};

const fileInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "24px 20px",
  borderRadius: 16,
  border: "2px dashed #cbd5e1",
  backgroundColor: "#f8fafc",
  textAlign: "center",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "#475569",
  fontSize: 14,
  fontWeight: 600,
  transition: "all 0.25s ease",
};

const fileInputHidden: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  opacity: 0,
  cursor: "pointer",
};

const buttonGroup: React.CSSProperties = {
  display: "flex",
  gap: 16,
  marginTop: 20,
};

const buttonBase: React.CSSProperties = {
  padding: "14px 24px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 15,
  flex: 1,
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
};

const buttonStyleBlue: React.CSSProperties = {
  ...buttonBase,
  background: "linear-gradient(135deg, hsl(245, 75%, 60%) 0%, hsl(245, 75%, 50%) 100%)",
  color: "#fff",
  boxShadow: "0 8px 20px -6px rgba(99, 102, 241, 0.3)",
};

const buttonStyleGray: React.CSSProperties = {
  ...buttonBase,
  background: "#f1f5f9",
  color: "#475569",
};
