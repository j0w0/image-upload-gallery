import fse from "fs-extra";
import path from "path";

export type ImageRecord = {
  id: string;
  name: string;
  filename: string;
  url: string;
  createdAt: string;
};

const ROOT = process.cwd();
const UPLOAD_DIR = path.join(ROOT, "public", "uploads");
const INDEX_FILE = path.join(UPLOAD_DIR, "index.json");

async function ensureReady() {
  await fse.ensureDir(UPLOAD_DIR);
  if (!(await fse.pathExists(INDEX_FILE))) {
    await fse.writeJSON(INDEX_FILE, [] as ImageRecord[], { spaces: 2 });
  }
}

async function readIndex(): Promise<ImageRecord[]> {
  await ensureReady();
  return fse.readJSON(INDEX_FILE);
}

async function writeIndex(records: ImageRecord[]) {
  await fse.writeJSON(INDEX_FILE, records, { spaces: 2 });
}

function getUploadPaths(newName: string) {
  const filePath = path.join(UPLOAD_DIR, newName);
  const publicUrl = `/uploads/${newName}`;
  return { filePath, publicUrl };
}

export { UPLOAD_DIR, ensureReady, readIndex, writeIndex, getUploadPaths };
