import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Bill from "@/models/Bill";

export async function POST(req: Request, context: { params: { patientId: string } }) {
  await connectDB();

  // Unwrap params
  const { patientId } = await context.params; // <-- add await

  try {
    const { amount,billType, billFileUrl } = await req.json();
    if (!amount) return NextResponse.json({ error: "Amount is required" }, { status: 400 });

    const bill = await Bill.create({
      patientId, // now safe
      amount,
      billType,
      billFileUrl,
      paid: false,
    });

    return NextResponse.json(bill, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create bill" }, { status: 500 });
  }
}

export async function GET(req: Request, context: { params: { patientId: string } }) {
  await connectDB();

  // Unwrap params
  const { patientId } = await context.params; 

  try {
    const bills = await Bill.find({ patientId }).sort({ createdAt: -1 });
    return NextResponse.json(bills);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: { patientId: string } }) {
  await connectDB();

  try {
    const { patientId } = await context.params;
    
    if (!patientId) return NextResponse.json({ error: "Patient ID required" }, { status: 400 });

    await Bill.deleteMany({patientId}); // delete all bills
    return NextResponse.json({ message: "Bills deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete bills" }, { status: 500 });
  }
}
