"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  referredBy?: string;
  roomType?: string;
  roomNo?: string;
  wardNo?: string;
  updatedAt: string;
};

type Bill = {
  _id: string;
  amount: number;
  paid: boolean;
  createdAt: string;
  billFileUrl?: string;
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");

  const [patient, setPatient] = useState<Patient | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [admissions, setAdmissions] = useState<AdmissionRecordType[]>([]);
  const [activeRecord, setActiveRecord] = useState<AdmissionRecordType | null>(null);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  const [isDischarged, setIsDischarged] = useState(false);

  // Discharge modal state
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [doctorNoteFile, setDoctorNoteFile] = useState<File | null>(null);
  const [dischargeNotes, setDischargeNotes] = useState("");
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: "", frequency: "" }
  ]);
  const [xrayFiles, setXrayFiles] = useState<FileList | null>(null);

  // Hospital info modal (Admission Form)
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [admissionForm, setAdmissionForm] = useState({
    hospitalName: "",
    referredBy: "",
    roomType: "",
    roomNo: "",
  });

  const addMedicationRow = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "" }]);
  };

  const removeMedicationRow = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (index: number, field: keyof Medication, val: string) => {
    const updated = medications.map((med, i) => {
      if (i === index) {
        return { ...med, [field]: val };
      }
      return med;
    });
    setMedications(updated);
  };

  const fetchPatientData = () => {
    if (!patientId) return;

    // fetch patient
    fetch(`/api/patients/${patientId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setPatient(data);
        else setError(data.error);
      })
      .catch(() => setError("Failed to load patient"));

    // fetch bills
    fetch(`/api/bills/${patientId}`)
      .then((res) => res.json())
      .then(setBills)
      .finally(() => setLoading(false));

    // fetch admissions history
    fetch(`/api/admissions?patientId=${patientId}`)
      .then((res) => res.json())
      .then((data: AdmissionRecordType[]) => {
        setAdmissions(data);
        const active = data.find((r) => r.status === "admitted");
        if (active) setActiveRecord(active);
        else setActiveRecord(null);
      })
      .catch((err) => console.error("Admissions fetch error:", err));
  };

  useEffect(() => {
    fetchPatientData();
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

  const totalUnpaid = bills.filter((b) => !b.paid).reduce((acc, b) => acc + b.amount, 0);

  // Admit patient
  const handleAdmit = () => {
    setAdmissionForm({
      hospitalName: "",
      referredBy: "",
      roomType: "",
      roomNo: "",
    });
    setShowAdmitModal(true);
  };

  const submitAdmission = async () => {
    if (!admissionForm.hospitalName) {
      return alert("Hospital Name is required");
    }

    try {
      // 1. Create admission record
      const admitRes = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.patientId,
          hospitalName: admissionForm.hospitalName,
          referredBy: admissionForm.referredBy,
          roomType: admissionForm.roomType,
          roomNo: admissionForm.roomNo,
          doctorNote: "",
          medications: [],
        }),
      });

      const newRecord = await admitRes.json();
      if (newRecord.error) return alert(newRecord.error);

      setActiveRecord(newRecord);

      // 2. Patch patient status to admitted
      const patientRes = await fetch(`/api/patients/${patient.patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "admitted",
          referredBy: admissionForm.referredBy,
          roomType: admissionForm.roomType,
          roomNo: admissionForm.roomNo,
        }),
      });

      const updatedPatient = await patientRes.json();
      setPatient(updatedPatient);
      setShowAdmitModal(false);
      
      // Refresh history list
      fetchPatientData();
    } catch (err) {
      console.error(err);
      alert("Failed to complete admission workflow.");
    }
  };

  const handleDischargeFlow = async () => {
    if (!doctorNoteFile) return alert("Please select a signed summary file");
    if (!activeRecord) return;

    try {
      // 1. Upload signed note first
      const formData = new FormData();
      formData.append("patientId", patient.patientId);
      formData.append("file", doctorNoteFile);

      const dsRes = await fetch("/api/ds", { method: "POST", body: formData });
      const dsData = await dsRes.json();
      if (dsData.error) return alert(dsData.error);

      const summaryImageUrl = dsData.summaryImageUrl;

      // 2. Upload X-ray files if any
      let xrayUrls: string[] = [];
      if (xrayFiles && xrayFiles.length > 0) {
        const xrayFormData = new FormData();
        for (let i = 0; i < xrayFiles.length; i++) {
          xrayFormData.append("files", xrayFiles[i]);
        }
        const xrayRes = await fetch(`/api/admissions/${activeRecord._id}/xray`, {
          method: "POST",
          body: xrayFormData,
        });
        const updatedRecord = await xrayRes.json();
        xrayUrls = updatedRecord.xrayFileUrls || [];
      }

      // Filter medications
      const activeMeds = medications.filter(m => m.name.trim() !== "");

      // 3. Update AdmissionRecord to discharged
      await fetch(`/api/admissions/${activeRecord._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "discharged",
          dischargeDate: new Date(),
          doctorSummaryUrl: summaryImageUrl,
          doctorNote: dischargeNotes,
          medications: activeMeds,
        }),
      });

      // 4. Update Patient Status
      const patientRes = await fetch(`/api/patients/${patient.patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "discharged",
          roomType: "",
          roomNo: "",
          wardNo: "",
          referredBy: "",
        }),
      });

      const updatedPatient = await patientRes.json();
      setPatient(updatedPatient);
      setIsDischarged(true);

      // Refresh bills
      const billsRes = await fetch(`/api/bills/${patient.patientId}`);
      const billsData = await billsRes.json();
      setBills(billsData);



      // Reset discharge form state
      setDoctorNoteFile(null);
      setDischargeNotes("");
      setMedications([{ name: "", dosage: "", frequency: "" }]);
      setXrayFiles(null);
      setShowDischargeModal(false);

      fetchPatientData();
    } catch (err) {
      console.error(err);
      alert("Failed to complete discharge process.");
    }
  };

  return (
    <main style={pageStyle}>
      <div style={backgroundGlow1} />
      <div style={backgroundGlow2} />

      <div style={containerStyle}>
        {/* Patient Info Card */}
        <div style={cardStyle}>
          <div style={cardHeader}>
            <span style={avatarStyle}>👤</span>
            <div>
              <h2 style={cardTitle}>Patient Profile</h2>
              <span style={patientIdBadge}>Patient ID: {patient.patientId}</span>
            </div>
          </div>

          <div style={infoListStyle}>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Name:</span>
              <span style={infoValStyle}>{patient.name}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Address:</span>
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
                Patient Biometric Fingerprint:
              </strong>
              <div style={fingerprintWrapper}>
                <img src={patient.fingerprintUrl} alt="Fingerprint" style={fingerprintImg} />
              </div>
            </div>
          )}
        </div>

        {/* Hospital Admission Card */}
        <div style={cardStyle}>
          <div style={{ textAlign: "right", color: "#94a3b8", marginBottom: 12, fontSize: 11, fontWeight: "600" }}>
            Last Update: {formatDateTime(patient.updatedAt)}
          </div>
          <div style={cardHeader}>
            <span style={avatarStyleHospital}>🏥</span>
            <div>
              <h2 style={cardTitle}>Hospital Admission</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span style={statusIndicator(patient.status)} />
                <span style={statusText(patient.status)}>{patient.status.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {patient.status === "admitted" && activeRecord ? (
            <div style={infoListStyle}>
              <div style={infoRowStyle}>
                <span style={infoLabelStyle}>Hospital Name:</span>
                <span style={{ ...infoValStyle, color: "hsl(245, 75%, 60%)" }}>{activeRecord.hospitalName}</span>
              </div>
              <div style={infoRowStyle}>
                <span style={infoLabelStyle}>Referred By:</span>
                <span style={infoValStyle}>{activeRecord.referredBy || "-"}</span>
              </div>
              <div style={infoRowStyle}>
                <span style={infoLabelStyle}>Room Type:</span>
                <span style={infoValStyle}>{activeRecord.roomType || "-"}</span>
              </div>
              <div style={infoRowStyle}>
                <span style={infoLabelStyle}>Room Number:</span>
                <span style={infoValStyle}>{activeRecord.roomNo || "-"}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 30 }}>
                <button style={buttonStyleRed} onClick={() => setShowDischargeModal(true)}>
                  Discharge Patient
                </button>
                <button
                  style={buttonStyleGray}
                  onClick={() => router.push(`/bills?patientId=${patient.patientId}`)}
                >
                  Manage Billing Records
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 20 }}>
              <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>
                This patient is currently discharged. Click below to begin a new admission workflow.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button style={buttonStyleBlue} onClick={handleAdmit}>
                  Admit Patient
                </button>
                <button
                  style={buttonStyleGray}
                  onClick={() => router.push(`/bills?patientId=${patient.patientId}`)}
                >
                  View Past Bills
                </button>
              </div>
            </div>
          )}

          {/* Admission History Timeline Section */}
          <div style={{ marginTop: 30, position: "relative" }}>
            <label style={{ fontWeight: "700", color: "#334155", fontSize: 14 }}>Biometric Admission History:</label>
            <div onClick={() => setShowHistoryDropdown(!showHistoryDropdown)} style={dropdownHeader}>
              <span>{showHistoryDropdown ? "Hide History Records" : `View History Records (${admissions.length})`}</span>
              <span style={{ transform: showHistoryDropdown ? "rotate(180deg)" : "rotate(0deg)", transition: "all 0.2s" }}>▼</span>
            </div>

            {showHistoryDropdown && (
              <div style={dropdownContent}>
                {admissions.length === 0 ? (
                  <p style={{ color: "#94a3b8", textAlign: "center", padding: 12, margin: 0, fontSize: 13 }}>No historical logs found.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {admissions.map((rec) => (
                      <div key={rec._id} style={historyCardStyle}>
                        <div style={historyCardHeaderStyle}>
                          <div>
                            <strong style={{ fontSize: 14, color: "#1e293b" }}>{rec.hospitalName}</strong>
                            <div style={{ fontSize: 11, color: "#64748b" }}>
                              {new Date(rec.admissionDate).toLocaleDateString()} - {rec.dischargeDate ? new Date(rec.dischargeDate).toLocaleDateString() : "Active"}
                            </div>
                          </div>
                          <button
                            onClick={() => generateAdmissionPDF(patient, rec)}
                            style={miniPDFBtnStyle}
                          >
                            PDF 📥
                          </button>
                        </div>
                        
                        <div style={{ fontSize: 12, color: "#475569", marginTop: 8 }}>
                          <strong>Doctor:</strong> {rec.referredBy || "N/A"} | <strong>Room:</strong> {rec.roomType} {rec.roomNo}
                        </div>
                        {rec.doctorNote && (
                          <div style={{ ...noteTextWrapper, fontSize: 12, marginTop: 6 }}>
                            {rec.doctorNote}
                          </div>
                        )}
                        {rec.medications && rec.medications.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: "bold", color: "#64748b" }}>Medications:</span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                              {rec.medications.map((m, i) => (
                                <span key={i} style={medTagStyle}>
                                  {m.name} ({m.dosage})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {rec.xrayFileUrls && rec.xrayFileUrls.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: "bold", color: "#64748b" }}>X-rays:</span>
                            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                              {rec.xrayFileUrls.map((x, i) => (
                                <a key={i} href={x} target="_blank" rel="noopener noreferrer" style={historyXrayThumbStyle}>
                                  <img src={x} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        {rec.doctorSummaryUrl && (
                          <div style={{ marginTop: 8 }}>
                            <a href={rec.doctorSummaryUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "hsl(245, 75%, 60%)", fontWeight: "bold", textDecoration: "none" }}>
                              View Discharge summary image 📝
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

        {/* Discharge Summary Card */}
        {isDischarged && (
          <div style={cardStyleRight}>
            <div style={cardHeader}>
              <span style={avatarStyleDischarge}>📃</span>
              <div>
                <h2 style={cardTitle}>Discharge Summary</h2>
                <span style={{ fontSize: 12, color: "#64748b" }}>Generated: {formatDateTime(patient.updatedAt)}</span>
              </div>
            </div>

            <div style={statsContainer}>
              <div style={statBox}>
                <span style={statLabel}>UNPAID BILLS</span>
                <span style={statVal(totalUnpaid)}>₹{totalUnpaid}</span>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <strong style={{ color: "#475569", fontSize: 14 }}>Unpaid Billing Records:</strong>
              {bills.length === 0 ? (
                <p style={{ color: "hsl(150, 80%, 38%)", marginTop: 8, fontWeight: "600" }}>No pending bills found. All clear! 🎉</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: "10px 0" }}>
                  {bills.map((b) => (
                    <li key={b._id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #fcf7e0" }}>
                      <span style={{ fontSize: 13, color: "#475569" }}>{formatDateTime(b.createdAt)}</span>
                      <strong style={{ fontSize: 13, color: "#1e293b" }}>₹{b.amount}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Discharge Authentication Modal (Popup with Notes, Meds, Xrays) */}
      {showDischargeModal && (
        <div style={{ ...modalOverlay, overflowY: "auto" }}>
          <div style={{ ...modalContent, width: 500, margin: "40px auto" }}>
            <h3 style={modalTitleStyle}>Discharge Authentication</h3>
            <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 10px 0" }}>
              Please provide discharge details, medications list, diagnostics, and signed notes.
            </p>

            {/* Signed Document upload (Required) */}
            <div style={{ position: "relative", margin: "10px 0" }}>
              <label style={fileInputStyle}>
                <span style={{ fontSize: 24, marginBottom: 6 }}>📝</span>
                <span style={{ fontSize: 13 }}>
                  {doctorNoteFile ? doctorNoteFile.name : "Select Signed Doctor Summary Image (Required)"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDoctorNoteFile(e.target.files?.[0] || null)}
                  style={fileInputHidden}
                />
              </label>
            </div>

            {/* Doctor's Note */}
            <textarea
              placeholder="Doctor's Final Note / Summary Remarks"
              value={dischargeNotes}
              onChange={(e) => setDischargeNotes(e.target.value)}
              style={{ ...modalInputStyle, minHeight: 80 }}
            />

            {/* Medications Section */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <strong style={{ fontSize: 12, color: "#475569" }}>Prescribed Medications:</strong>
                <button type="button" onClick={addMedicationRow} style={miniAddBtnStyle}>+ Add Medication</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 150, overflowY: "auto" }}>
                {medications.map((med, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      placeholder="Med Name"
                      value={med.name}
                      onChange={(e) => handleMedicationChange(idx, "name", e.target.value)}
                      style={{ ...modalInputStyle, padding: "8px" }}
                    />
                    <input
                      placeholder="Dosage"
                      value={med.dosage}
                      onChange={(e) => handleMedicationChange(idx, "dosage", e.target.value)}
                      style={{ ...modalInputStyle, padding: "8px", width: 90 }}
                    />
                    <input
                      placeholder="Frequency"
                      value={med.frequency}
                      onChange={(e) => handleMedicationChange(idx, "frequency", e.target.value)}
                      style={{ ...modalInputStyle, padding: "8px", width: 90 }}
                    />
                    {medications.length > 1 && (
                      <button type="button" onClick={() => removeMedicationRow(idx)} style={medRemoveBtnStyle}>✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* X-ray scans */}
            <div>
              <strong style={{ display: "block", fontSize: 12, color: "#475569", marginBottom: 6 }}>Upload X-ray Files / Imaging:</strong>
              <input type="file" multiple accept="image/*" onChange={(e) => setXrayFiles(e.target.files)} style={modalInputStyle} />
              {xrayFiles && (
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                  {xrayFiles.length} file(s) selected
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 15 }}>
              <button style={buttonStyleRed} onClick={handleDischargeFlow}>
                Confirm Discharge
              </button>
              <button
                style={buttonStyleGray}
                onClick={() => {
                  setShowDischargeModal(false);
                  setDoctorNoteFile(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admit Modal (Only Hospital Name & room config) */}
      {showAdmitModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={modalTitleStyle}>Hospital Admission Form</h3>
            <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 15px 0" }}>
              Provide the hospital name and room allocation details.
            </p>

            <input
              placeholder="Hospital Name (Required)"
              value={admissionForm.hospitalName}
              onChange={(e) => setAdmissionForm({ ...admissionForm, hospitalName: e.target.value })}
              style={modalInputStyle}
              required
            />

            <input
              placeholder="Referred Doctor Name"
              value={admissionForm.referredBy}
              onChange={(e) => setAdmissionForm({ ...admissionForm, referredBy: e.target.value })}
              style={modalInputStyle}
            />

            <select
              value={admissionForm.roomType}
              onChange={(e) => setAdmissionForm({ ...admissionForm, roomType: e.target.value })}
              style={modalSelectStyle}
            >
              <option value="">Select Room Type</option>
              <option value="Super Deluxe">Super Deluxe</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Normal">Normal</option>
              <option value="Ward">Ward</option>
            </select>

            <input
              placeholder="Allocated Room No"
              value={admissionForm.roomNo}
              onChange={(e) => setAdmissionForm({ ...admissionForm, roomNo: e.target.value })}
              style={modalInputStyle}
            />

            <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
              <button style={buttonStyleBlue} onClick={submitAdmission}>
                Authorize Admission
              </button>
              <button style={buttonStyleGray} onClick={() => setShowAdmitModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
  backgroundColor: "#fffdf5",
  border: "1px solid rgba(245, 222, 179, 0.4)",
  flex: "1.2 1 0%",
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

const avatarStyleDischarge: React.CSSProperties = {
  ...avatarStyle,
  backgroundColor: "hsl(45, 100%, 95%)",
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

const buttonBase: React.CSSProperties = {
  padding: "12px 20px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
  textAlign: "center",
  width: "100%",
  boxSizing: "border-box",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
};

const buttonStyleBlue: React.CSSProperties = {
  ...buttonBase,
  background: "linear-gradient(135deg, hsl(245, 75%, 60%) 0%, hsl(245, 75%, 50%) 100%)",
  color: "#fff",
  boxShadow: "0 8px 16px -4px rgba(99, 102, 241, 0.3)",
};

const buttonStyleRed: React.CSSProperties = {
  ...buttonBase,
  background: "linear-gradient(135deg, hsl(14, 90%, 55%) 0%, hsl(14, 90%, 48%) 100%)",
  color: "#fff",
  boxShadow: "0 8px 16px -4px rgba(239, 68, 68, 0.3)",
};

const buttonStyleGray: React.CSSProperties = {
  ...buttonBase,
  background: "#f1f5f9",
  color: "#475569",
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
  position: "absolute",
  top: "100%",
  left: 0,
  width: "100%",
  maxHeight: 450,
  overflowY: "auto",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
  marginTop: 6,
  padding: 16,
  zIndex: 10,
  boxSizing: "border-box",
};

const statsContainer: React.CSSProperties = {
  display: "flex",
  margin: "16px 0 24px 0",
};

const statBox: React.CSSProperties = {
  flex: 1,
  backgroundColor: "rgba(255, 255, 255, 0.5)",
  border: "1.5px solid #fbf2d3",
  padding: "16px 20px",
  borderRadius: 16,
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const statLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  color: "#8a7a5f",
  letterSpacing: "0.5px",
};

const statVal = (val: number): React.CSSProperties => ({
  fontSize: 24,
  fontWeight: 900,
  color: val > 0 ? "hsl(14, 90%, 50%)" : "hsl(150, 80%, 35%)",
});

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(15, 23, 42, 0.3)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContent: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: 34,
  borderRadius: 24,
  width: 400,
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  display: "flex",
  flexDirection: "column",
  gap: 14,
  boxSizing: "border-box",
  border: "1px solid rgba(255, 255, 255, 0.8)",
};

const modalTitleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 800,
  color: "#0f172a",
  margin: 0,
  letterSpacing: "-0.5px",
};

const modalInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1.5px solid #e2e8f0",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  color: "#1e293b",
  backgroundColor: "#f8fafc",
};

const modalSelectStyle: React.CSSProperties = {
  ...modalInputStyle,
  cursor: "pointer",
};

const fileInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "20px 16px",
  borderRadius: 16,
  border: "2px dashed #cbd5e1",
  textAlign: "center",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "#475569",
  fontSize: 13,
  fontWeight: 600,
};

const fileInputHidden: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  opacity: 0,
  cursor: "pointer",
  width: "100%",
  height: "100%",
};

const noteTextWrapper: React.CSSProperties = {
  padding: 12,
  borderRadius: 12,
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  color: "#334155",
  fontSize: 13,
  lineHeight: "1.5",
  whiteSpace: "pre-wrap",
};

const miniAddBtnStyle: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: 6,
  backgroundColor: "hsl(245, 75%, 96%)",
  color: "hsl(245, 75%, 50%)",
  fontSize: 11,
  fontWeight: "bold",
  border: "none",
  cursor: "pointer",
};

const medRemoveBtnStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 8,
  backgroundColor: "hsl(14, 90%, 96%)",
  color: "hsl(14, 90%, 50%)",
  fontSize: 12,
  border: "none",
  cursor: "pointer",
};

const historyCardStyle: React.CSSProperties = {
  padding: 14,
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
  padding: "4px 10px",
  borderRadius: 8,
  border: "1px solid hsl(245, 75%, 80%)",
  backgroundColor: "hsl(245, 75%, 96%)",
  color: "hsl(245, 75%, 55%)",
  fontSize: 12,
  fontWeight: "bold",
  cursor: "pointer",
};

const medTagStyle: React.CSSProperties = {
  padding: "2px 8px",
  borderRadius: 6,
  backgroundColor: "hsl(210, 100%, 95%)",
  color: "hsl(210, 100%, 30%)",
  fontSize: 11,
  fontWeight: "600",
};

const historyXrayThumbStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 6,
  overflow: "hidden",
  border: "1px solid #cbd5e1",
};
