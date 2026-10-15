import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DoctorSummary from "@/models/DoctorSummary";
import fs from "fs";
import path from "path";

// Folder to store uploaded doctor notes
const UPLOAD_DIR = path.join(process.cwd(), "public", "doctor-notes");

// Ensure the folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function POST(req: Request) {
  try {
    await connectDB();

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const patientId = formData.get("patientId") as string | null;

    if (!file || !patientId) {
      return NextResponse.json({ error: "Patient ID and file are required" }, { status: 400 });
    }

    // Save file to disk
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    // Build public URL
    const summaryImageUrl = `/doctor-notes/${fileName}`;

    // Save to DB
    const doc = await DoctorSummary.create({ patientId, summaryImageUrl });

    return NextResponse.json(doc);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to upload doctor summary" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID required" }, { status: 400 });
    }

    const summaries = await DoctorSummary.find({ patientId }).sort({ createdAt: -1 });

    return NextResponse.json(summaries);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch doctor summaries" }, { status: 500 });
  }
}
