import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Patient from "@/models/patient";

export async function GET(req: Request, context: { params: any }) {
  try {
    await connectDB();

    const { patientId } = await context.params;

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID not provided" },
        { status: 400 }
      );
    }

    const patient = await Patient.findOne({ patientId });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("FETCH PATIENT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, context: { params: { patientId: string } }) {
  await connectDB();
  const { patientId } = await context.params;

  try {
    const updates = await req.json(); // { status, referredBy, roomType, roomNo, wardNo }

    const updatedPatient = await Patient.findOneAndUpdate(
      { patientId }, // query by custom patientId
      updates,
      { new: true }
    );

    if (!updatedPatient)
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    return NextResponse.json(updatedPatient);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 });
  }
}
