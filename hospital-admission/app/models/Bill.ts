import mongoose, { Schema, models } from "mongoose";

const BillSchema = new Schema(
  {
    patientId: { type: String, required: true }, // link to patient
    amount: { type: Number, required: true },
    billType: {type: String, required:true},
    paid: { type: Boolean, default: false },
    billFileUrl: { type: String }, // optional uploaded file (base64 or URL)
  },
  { timestamps: true } // automatically creates createdAt (date/time)
);

export default models.Bill || mongoose.model("Bill", BillSchema);
