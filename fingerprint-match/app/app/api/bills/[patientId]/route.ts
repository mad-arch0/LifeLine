import { NextResponse } from "next/server";

// Temporary placeholder API for bills. Returns empty list and accepts DELETE cleanup.
export async function GET(_req: Request, { params }: { params: { patientId: string } }) {
  try {
    // TODO: implement bill storage
    return NextResponse.json([]);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { patientId: string } }) {
  try {
    // TODO: delete unpaid bills if any. For now, return success.
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
