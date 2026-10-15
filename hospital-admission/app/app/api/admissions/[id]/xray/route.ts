import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AdmissionRecord from "@/models/AdmissionRecord";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "xrays");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = await context.params;

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const urls: string[] = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(UPLOAD_DIR, fileName);
      const arrayBuffer = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
      urls.push(`/xrays/${fileName}`);
    }

    const record = await AdmissionRecord.findByIdAndUpdate(
      id,
      { $push: { xrayFileUrls: { $each: urls } } },
      { new: true }
    );

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
      { error: "Failed to upload X-ray files" },
      { status: 500 }
    );
  }
}
