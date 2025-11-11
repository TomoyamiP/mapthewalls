// src/components/PhotoField.tsx
// - Handles HEIC → JPEG
// - Resizes + iteratively compresses to <= 1 MB
// - Uploads to Supabase
// - Keeps preview after upload (does NOT clear file on success)
// - Legacy onChange(file) + new onUploaded(url) + onUploadedPath(path)

import { useEffect, useRef, useState } from "react";
import { fileToDataURLWithHeicSupport } from "../lib/images";
import { uploadToSupabase } from "../lib/upload";

type PhotoFieldProps = {
  label?: string;
  onChange?: (file: File | null) => void;          // legacy: parent may expect File
  onUploaded?: (url: string | null) => void;       // Supabase public URL
  onUploadedPath?: (path: string | null) => void;  // Supabase object path (for admin delete)
  initialFile?: File | null;
};

// dataURL -> Blob
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return await res.blob();
}

// Resize + iteratively compress to <= maxBytes using createImageBitmap + canvas
async function compressUnder(
  sourceBlob: Blob,
  maxBytes = 1_000_000,
  maxW = 1600,
  maxH = 1600
): Promise<Blob> {
  const bitmap = await createImageBitmap(sourceBlob);
  const scale = Math.min(maxW / bitmap.width, maxH / bitmap.height, 1);
  const w = Math.max(1, Math.floor(bitmap.width * scale));
  const h = Math.max(1, Math.floor(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);

  const qualities = [0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5];
  let last: Blob | null = null;
  for (const q of qualities) {
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", q)
    );
    last = blob;
    if (blob.size <= maxBytes) return blob;
  }
  return last!;
}

export default function PhotoField({
  label = "Photo",
  onChange,
  onUploaded,
  onUploadedPath,
  initialFile = null,
}: PhotoFieldProps) {
  const [file, setFile] = useState<File | null>(initialFile);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Live preview (object URL for non-HEIC, dataURL for HEIC)
  useEffect(() => {
    let revokeUrl: string | null = null;

    async function makePreview() {
      if (!file) {
        setPreviewUrl(null);
        return;
      }

      const isHeic =
        /image\/(heic|heif)/i.test(file.type) ||
        /\.(heic|heif)$/i.test(file.name || "");

      if (isHeic) {
        try {
          const dataUrl = await fileToDataURLWithHeicSupport(file);
          setPreviewUrl(dataUrl);
          return;
        } catch {
          setPreviewUrl(null);
          return;
        }
      }

      const url = URL.createObjectURL(file);
      revokeUrl = url;
      setPreviewUrl(url);
    }

    makePreview();
    return () => {
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [file]);

  // Pick -> (HEIC convert) -> resize+compress -> upload
  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;

    // Keep legacy behavior (parent wanting the File)
    setFile(f);
    onChange?.(f);

    setUploading(true);
    try {
      // 1) Normalize to a browser-decodable JPEG blob
      const isHeic =
        /image\/(heic|heif)/i.test(f.type) ||
        /\.(heic|heif)$/i.test(f.name || "");
      let blob: Blob;
      if (isHeic) {
        const dataUrl = await fileToDataURLWithHeicSupport(f); // -> JPEG dataURL
        blob = await dataUrlToBlob(dataUrl);                   // -> JPEG Blob
      } else {
        blob = f;
      }

      // 2) Resize + compress to <= 1 MB
      const compressed = await compressUnder(blob, 1_000_000, 1600, 1600);
      if (compressed.size > 1_000_000) {
        throw new Error(
          `Could not compress under 1 MB (got ${(compressed.size / 1024 / 1024).toFixed(2)} MB)`
        );
      }

      // 3) Upload as a proper JPEG File (keeps preview; do NOT clear file/input)
      const finalFile = new File(
        [compressed],
        (f.name || "photo").replace(/\.\w+$/, "") + ".jpg",
        { type: "image/jpeg" }
      );

      const { publicUrl, path } = await uploadToSupabase(finalFile);
      console.log("Uploaded to Supabase:", publicUrl, "(path:", path, ")");

      onUploaded?.(publicUrl);       // tell parent the URL to save
      onUploadedPath?.(path);        // tell parent the storage path (for admin delete)

      // ✅ Do NOT clear file/input here — keep preview visible

    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Upload failed");
      onUploaded?.(null);
      onUploadedPath?.(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm text-zinc-300">{label}</label>

      <div
        className="rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800/60 transition p-4 cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        {!previewUrl ? (
          <div className="text-sm text-zinc-400">
            Click to choose a photo (JPG/PNG/HEIC). Max ~1 MB.
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-24 w-24 object-cover rounded-lg border border-zinc-700"
            />
            <div className="text-xs text-zinc-400 break-all">
              {file?.name ?? "Selected image"}
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePick}
      />

      {file && (
        <div className="flex gap-2 items-center">
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 text-xs border border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
            onClick={() => {
              // Manual clear if user presses Remove
              setFile(null);
              onChange?.(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            disabled={uploading}
          >
            Remove
          </button>
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 text-xs border border-zinc-700 bg-zinc-100 text-zinc-900 hover:bg-white"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            Change
          </button>
          {uploading && <span className="text-xs text-zinc-400">Uploading…</span>}
        </div>
      )}
    </div>
  );
}
