import { ImageRecord } from "./db";
import { v4 as uuid } from "uuid";
import { readIndex, writeIndex } from "./db";

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

export { uploadImage };
