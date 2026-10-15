"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Loading from "../loading";
import { generateAdmissionPDF } from "@/lib/pdfGenerator";

type Patient = {
  patientId: string;
  name: string;
  address: string;
  aadhar: string;
  phone: string;
  bloodGroup?: string;
  allergies?: string;
  emergencyContact?: string;
  fingerprintUrl?: string;
  status: string;
  updatedAt: string;
};

type Medication = {
  name: string;
  dosage: string;
  frequency: string;
};

type AdmissionRecordType = {
  _id: string;
  patientId: string;
  hospitalName: string;
  admissionDate: string;
  dischargeDate?: string;
  referredBy?: string;
  roomType?: string;
  roomNo?: string;
  doctorNote?: string;
  medications: Medication[];
  xrayFileUrls: string[];
  doctorSummaryUrl?: string;
  status: string;
  createdAt: string;
};

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");

  const [patient, setPatient] = useState<Patient | null>(null);
  const [admissions, setAdmissions] = useState<AdmissionRecordType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    // Fetch patient info
    fetch(`/api/patients/${patientId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setPatient(data);
        else setError(data.error);
      })
      .catch(() => setError("Failed to load subject"));

    // Fetch admission records
    fetch(`/api/admissions?patientId=${patientId}`)
      .then((res) => res.json())
      .then((data: AdmissionRecordType[]) => {
        if (!data.error) setAdmissions(data);
      })
      .catch((err) => console.error("History fetch error:", err))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return Loading();
  if (error) return <p style={{ padding: 40, color: "red", textAlign: "center", fontWeight: "bold" }}>{error}</p>;
  if (!patient) return null;

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

      <div style={containerStyle}>
        {/* Subject Info Card */}
        <div style={cardStyle}>
          <div style={cardHeader}>
            <span style={avatarStyle}>👤</span>
            <div>
              <h2 style={cardTitle}>Subject Profile</h2>
              <span style={patientIdBadge}>Subject ID: {patient.patientId}</span>
            </div>
          </div>

          <div style={infoListStyle}>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Temporary Assigned Name:</span>
              <span style={infoValStyle}>{patient.name}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Discovery / Intake Location:</span>
              <span style={infoValStyle}>{patient.address}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Aadhaar / Gov Registry ID:</span>
              <span style={infoValStyle}>{patient.aadhar}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Phone Number:</span>
              <span style={infoValStyle}>{patient.phone}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Blood Group:</span>
              <span style={{ ...infoValStyle, color: "hsl(14, 90%, 55%)", fontWeight: "bold" }}>
                {patient.bloodGroup || "-"}
              </span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Allergies:</span>
              <span style={{ ...infoValStyle, color: "hsl(14, 90%, 55%)" }}>{patient.allergies || "-"}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Emergency Contact:</span>
              <span style={infoValStyle}>{patient.emergencyContact || "-"}</span>
            </div>
          </div>

          {patient.fingerprintUrl && (
            <div style={{ marginTop: 24 }}>
              <strong style={{ display: "block", color: "#475569", fontSize: 13, marginBottom: 8 }}>
                Subject Biometric Fingerprint:
              </strong>
              <div style={fingerprintWrapper}>
                <img src={patient.fingerprintUrl} alt="Fingerprint" style={fingerprintImg} />
              </div>
            </div>
          )}

          <div style={{ marginTop: 30, textAlign: "right", color: "#94a3b8", fontSize: 11, fontWeight: "600" }}>
            Last Update: {formatDateTime(patient.updatedAt)}
          </div>
        </div>

        {/* Admission History Timeline Card */}
        <div style={cardStyleRight}>
          <div style={cardHeader}>
            <span style={avatarStyleHospital}>🏥</span>
            <div>
              <h2 style={cardTitle}>Admission & Shelter History</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span style={statusIndicator(patient.status)} />
                <span style={statusText(patient.status)}>{patient.status.toUpperCase()}</span>
              </div>
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
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
};

const backgroundGlow1: React.CSSProperties = {
  position: "absolute",
  width: 600,
  height: 600,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(99, 102, 241, 0.04) 0%, rgba(255, 255, 255, 0) 70%)",
  top: "-10%",
  left: "-10%",
  zIndex: 0,
};

const backgroundGlow2: React.CSSProperties = {
  position: "absolute",
  width: 600,
  height: 600,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(6, 182, 212, 0.04) 0%, rgba(255, 255, 255, 0) 70%)",
  bottom: "-10%",
  right: "-10%",
  zIndex: 0,
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

const cardStyleRight: React.CSSProperties = {
  ...cardStyle,
  flex: "1.4 1 0%",
};

const cardHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginBottom: 24,
};

const avatarStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 14,
  backgroundColor: "hsl(245, 75%, 96%)",
  fontSize: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const avatarStyleHospital: React.CSSProperties = {
  ...avatarStyle,
  backgroundColor: "hsl(210, 100%, 96%)",
};

const cardTitle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 800,
  color: "#0f172a",
  margin: 0,
  letterSpacing: "-0.5px",
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

const infoListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const infoRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  borderBottom: "1px solid #f8fafc",
  paddingBottom: 8,
};

const infoLabelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#64748b",
  fontWeight: "600",
};

const infoValStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#1e293b",
  fontWeight: "700",
  textAlign: "right",
};

const fingerprintWrapper: React.CSSProperties = {
  border: "1.5px solid #e2e8f0",
  borderRadius: 16,
  padding: 12,
  backgroundColor: "#f8fafc",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const fingerprintImg: React.CSSProperties = {
  maxWidth: "100%",
  maxHeight: 180,
  borderRadius: 8,
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
