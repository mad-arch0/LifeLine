import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  req: Request,
  context: { params: { filename: string } }
) {
  try {
    const params = await context.params;
    const filename = params.filename;

    // Check local folder first
    let filePath = path.join(process.cwd(), "public", "xrays", filename);
    let fileExists = false;
    try {
      await fs.stat(filePath);
      fileExists = true;
    } catch {
      // Sibling fallback
      filePath = path.join(
        process.cwd(),
        "..",
        "..",
        "hospital-admission",
        "app",
        "public",
        "xrays",
        filename
      );
      try {
        await fs.stat(filePath);
        fileExists = true;
      } catch {}
    }

    if (!fileExists) {
      return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);

    // Determine content type
    let contentType = "application/octet-stream";
    const ext = path.extname(filename).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".pdf") contentType = "application/pdf";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (err) {
    console.error(err);
    return new NextResponse("Server error", { status: 500 });
  }
}
