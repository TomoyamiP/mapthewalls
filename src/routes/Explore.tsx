// src/routes/Explore.tsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Camera } from "lucide-react";

import MapView from "../components/MapView";
import NavBar from "../components/NavBar";
import Modal from "../components/Modal";
import PhotoField from "../components/PhotoField";

import type { GraffitiSpot } from "../types";
import { loadSpots, addSpot } from "../lib/storage";
import { getPosition } from "../lib/geo";
// ❌ removed: fileToDataURLWithHeicSupport, compressToTargetBytes
import { readGpsFromFile } from "../lib/exif";

export default function Explore() {
  const [params] = useSearchParams();
  const focusId = params.get("focus") || undefined;

  const [open, setOpen] = useState(false);

  // Keep the originally selected file ONLY for EXIF GPS (PhotoField may clear later)
  const [exifFile, setExifFile] = useState<File | null>(null);

  // Supabase public URL produced by PhotoField upload
  const [imageUrl, setImageUrl] = useState<string>("");

  const [spots, setSpots] = useState<GraffitiSpot[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  // Load existing spots once
  useEffect(() => {
    setSpots(loadSpots());
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    // Optional: require a photo
    if (!imageUrl) {
      const ok = confirm("No photo uploaded yet. Save without an image?");
      if (!ok) return;
    }

    // 1) Location first (prefer EXIF from the originally picked file, fallback to device)
    let pos = await (exifFile ? readGpsFromFile(exifFile) : null);
    if (!pos) {
      try {
        pos = await getPosition();
      } catch {
        alert("Could not get location. Please enable location or add a photo with GPS EXIF.");
        return;
      }
    }

    // 2) Build the spot (photoUrl now comes from Supabase)
    const spot: GraffitiSpot = {
      id: crypto.randomUUID?.() ?? `${Date.now()}`,
      title: title.trim(),
      description: desc.trim() || undefined,
      photoUrl: imageUrl || undefined,
      lat: pos.lat,
      lng: pos.lng,
      createdAt: new Date().toISOString(),
    };

    // 3) Persist + update UI
    try {
      addSpot(spot);
      setSpots((prev) => [...prev, spot]);

      // Reset form
      setOpen(false);
      setExifFile(null);
      setImageUrl("");
      setTitle("");
      setDesc("");
    } catch (err) {
      console.error(err);
      alert("Could not save. Please try again.");
      return;
    }
  }

  return (
    <div className="relative h-screen w-screen">
      <NavBar />
      <MapView spots={spots} focusId={focusId} />

      {/* Floating Add button with upward-fading tooltip */}
      <div className="fixed z-[10000] bottom-20 right-6 group">
        <button
          aria-label="Add graffiti"
          className="pointer-events-auto cursor-pointer select-none
                     flex items-center justify-center
                     h-16 w-16 rounded-full bg-zinc-900/90 hover:bg-zinc-800
                     border border-zinc-700/60 shadow-xl transition active:scale-95"
          onClick={() => setOpen(true)}
        >
          <Camera size={26} className="text-zinc-50" />
        </button>

        {/* Tooltip (fades + floats upward) */}
        <div
          className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2
                     bg-zinc-900/95 text-zinc-100 text-xs rounded-md
                     px-2 py-1 opacity-0 translate-y-1
                     group-hover:opacity-100 group-hover:translate-y-0
                     border border-zinc-700/60 shadow-md transition-all duration-300 ease-out
                     whitespace-nowrap"
        >
          Add Photo
        </div>
      </div>

      {/* Add Graffiti modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Graffiti">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Photo */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wide text-zinc-400">Photo</label>
            <PhotoField
              label="Upload photo"
              // Keep the first non-null file we see for EXIF (ignore later nulls)
              onChange={(file) => {
                if (file) setExifFile(file);
              }}
              // Get the Supabase public URL to save with the spot
              onUploaded={(url) => setImageUrl(url || "")}
            />
            <p className="text-[11px] text-zinc-500">
              HEIC is supported. Images are resized & compressed before upload.
            </p>
            {imageUrl && (
              <p className="text-[11px] text-emerald-400">
                Image uploaded ✓ (will be saved with this spot)
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wide text-zinc-400">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2
                         text-sm text-zinc-100 placeholder-zinc-500
                         focus:outline-none focus:ring-2 focus:ring-cyan-600/50 focus:border-cyan-600/40"
              placeholder="e.g., Shibuya mural near the station"
              name="title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wide text-zinc-400">Notes (optional)</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2
                         text-sm text-zinc-100 placeholder-zinc-500
                         focus:outline-none focus:ring-2 focus:ring-cyan-600/50 focus:border-cyan-600/40"
              placeholder="Details, artist, directions…"
              name="desc"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              className="rounded-xl px-3 py-2 text-sm border border-zinc-800 bg-zinc-800/70
                         text-zinc-200 hover:bg-zinc-700/70 transition"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl px-3.5 py-2 text-sm bg-cyan-500 text-zinc-900
                         hover:bg-cyan-400 border border-cyan-400/40 shadow-lg shadow-cyan-500/10
                         transition"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
