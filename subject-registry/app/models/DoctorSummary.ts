import mongoose, { Schema, model, models } from "mongoose";

const DoctorSummarySchema = new Schema(
  {
    patientId: { type: String, required: true },
    summaryImageUrl: { type: String, required: true },
  },
  { timestamps: true }
);

// ⚡ Avoid recompiling model on hot reload in Next.js
const DoctorSummary = models.DoctorSummary || model("DoctorSummary", DoctorSummarySchema);

export default DoctorSummary;
