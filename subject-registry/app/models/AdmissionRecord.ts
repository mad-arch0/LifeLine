import mongoose, { Schema, models } from "mongoose";

const MedicationSchema = new Schema({
  name: { type: String, required: true },
  dosage: { type: String },
  frequency: { type: String },
});

const AdmissionRecordSchema = new Schema(
  {
    patientId: { type: String, required: true },
    hospitalName: { type: String, required: true },
    admissionDate: { type: Date, default: Date.now },
    dischargeDate: { type: Date },
    referredBy: { type: String },
    roomType: { type: String },
    roomNo: { type: String },
    doctorNote: { type: String },
    medications: [MedicationSchema],
    xrayFileUrls: [{ type: String }],
    doctorSummaryUrl: { type: String },
    status: {
      type: String,
      enum: ["admitted", "discharged"],
      default: "admitted",
    },
  },
  { timestamps: true }
);

export default models.AdmissionRecord ||
  mongoose.model("AdmissionRecord", AdmissionRecordSchema);
