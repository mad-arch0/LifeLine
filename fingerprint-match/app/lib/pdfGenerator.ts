import jsPDF from "jspdf";

export const generateAdmissionPDF = (patient: any, record: any) => {
  const doc = new jsPDF();
  let y = 20;

  // Title
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("LifeLine Admission Record", 105, y, { align: "center" });
  
  y += 15;

  // Hospital Info
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175); // blue-800
  doc.text(`Hospital: ${record.hospitalName}`, 20, y);
  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105); // slate-600
  const adminDate = new Date(record.admissionDate).toLocaleString();
  const discDate = record.dischargeDate ? new Date(record.dischargeDate).toLocaleString() : "Active";
  doc.text(`Admission Date: ${adminDate}`, 20, y);
  doc.text(`Discharge Date: ${discDate}`, 120, y);
  y += 8;
  doc.text(`Attending Doctor: ${record.referredBy || "N/A"}`, 20, y);
  doc.text(`Room: ${record.roomType || ""} ${record.roomNo || ""}`, 120, y);
  y += 15;

  // Patient Info
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Subject Information", 20, y);
  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(`Subject ID: ${patient.patientId}`, 20, y);
  doc.text(`Name: ${patient.name}`, 120, y);
  y += 6;
  doc.text(`Blood Group: ${patient.bloodGroup || "N/A"}`, 20, y);
  doc.text(`Allergies: ${patient.allergies || "N/A"}`, 120, y);
  y += 15;

  // Doctor Note
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Doctor's Note", 20, y);
  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  const noteLines = doc.splitTextToSize(record.doctorNote || "No notes available.", 170);
  doc.text(noteLines, 20, y);
  y += (noteLines.length * 6) + 10;

  // Medications
  if (record.medications && record.medications.length > 0) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Prescribed Medications", 20, y);
    y += 8;
    
    // Table Header
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(30, 64, 175);
    doc.rect(20, y - 5, 170, 8, 'F');
    doc.text("Name", 22, y);
    doc.text("Dosage", 90, y);
    doc.text("Frequency", 140, y);
    y += 8;
    
    doc.setTextColor(71, 85, 105);
    record.medications.forEach((med: any) => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(med.name || "-", 22, y);
      doc.text(med.dosage || "-", 90, y);
      doc.text(med.frequency || "-", 140, y);
      doc.setDrawColor(226, 232, 240);
      doc.line(20, y + 2, 190, y + 2);
      y += 8;
    });
    y += 10;
  }

  // X-rays Note
  if (record.xrayFileUrls && record.xrayFileUrls.length > 0) {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setTextColor(30, 64, 175);
    doc.text(`Attached ${record.xrayFileUrls.length} X-ray image(s) to this record.`, 20, y);
    y += 10;
  }

  // Save PDF
  doc.save(`Lifeline_Record_${patient.patientId}_${new Date(record.admissionDate).getTime()}.pdf`);
};
