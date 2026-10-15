import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AdmissionRecord from "@/models/AdmissionRecord";

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
