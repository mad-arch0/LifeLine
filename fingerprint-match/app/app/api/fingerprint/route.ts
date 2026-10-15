import { NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import Patient from "@/models/Patient";
import DoctorSummary from "@/models/DoctorSummary";

export async function POST(req: Request) {
  try {
    const { fingerprint } = await req.json();
    if (!fingerprint) {
      return NextResponse.json({ error: "Fingerprint required" }, { status: 400 });
    }

    await connectDB();

    // TEMPORARY DEMO MATCH (exact base64 match)
    const patient = await Patient.findOne({ fingerprintUrl: fingerprint });

    if (!patient) {
      return NextResponse.json({ error: "No patient found" }, { status: 404 });
    }

    // fetch doctor summaries from separate collection (use lean() for plain JS objects)
    const summaries = await DoctorSummary.find({ patientId: patient.patientId })
      .sort({ createdAt: -1 })
      .lean();

    const serializedSummaries = (summaries || []).map((s: any) => ({
      _id: s._id.toString(),
      patientId: s.patientId,
      summaryImageUrl: s.summaryImageUrl,
      notes: s.notes || "",
      createdAt: s.createdAt ? s.createdAt.toISOString() : null,
      updatedAt: s.updatedAt ? s.updatedAt.toISOString() : null,
    }));

    return NextResponse.json({
      patient: {
        _id: patient._id.toString(),
        patientId: patient.patientId,
        name: patient.name,
        phone: patient.phone,
        address: patient.address,
        bloodGroup: patient.bloodGroup,
        allergies: patient.allergies,
        emergencyContact: patient.emergencyContact,
        aadhar: patient.aadhar,
        status: patient.status,
        referredBy: patient.referredBy,
        roomType: patient.roomType,
        roomNo: patient.roomNo,
        dischargeSummary: patient.dischargeSummary,
        doctorSummaries: serializedSummaries,
        fingerprintUrl: patient.fingerprintUrl,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
