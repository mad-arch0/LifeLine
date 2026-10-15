import mongoose, { Schema, models } from "mongoose";

const PatientSchema = new Schema(
  {
    patientId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    aadhar: { type: String, required: true },
    phone: { type: String, required: true },
    bloodGroup: { type: String },
    allergies: { type: String },
    emergencyContact: { type: String },
    fingerprintUrl: { type: String }, // base64 image
    status: { type: String, enum: ["admitted", "discharged"], default: "discharged" },
    referredBy: { type: String },          // Doctor's name
    roomType: { type: String },            // Super Deluxe, Deluxe, Normal, Ward
    roomNo: { type: String },
    dischargeSummary: { type: String }, 
  },
  { timestamps: true }
);

export default models.Patient || mongoose.model("Patient", PatientSchema);
