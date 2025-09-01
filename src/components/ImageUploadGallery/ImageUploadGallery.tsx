"use client";

import {
  ChangeEvent,
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ImageRecord } from "@/lib/db";
import { fetchImages, uploadImage, deleteImage } from "@/lib/api";
import Image from "next/image";

import "./ImageUploadGallery.css";

const ImageUploadGallery: FunctionComponent = () => {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const refreshImages = useCallback(async (query: string = "") => {
    try {
      const images = await fetchImages(query);
      setImages(images);
    } catch (error) {
      console.error("Failed to fetch images:", error);
      alert("Failed to load images");
    }
  }, []);

  useEffect(() => {
    refreshImages();
  }, [refreshImages]);

  const handleSearchChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchQuery(value);
      await refreshImages(value);
    },
    [refreshImages]
  );

  const handleUploadClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed");
        event.target.value = "";
        return;
      }

      try {
        setUploading(true);
        await uploadImage(file);
        await refreshImages(searchQuery);
        if (inputRef.current) inputRef.current.value = "";
      } catch (error) {
        console.error("Upload error:", error);
        alert("Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [refreshImages, searchQuery]
  );

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this image?")) return;

    try {
      await deleteImage(id);
      setImages((imgs) => imgs.filter((i) => i.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete failed");
    }
  }, []);

  return (
    <div className="image-upload-gallery">
      <div className="image-upload-gallery__header">
        <div>
          <label>
            <input
              type="search"
              className="input p-3 rounded border border-gray-400"
              placeholder="Search by file name..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search images by file name"
            />
          </label>
        </div>
        <div>
          <label>
            {uploading ? (
              "Uploading..."
            ) : (
              <button
                className="bg-gray-200 p-3 rounded cursor-pointer"
                onClick={handleUploadClick}
              >
                Upload image
              </button>
            )}
            <input
              ref={inputRef}
              type="file"
              id="upload"
              name="upload"
              accept="image/*"
              onChange={handleUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      <div className="image-upload-gallery__list">
        <div className="count">{images.length} images</div>
        <div className="images">
          {images.length > 0 ? (
            <>
              {images.map((image, idx) => {
                return (
                  <div key={idx} className="gallery-card">
                    <div className="card-image">
                      <Image
                        src={image.url}
                        alt={image.name}
                        width={200}
                        height={200}
                        priority={true}
                      />
                    </div>
                    <div className="card-details">
                      <div>{image.name}</div>
                      <button
                        className="text-red-700 cursor-pointer"
                        onClick={() => handleDelete(image.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div>
              No images yet! Upload an image by clicking on the button in the
              top right.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { ImageUploadGallery };
