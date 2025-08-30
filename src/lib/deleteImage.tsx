import { readIndex, writeIndex, UPLOAD_DIR } from "./db";
import fse from "fs-extra";
import path from "path";

const deleteImage = async (id: string) => {
  const idx = await readIndex();
  const rec = idx.find((r) => r.id === id);
  if (!rec) return false;
  const updated = idx.filter((r) => r.id !== id);
  await writeIndex(updated);

  // remove file
  const filePath = path.join(UPLOAD_DIR, rec.filename);
  if (await fse.pathExists(filePath)) await fse.remove(filePath);
  return true;
};

export { deleteImage };
