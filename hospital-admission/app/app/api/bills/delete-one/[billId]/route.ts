import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Bill from "@/models/Bill";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ billId: string }> }
) {
  try {
    await connectDB();

    // ✅ THIS IS THE FIX
    const { billId } = await context.params;

    if (!billId) {
      return NextResponse.json(
        { error: "Bill ID required" },
        { status: 400 }
      );
    }

    const deletedBill = await Bill.findByIdAndDelete(billId);

    if (!deletedBill) {
      return NextResponse.json(
        { error: "Bill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete bill" },
      { status: 500 }
    );
  }
}
