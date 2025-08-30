import { ensureReady, readIndex } from "./db";

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

export { getImages };
