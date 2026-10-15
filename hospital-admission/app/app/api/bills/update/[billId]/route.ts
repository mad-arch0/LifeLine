import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Bill from "@/models/Bill";

export async function PATCH(req: Request, context : { params: { billId: string } }) {
  await connectDB();
  
  const { billId } = await context.params;

  try {
    const { paid } = await req.json();
    const bill = await Bill.findByIdAndUpdate(billId, { paid }, { new: true });
    if (!bill) return NextResponse.json({ error: "Bill not found" }, { status: 404 });

    return NextResponse.json(bill);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update bill" }, { status: 500 });
  }
}
