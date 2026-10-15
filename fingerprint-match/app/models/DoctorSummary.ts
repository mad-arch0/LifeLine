import mongoose, { Schema, model, models } from "mongoose";

const DoctorSummarySchema = new Schema(
  {
    patientId: { type: String, required: true },
    summaryImageUrl: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

const DoctorSummary = models.DoctorSummary || model("DoctorSummary", DoctorSummarySchema);

export default DoctorSummary;
