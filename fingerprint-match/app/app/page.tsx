"use client";

import { useState } from "react";
import Image from "next/image";
import { generateAdmissionPDF } from "@/lib/pdfGenerator";

export default function Home() {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [patient, setPatient] = useState<any>(null);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(true);
  const [error, setError] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFingerprint(reader.result as string);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMatch = async () => {
    if (!fingerprint) return setError("Please upload a fingerprint image first.");
    setError("");

    const res = await fetch("/api/fingerprint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fingerprint: fingerprint }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Match failed");
      setPatient(null);
      setAdmissions([]);
    } else {
      const p = data.patient || data;
      setPatient(p);
      
      // Fetch admissions history
      try {
        const adRes = await fetch(`/api/admissions?patientId=${p.patientId}`);
        if (adRes.ok) {
          const adData = await adRes.json();
          setAdmissions(adData);
        }
      } catch (err) {
        console.error("Failed to load history", err);
      }
    }
  };

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <main style={pageStyle}>
      <div style={backgroundGlow1} />
      <div style={backgroundGlow2} />

      <header style={headerStyle}>
        <div style={logoWrapper}>
          <span style={{ fontSize: 22 }}>🔒</span>
          <span style={logoText}>LifeLine Biometrics</span>
        </div>
        <span style={systemBadge}>Secure Terminal</span>
      </header>

      <div style={containerStyle}>
        {/* Left Column: Biometric Scan Deck */}
        <div style={cardStyle}>
          <div style={sectionHeader}>
            <span style={sectionIcon}>⚡</span>
            <h2 style={sectionTitle}>Biometric Scan Deck</h2>
          </div>
          <p style={subtitleStyle}>Load a high-fidelity subject fingerprint scan to search the registry database.</p>

          <div style={scannerContainer}>
            <label style={scanBedStyle(!!fingerprint)}>
              {fingerprint ? (
                <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center" }}>
                  <img src={fingerprint} alt="Fingerprint" style={scannedFingerprintImg} />
                  <div style={scanLaserLine} />
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={scanIconStyle}>🖐️</span>
                  <span style={{ fontSize: 13, color: "#64748b", fontWeight: "700" }}>Place Fingerprint Record Here</span>
                  <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>JPEG / PNG Digital Scans Only</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFile} style={fileInputHidden} />
            </label>
          </div>

          {error && <div style={errorBanner}>{error}</div>}

          <div style={{ marginTop: 20 }}>
            <button
              onClick={handleMatch}
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
              Analyze & Match Subject Fingerprint
            </button>
            {fingerprint && (
              <button
                onClick={() => {
                  setFingerprint(null);
                  setPatient(null);
                  setDoctorSummaries([]);
                  setError("");
                }}
                style={buttonStyleGray}
              >
                Clear Deck
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Telemetry & Records */}
        <div style={patient ? cardStyleMatched : cardStyleEmpty}>
          {!patient ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 340, color: "#94a3b8" }}>
              <span style={{ fontSize: 48, marginBottom: 14 }}>🛰️</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#475569", margin: 0 }}>Awaiting Biometric Telemetry</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 6, textAlign: "center", maxWidth: 280 }}>
                Scan an unidentified subject's fingerprint to execute a query against the registry database.
              </p>
            </div>
          ) : (
            <div>
              <div style={sectionHeader}>
                <span style={avatarStyleMatched}>🧬</span>
                <div>
                  <h2 style={sectionTitleMatched}>Subject Match Found</h2>
                  <span style={patientIdBadge}>Subject ID: {patient.patientId}</span>
                </div>
              </div>

              <div style={infoGridStyle}>
                <div style={infoBox}>
                  <span style={infoLabel}>TEMPORARY ASSIGNED NAME</span>
                  <span style={infoVal}>{patient.name}</span>
                </div>
                <div style={infoBox}>
                  <span style={infoLabel}>PHONE NUMBER</span>
                  <span style={infoVal}>{patient.phone}</span>
                </div>
                <div style={infoBox}>
                  <span style={infoLabel}>AADHAAR / GOV REGISTRY ID</span>
                  <span style={infoVal}>{patient.aadhar}</span>
                </div>
                <div style={infoBox}>
                  <span style={infoLabel}>BLOOD GROUP</span>
                  <span style={{ ...infoVal, color: "hsl(14, 90%, 55%)" }}>{patient.bloodGroup || "-"}</span>
                </div>
                <div style={infoBoxFull}>
                  <span style={infoLabel}>DISCOVERY / INTAKE LOCATION</span>
                  <span style={infoVal}>{patient.address}</span>
                </div>
                <div style={infoBoxFull}>
                  <span style={infoLabel}>MEDICAL ALLERGIES</span>
                  <span style={{ ...infoVal, color: "hsl(14, 90%, 55%)" }}>{patient.allergies || "No Known Allergies"}</span>
                </div>
                <div style={infoBoxFull}>
                  <span style={infoLabel}>EMERGENCY CONTACT</span>
                  <span style={infoVal}>{patient.emergencyContact || "-"}</span>
                </div>
              </div>

              <div style={summaryPanel}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", margin: 0 }}>
                    Admission & Registry History
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={statusIndicator(patient.status)} />
                    <span style={statusText(patient.status)}>{patient.status.toUpperCase()}</span>
                  </div>
                </div>

                <div style={{ position: "relative" }}>
                  <div onClick={() => setShowHistoryDropdown(!showHistoryDropdown)} style={dropdownHeader}>
                    <span>{showHistoryDropdown ? "Hide Registry Timeline" : `Show Registry Timeline (${admissions.length})`}</span>
                    <span style={{ transform: showHistoryDropdown ? "rotate(180deg)" : "rotate(0deg)", transition: "all 0.2s" }}>▼</span>
                  </div>

                  {showHistoryDropdown && (
                    <div style={dropdownContent}>
                      {admissions.length === 0 ? (
                        <p style={{ color: "#94a3b8", textAlign: "center", padding: 24, margin: 0, fontSize: 14 }}>
                          No historical registry records found for this subject.
                        </p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                          {admissions.map((rec) => (
                            <div key={rec._id} style={historyCardStyle}>
                              <div style={historyCardHeaderStyle}>
                                <div>
                                  <strong style={{ fontSize: 15, color: "#1e293b" }}>{rec.hospitalName}</strong>
                                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                                    {new Date(rec.admissionDate).toLocaleDateString()} - {rec.dischargeDate ? new Date(rec.dischargeDate).toLocaleDateString() : "Active"}
                                  </div>
                                </div>
                                <button
                                  onClick={() => generateAdmissionPDF(patient, rec)}
                                  style={miniPDFBtnStyle}
                                >
                                  Download PDF 📥
                                </button>
                              </div>
                              
                              <div style={{ fontSize: 12, color: "#475569", marginTop: 8 }}>
                                <strong>Referred Doctor:</strong> {rec.referredBy || "N/A"} | <strong>Room details:</strong> {rec.roomType} {rec.roomNo}
                              </div>

                              {rec.doctorNote && (
                                <div style={{ marginTop: 8 }}>
                                  <span style={{ fontSize: 11, fontWeight: "bold", color: "#64748b" }}>Doctor's Remarks:</span>
                                  <div style={noteTextWrapper}>
                                    {rec.doctorNote}
                                  </div>
                                </div>
                              )}

                              {rec.medications && rec.medications.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                  <span style={{ fontSize: 11, fontWeight: "bold", color: "#64748b" }}>Prescribed Medications:</span>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                                    {rec.medications.map((m, i) => (
                                      <span key={i} style={medTagStyle}>
                                        {m.name} ({m.dosage} - {m.frequency})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {rec.xrayFileUrls && rec.xrayFileUrls.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                  <span style={{ fontSize: 11, fontWeight: "bold", color: "#64748b" }}>Diagnostic Imaging (X-rays):</span>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                                    {rec.xrayFileUrls.map((x, i) => (
                                      <a key={i} href={x} target="_blank" rel="noopener noreferrer" style={historyXrayThumbStyle}>
                                        <img src={x} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {rec.doctorSummaryUrl && (
                                <div style={{ marginTop: 10 }}>
                                  <a href={rec.doctorSummaryUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "hsl(245, 75%, 60%)", fontWeight: "bold", textDecoration: "none" }}>
                                    View Signed Discharge Summary Note 📄
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/* ================= STYLES ================= */

const pageStyle: React.CSSProperties = {
  padding: "40px 24px",
  backgroundColor: "#f8fafc",
  minHeight: "100vh",
  fontFamily: "'Inter', sans-serif",
  position: "relative",
  overflow: "hidden",
};

const backgroundGlow1: React.CSSProperties = {
  position: "absolute",
  width: 600,
  height: 600,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(255, 255, 255, 0) 70%)",
  top: "-10%",
  left: "-10%",
  zIndex: 0,
};

const backgroundGlow2: React.CSSProperties = {
  position: "absolute",
  width: 600,
  height: 600,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(6, 182, 212, 0.05) 0%, rgba(255, 255, 255, 0) 70%)",
  bottom: "-10%",
  right: "-10%",
  zIndex: 0,
};

const headerStyle: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto 30px auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  zIndex: 2,
  position: "relative",
  borderBottom: "1px solid #e2e8f0",
  paddingBottom: 16,
};

const logoWrapper: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const logoText: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 20,
  letterSpacing: "-0.5px",
  background: "linear-gradient(90deg, hsl(245, 75%, 60%), hsl(210, 100%, 50%))",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const systemBadge: React.CSSProperties = {
  backgroundColor: "rgba(99, 102, 241, 0.08)",
  color: "hsl(245, 75%, 55%)",
  padding: "4px 10px",
  borderRadius: 30,
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const containerStyle: React.CSSProperties = {
  display: "flex",
  gap: 24,
  maxWidth: 1200,
  margin: "0 auto",
  alignItems: "flex-start",
  width: "100%",
  zIndex: 1,
  position: "relative",
};

const cardStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  borderRadius: 24,
  padding: 30,
  boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.03), 0 0 1px 1px rgba(0, 0, 0, 0.02)",
  backgroundColor: "#ffffff",
  border: "1px solid rgba(241, 245, 249, 0.8)",
  boxSizing: "border-box",
};

const cardStyleMatched: React.CSSProperties = {
  ...cardStyle,
  flex: "1.2 1 0%",
  border: "1px solid rgba(16, 185, 129, 0.15)",
};

const cardStyleEmpty: React.CSSProperties = {
  ...cardStyle,
  flex: "1.2 1 0%",
  border: "1.5px dashed #cbd5e1",
  backgroundColor: "rgba(248, 250, 252, 0.3)",
};

const sectionHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 16,
};

const sectionIcon: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 10,
  backgroundColor: "hsl(245, 75%, 96%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
};

const avatarStyleMatched: React.CSSProperties = {
  ...sectionIcon,
  backgroundColor: "hsl(150, 80%, 95%)",
  fontSize: 16,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 855,
  color: "#0f172a",
  margin: 0,
  letterSpacing: "-0.5px",
};

const sectionTitleMatched: React.CSSProperties = {
  ...sectionTitle,
  color: "hsl(150, 80%, 30%)",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#64748b",
  margin: "0 0 24px 0",
  lineHeight: 1.5,
};

const scannerContainer: React.CSSProperties = {
  width: "100%",
  marginBottom: 20,
};

const scanBedStyle = (hasImage: boolean): React.CSSProperties => ({
  width: "100%",
  height: 240,
  borderRadius: 20,
  border: hasImage ? "2.5px solid hsl(245, 75%, 60%)" : "2px dashed #cbd5e1",
  backgroundColor: hasImage ? "rgba(99, 102, 241, 0.02)" : "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s ease",
});

const scanIconStyle: React.CSSProperties = {
  fontSize: 42,
  marginBottom: 8,
  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.06))",
};

const scannedFingerprintImg: React.CSSProperties = {
  maxHeight: "100%",
  objectFit: "contain",
  borderRadius: 12,
  padding: 12,
};

const scanLaserLine: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  height: 3,
  background: "linear-gradient(90deg, transparent, hsl(245, 75%, 60%), transparent)",
  boxShadow: "0 0 10px 2px rgba(99, 102, 241, 0.5)",
  animation: "laserMove 2.5s infinite linear",
};

const fileInputHidden: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  opacity: 0,
  cursor: "pointer",
};

const buttonBase: React.CSSProperties = {
  padding: "13px 20px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
  textAlign: "center",
  width: "100%",
  boxSizing: "border-box",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  marginBottom: 10,
};

const buttonStyleBlue: React.CSSProperties = {
  ...buttonBase,
  background: "linear-gradient(135deg, hsl(245, 75%, 60%) 0%, hsl(245, 75%, 50%) 100%)",
  color: "#fff",
  boxShadow: "0 8px 16px -4px rgba(99, 102, 241, 0.3)",
};

const buttonStyleGray: React.CSSProperties = {
  ...buttonBase,
  background: "#f1f5f9",
  color: "#475569",
};

const errorBanner: React.CSSProperties = {
  backgroundColor: "rgba(239, 68, 68, 0.08)",
  color: "hsl(14, 90%, 50%)",
  padding: "10px 14px",
  borderRadius: 10,
  fontSize: 12,
  fontWeight: 700,
  margin: "14px 0",
  border: "1px solid rgba(239, 68, 68, 0.15)",
};

const patientIdBadge: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#f1f5f9",
  color: "#475569",
  padding: "3px 8px",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 700,
  marginTop: 4,
};

const infoGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  margin: "24px 0",
};

const infoBox: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  border: "1px solid #f1f5f9",
  padding: "12px 14px",
  borderRadius: 14,
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const infoBoxFull: React.CSSProperties = {
  ...infoBox,
  gridColumn: "1 / -1",
};

const infoLabel: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 800,
  color: "#64748b",
  letterSpacing: "0.5px",
};

const infoVal: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#1e293b",
};

const summaryPanel: React.CSSProperties = {
  marginTop: 30,
  borderTop: "1.5px solid #f1f5f9",
  paddingTop: 24,
};

const emptySummaryPanel: React.CSSProperties = {
  marginTop: 30,
  borderTop: "1.5px solid #f1f5f9",
  padding: "24px 0",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const dropdownHeader: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1.5px solid #e2e8f0",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#f8fafc",
  fontSize: 13,
  fontWeight: "700",
  color: "#475569",
  marginTop: 8,
};

const dropdownContent: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
  marginTop: 12,
  padding: 16,
  boxSizing: "border-box",
};

const statusIndicator = (status: string): React.CSSProperties => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: status === "admitted" ? "hsl(150, 80%, 38%)" : "hsl(14, 90%, 55%)",
  boxShadow: status === "admitted" ? "0 0 10px rgba(16, 185, 129, 0.6)" : "0 0 10px rgba(239, 68, 68, 0.6)",
});

const statusText = (status: string): React.CSSProperties => ({
  fontSize: 12,
  fontWeight: 800,
  color: status === "admitted" ? "hsl(150, 80%, 35%)" : "hsl(14, 90%, 50%)",
  letterSpacing: "0.5px",
});

const historyCardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc",
  display: "flex",
  flexDirection: "column",
};

const historyCardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const miniPDFBtnStyle: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 10,
  border: "1.5px solid hsl(245, 75%, 85%)",
  backgroundColor: "hsl(245, 75%, 96%)",
  color: "hsl(245, 75%, 55%)",
  fontSize: 12,
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.2s",
};

const noteTextWrapper: React.CSSProperties = {
  padding: 10,
  borderRadius: 10,
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  color: "#475569",
  fontSize: 12,
  lineHeight: "1.4",
  whiteSpace: "pre-wrap",
  marginTop: 4,
};

const medTagStyle: React.CSSProperties = {
  padding: "3px 8px",
  borderRadius: 6,
  backgroundColor: "hsl(210, 100%, 95%)",
  color: "hsl(210, 100%, 30%)",
  fontSize: 11,
  fontWeight: "600",
};

const historyXrayThumbStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 8,
  overflow: "hidden",
  border: "1px solid #cbd5e1",
};
