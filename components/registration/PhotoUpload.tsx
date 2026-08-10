"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, ImageIcon, X, RefreshCw } from "lucide-react";

interface PhotoUploadProps {
  preview: string | null;
  onFileSelected: (file: File, preview: string) => void;
  onClear: () => void;
  uploading?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB raw
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function PhotoUpload({
  preview,
  onFileSelected,
  onClear,
  uploading = false,
}: PhotoUploadProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const [compressing, setCompressing] = useState(false);

  const handleFile = async (file: File) => {
    setError(undefined);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please select a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setCompressing(true);
    try {
      // Dynamic import to keep bundle small
      const imageCompression = (await import("browser-image-compression")).default;
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: "image/jpeg",
      });

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onFileSelected(compressed as File, dataUrl);
      };
      reader.readAsDataURL(compressed);
    } catch {
      setError("Failed to process image. Please try again.");
    } finally {
      setCompressing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  if (preview) {
    return (
      <div className="space-y-3">
        <div className="relative w-32 h-32 mx-auto">
          <Image
            src={preview}
            alt="Profile photo preview"
            fill
            className="object-cover rounded-2xl border-4 border-blue-100 shadow-md"
          />
          <button
            onClick={onClear}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
            aria-label="Remove photo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => galleryInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 text-blue-600 font-medium text-sm py-2"
        >
          <RefreshCw className="w-4 h-4" />
          Change Photo
        </button>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Upload buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={compressing || uploading}
          className="flex flex-col items-center justify-center gap-2 p-5 bg-blue-50 border-2 border-blue-200 border-dashed rounded-2xl active:scale-95 transition-all disabled:opacity-50"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Camera className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-blue-700">Take Photo</span>
          <span className="text-xs text-blue-500 text-center">Use camera</span>
        </button>

        <button
          onClick={() => galleryInputRef.current?.click()}
          disabled={compressing || uploading}
          className="flex flex-col items-center justify-center gap-2 p-5 bg-slate-50 border-2 border-slate-200 border-dashed rounded-2xl active:scale-95 transition-all disabled:opacity-50"
        >
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-slate-600" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Gallery</span>
          <span className="text-xs text-slate-500 text-center">Choose file</span>
        </button>
      </div>

      {compressing && (
        <p className="text-center text-sm text-blue-600 font-medium">
          Processing image…
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      <p className="text-xs text-slate-400 text-center">
        JPG, PNG or WebP · Max 5MB
      </p>
    </div>
  );
}
