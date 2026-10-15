import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import DoctorSummary from "@/models/DoctorSummary";
import { promises as fs } from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const patientId = url.searchParams.get("patientId");
    if (!patientId) return NextResponse.json([], { status: 200 });

    await connectDB();
    const summaries = await DoctorSummary.find({ patientId }).sort({ createdAt: -1 });

    // Ensure returned URLs point to existing public files when possible
    const publicDir = path.join(process.cwd(), "public");
    const fixed = await Promise.all(
      summaries.map(async (s: any) => {
        let urlPath = s.summaryImageUrl || "";

        // skip absolute URLs (http)
        if (!/^https?:\/\//i.test(urlPath)) {
          // normalize leading slash
          if (urlPath.startsWith("/")) urlPath = urlPath.slice(1);

          const fullPath = path.join(publicDir, urlPath);
          try {
            await fs.stat(fullPath);
            s.summaryImageUrl = `/${urlPath}`;
            return s;
          } catch {
            // try doctor-notes folder fallback
            const basename = path.basename(urlPath);
            const alt = path.join(publicDir, "doctor-notes", basename);
            try {
              await fs.stat(alt);
              s.summaryImageUrl = `/doctor-notes/${basename}`;
              return s;
            } catch {
              // try doctor-summaries folder
              const alt2 = path.join(publicDir, "doctor-summaries", basename);
              try {
                await fs.stat(alt2);
                s.summaryImageUrl = `/doctor-summaries/${basename}`;
                return s;
              } catch {
                // leave as-is; client will show broken link
                return s;
              }
            }
          }
        }

        return s;
      })
    );

    return NextResponse.json(fixed);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const patientId = String(form.get("patientId") || "");
    const file = form.get("file") as File | null;
    if (!patientId || !file) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save file to public/doctor-summaries so it can be served directly
    const uploadDir = path.join(process.cwd(), "public", "doctor-summaries");
    await fs.mkdir(uploadDir, { recursive: true });

    // Determine extension
    let ext = ".bin";
    const filenameRaw = (file as any).name || "";
    if (filenameRaw) {
      ext = path.extname(filenameRaw) || ext;
    } else if (file.type) {
      const parts = String(file.type).split("/");
      if (parts[1]) ext = `.${parts[1]}`;
    }

    const filename = `${patientId}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/doctor-summaries/${filename}`;

    await connectDB();
    const created = await DoctorSummary.create({ patientId, summaryImageUrl: publicUrl });

    return NextResponse.json(created);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
