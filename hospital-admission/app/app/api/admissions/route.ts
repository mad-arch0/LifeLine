import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AdmissionRecord from "@/models/AdmissionRecord";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      patientId,
      hospitalName,
      referredBy,
      roomType,
      roomNo,
      doctorNote,
      medications,
    } = body;

    if (!patientId || !hospitalName) {
      return NextResponse.json(
        { error: "Patient ID and Hospital Name are required" },
        { status: 400 }
      );
    }

    const record = await AdmissionRecord.create({
      patientId,
      hospitalName,
      referredBy,
      roomType,
      roomNo,
      doctorNote,
      medications: medications || [],
      xrayFileUrls: [],
      status: "admitted",
      admissionDate: new Date(),
    });

    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    console.error("CREATE ADMISSION ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create admission record" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID required" },
        { status: 400 }
      );
    }

    const records = await AdmissionRecord.find({ patientId }).sort({
      createdAt: -1,
    });
    return NextResponse.json(records);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch admission records" },
      { status: 500 }
    );
  }
}
