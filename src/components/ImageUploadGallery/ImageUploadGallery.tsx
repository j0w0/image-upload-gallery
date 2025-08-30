"use client";

import {
  ChangeEvent,
  FunctionComponent,
  useEffect,
  useRef,
  useState,
} from "react";
import { ImageRecord } from "@/lib/db";
import Image from "next/image";

import "./ImageUploadGallery.css";

const ImageUploadGallery: FunctionComponent = () => {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>();
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function refresh(query: string = "") {
    const res = await fetch(
      `/api/images${query ? `?search=${encodeURIComponent(query)}` : ""}`
    );
    const data: { images: ImageRecord[] } = await res.json();
    setImages(data.images);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onSearchChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setSearchQuery(value);
    await refresh(value);
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed");
      event.target.value = "";
      return;
    }

    try {
      const form = new FormData();
      form.append("file", file);
      setUploading(true);

      const res = await fetch("/api/images", {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error(await res.text());
      await refresh(searchQuery);
      if (inputRef.current) inputRef.current.value = "";
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this image?")) return;

    try {
      const res = await fetch(`/api/images/?delete=${id}`, {
        method: "DELETE",
      });

      if (res.ok) setImages((imgs) => imgs.filter((i) => i.id !== id));
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  }

  return (
    <div className="image-upload-gallery">
      <div className="image-upload-gallery__header">
        <div>
          <label>
            <input
              className="input"
              placeholder="Search by file name..."
              value={searchQuery}
              onChange={onSearchChange}
              aria-label="Search images by file name"
            />
          </label>
        </div>
        <div>
          <label>
            {uploading ? (
              "Uploading..."
            ) : (
              <div
                role="button"
                className="bg-slate-200 p-3 rounded cursor-pointer"
              >
                Upload image
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
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
