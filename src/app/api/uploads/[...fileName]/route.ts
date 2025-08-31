import { NextRequest } from "next/server";
import path from "path";
import fse from "fs-extra";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fileName: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filename = resolvedParams.fileName.join("/");
    const filePath = path.join(process.cwd(), "public", "uploads", filename);

    // check if file exists
    if (!(await fse.pathExists(filePath))) {
      return new Response("File not found", { status: 404 });
    }

    // read file
    const fileBuffer = await fse.readFile(filePath);

    // determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const contentType =
      {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
      }[ext] || "application/octet-stream";

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
