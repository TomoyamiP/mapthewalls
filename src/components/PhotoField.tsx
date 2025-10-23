// PhotoField.tsx — simple file input with live preview (object URL)
// Notes:
// - Accepts images only
// - Creates/revokes an object URL to avoid memory leaks
// - Returns the selected File via onChange so parent can store it (later)

import { useEffect, useRef, useState } from "react";
import { fileToDataURLWithHeicSupport } from "../lib/images";

type PhotoFieldProps = {
  label?: string;
  onChange?: (file: File | null) => void;
  initialFile?: File | null;
};

export default function PhotoField({ label = "Photo", onChange, initialFile = null }: PhotoFieldProps) {
  const [file, setFile] = useState<File | null>(initialFile);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Create/revoke object URL for live preview
useEffect(() => {
  let revokeUrl: string | null = null;

  async function makePreview() {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    // If HEIC/HEIF, convert to JPEG and preview the data URL
    const isHeic = /image\/(heic|heif)/i.test(file.type) || /\.(heic|heif)$/i.test(file.name || "");
    if (isHeic) {
      try {
        const dataUrl = await fileToDataURLWithHeicSupport(file);
        setPreviewUrl(dataUrl); // data URL → nothing to revoke
        return;
      } catch {
        setPreviewUrl(null);
        return;
      }
    }

    // Non-HEIC images → use fast object URL preview
    const url = URL.createObjectURL(file);
    revokeUrl = url;
    setPreviewUrl(url);
  }

  makePreview();

  return () => {
    if (revokeUrl) URL.revokeObjectURL(revokeUrl);
  };
}, [file]);

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    onChange?.(f);
  }

  return (
    <div className="space-y-2">
      <label className="text-sm text-zinc-300">{label}</label>

      {/* Drop zone style label triggers the hidden input */}
      <div
        className="rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800/60 transition p-4 cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        {!previewUrl ? (
          <div className="text-sm text-zinc-400">
            Click to choose a photo (JPG/PNG). Max ~5–10MB recommended.
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
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 text-xs border border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
            onClick={() => {
              setFile(null);
              onChange?.(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            Remove
          </button>
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 text-xs border border-zinc-700 bg-zinc-100 text-zinc-900 hover:bg-white"
            onClick={() => inputRef.current?.click()}
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
}
