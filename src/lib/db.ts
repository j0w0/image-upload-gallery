import fse from "fs-extra";
import path from "path";
import { v4 as uuid } from "uuid";

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

const ensureReady = async () => {
  await fse.ensureDir(UPLOAD_DIR);
  if (!(await fse.pathExists(INDEX_FILE))) {
    await fse.writeJSON(INDEX_FILE, [] as ImageRecord[], { spaces: 2 });
  }
};

const readIndex = async (): Promise<ImageRecord[]> => {
  await ensureReady();
  return fse.readJSON(INDEX_FILE);
};

const writeIndex = async (records: ImageRecord[]) => {
  await fse.writeJSON(INDEX_FILE, records, { spaces: 2 });
};

const getUploadPaths = (newName: string) => {
  const filePath = path.join(UPLOAD_DIR, newName);
  const publicUrl = `/uploads/${newName}`;
  return { filePath, publicUrl };
};

const getImages = async (query: string) => {
  await ensureReady();
  return await (query ? searchImages(query) : readIndex());
};

const searchImages = async (query: string) => {
  const idx = await readIndex();
  const term = query.trim().toLowerCase();
  if (!term) return idx;
  return idx.filter((r) => r.name.toLowerCase().includes(term));
};

const uploadImage = async (
  name: string,
  filename: string
): Promise<ImageRecord> => {
  const rec: ImageRecord = {
    id: uuid(),
    name,
    filename,
    url: `/uploads/${filename}`,
    createdAt: new Date().toISOString(),
  };
  const idx = await readIndex();
  idx.unshift(rec);
  await writeIndex(idx);
  return rec;
};

const deleteImage = async (id: string) => {
  const idx = await readIndex();
  const rec = idx.find((r) => r.id === id);
  if (!rec) return false;
  const updated = idx.filter((r) => r.id !== id);
  await writeIndex(updated);

  const filePath = path.join(UPLOAD_DIR, rec.filename);
  if (await fse.pathExists(filePath)) await fse.remove(filePath);
  return true;
};

export {
  UPLOAD_DIR,
  ensureReady,
  readIndex,
  writeIndex,
  getUploadPaths,
  getImages,
  uploadImage,
  deleteImage,
};
