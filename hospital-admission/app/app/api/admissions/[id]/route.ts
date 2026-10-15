import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AdmissionRecord from "@/models/AdmissionRecord";

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = await context.params;
    const record = await AdmissionRecord.findById(id);

    if (!record) {
      return NextResponse.json(
        { error: "Admission record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch admission record" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = await context.params;
    const updates = await req.json();

    const record = await AdmissionRecord.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!record) {
      return NextResponse.json(
        { error: "Admission record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update admission record" },
      { status: 500 }
    );
  }
}
