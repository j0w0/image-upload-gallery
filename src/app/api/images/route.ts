import { ensureReady, getUploadPaths } from "@/lib/db";
import { getImages } from "@/lib/getImages";
import { type NextRequest } from "next/server";
import path from "path";
import fse from "fs-extra";
import { uploadImage } from "@/lib/uploadImage";
import { deleteImage } from "@/lib/deleteImage";

// read/list and search
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const searchQuery = searchParams.get("search") ?? "";
  const uploadedImages = await getImages(searchQuery);

  return Response.json({
    images: uploadedImages,
  });
}

// create/upload
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as globalThis.File;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // validate file type
    const allowed = new Set([
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ]);

    if (!allowed.has(file.type)) {
      return Response.json(
        { error: "Only image uploads are allowed" },
        { status: 415 }
      );
    }

    // get file extension
    const ext = file.name ? path.extname(file.name) : "";
    const base = file.name ? path.basename(file.name, ext) : "image";
    const safeBase = base.replace(/[^a-z0-9-_\. ]/gi, "").trim() || "image";
    const stamp = Date.now();
    const filename = `${safeBase}-${stamp}${ext}`;

    // get upload paths
    const { filePath, publicUrl } = getUploadPaths(filename);

    // ensure upload directory exists
    await ensureReady();

    // convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fse.writeFile(filePath, buffer);

    // save to "database"
    const rec = await uploadImage(safeBase, filename);

    return Response.json({ ...rec, url: publicUrl }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}

// delete
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("delete") ?? "";

  const ok = await deleteImage(id);
  if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ status: 204 });
}
