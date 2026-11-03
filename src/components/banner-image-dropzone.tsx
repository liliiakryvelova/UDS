"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import Image from "next/image";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface BannerImageDropzoneProps {
  initialValue?: string;
  name?: string;
}

export default function BannerImageDropzone({
  initialValue = "",
  name = "bannerImageUrl",
}: BannerImageDropzoneProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageValue, setImageValue] = useState(initialValue);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  function loadImage(file?: File) {
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be 2 MB or smaller.");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageValue(reader.result);
      } else {
        setError("Could not read this image. Please try another file.");
      }
    };
    reader.onerror = () => setError("Could not read this image. Please try another file.");
    reader.readAsDataURL(file);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    loadImage(event.dataTransfer.files[0]);
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex min-h-36 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed px-5 py-4 text-center transition focus-within:ring-4 focus-within:ring-sky-200 ${
          isDragging
            ? "border-sky-600 bg-sky-100"
            : "border-sky-300 bg-white hover:border-sky-500 hover:bg-sky-50"
        }`}
      >
        {imageValue ? (
          <Image
            src={imageValue}
            alt="Banner image preview"
            width={1200}
            height={480}
            unoptimized
            className="max-h-40 w-full rounded-lg object-cover"
          />
        ) : (
          <>
            <span aria-hidden="true" className="mb-2 text-3xl text-sky-700">↑</span>
            <span className="font-medium text-slate-800">Drag and drop an image here</span>
            <span className="mt-1 text-sm text-slate-500">or click to browse · JPG, PNG, WebP · up to 2 MB</span>
          </>
        )}
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => loadImage(event.currentTarget.files?.[0])}
        />
      </label>

      <input type="hidden" name={name} value={imageValue} />

      {imageValue ? (
        <button
          type="button"
          onClick={() => {
            setImageValue("");
            setError("");
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          className="text-sm font-medium text-sky-800 underline underline-offset-2"
        >
          Remove banner image
        </button>
      ) : null}

      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}