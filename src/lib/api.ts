import { ImageRecord } from "./db";

interface ImagesResponse {
  images: ImageRecord[];
}

// fetch images with optional search query
const fetchImages = async (searchQuery?: string): Promise<ImageRecord[]> => {
  const url = `/api/images${
    searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""
  }`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch images: ${response.statusText}`);
  }

  const data: ImagesResponse = await response.json();
  return data.images;
};

// upload an image file
const uploadImage = async (file: File): Promise<void> => {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch("/api/images", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${errorText}`);
  }
};

// delete an image by id
const deleteImage = async (id: string): Promise<void> => {
  const response = await fetch(`/api/images?delete=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Delete failed: ${response.statusText}`);
  }
};

export { fetchImages, uploadImage, deleteImage };
export type { ImagesResponse };
