import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Patient from "@/models/patient";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
        patientId, name, address, aadhar, phone, bloodGroup, allergies,
        emergencyContact, fingerprintUrl, referredBy, roomType, roomNo, wardNo, dischargeSummary
    } = body;



    if (!patientId || !name || !address || !aadhar || !phone) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    await connectDB();

    // Check for existing Patient
    const existing = await Patient.findOne({ patientId });
    if (existing) return NextResponse.json({ error: "Patient ID exists" }, { status: 409 });

    // ✅ Create patient using all fields
    const patient = await Patient.create({
        patientId, name, address, aadhar, phone, bloodGroup, allergies,
        emergencyContact, fingerprintUrl, status: "admitted",
        referredBy, roomType, roomNo, wardNo,dischargeSummary
    });


    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json({ error: "Failed to register patient" }, { status: 500 });
  }
}
