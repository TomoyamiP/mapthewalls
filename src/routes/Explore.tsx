import { useEffect, useState } from "react";
import MapView from "../components/MapView";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import PhotoField from "../components/PhotoField";
import type { GraffitiSpot } from "../types";
import { loadSpots, addSpot } from "../lib/storage";
import { getPosition } from "../lib/geo";
import { fileToDataURLWithHeicSupport, compressToJpegDataURL } from "../lib/images";

export default function Explore() {
  const [open, setOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [spots, setSpots] = useState<GraffitiSpot[]>([]);

  // form fields (uncontrolled inputs are fine, but this is simplest to read/validate)
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  // Load existing spots once
  useEffect(() => {
    setSpots(loadSpots());
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Basic validation
    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

  let photoUrl: string | undefined;
  if (photoFile) {
    try {
      const raw = await fileToDataURLWithHeicSupport(photoFile); // handles HEIC → JPEG
      photoUrl = await compressToJpegDataURL(raw, 1280, 1280, 0.75); // shrink + compress
    } catch {
      alert("Could not read/convert the selected photo.");
      return;
    }
  }

    // Get location (geolocation or fallback)
    const pos = await getPosition();

    // Build new spot
    const spot: GraffitiSpot = {
      id: (crypto?.randomUUID?.() ?? `${Date.now()}`),
      title: title.trim(),
      description: desc.trim() || undefined,
      photoUrl,
      lat: pos.lat,
      lng: pos.lng,
      createdAt: new Date().toISOString(),
    };

    try {
      // Persist + update UI
      addSpot(spot);
      setSpots((prev) => [...prev, spot]);

      // Reset + close
      setOpen(false);
      setPhotoFile(null);
      setTitle("");
      setDesc("");
    } catch (err) {
      console.error(err);
      alert(
        "Could not save — the image is too large for local storage.\n\n" +
        "Pick a smaller photo, or we can add automatic compression next."
      );
      // Keep the modal open so you can change the image without losing inputs
      return;
    }

    // (Optional) little confirmation
    // alert("Added! Check the map marker or the gallery.");
  }

  return (
    <div className="relative h-screen w-screen">
      <MapView spots={spots} />

      {/* Top-left nav (fixed above map) */}
      <div className="fixed z-[10000] top-4 left-4 pointer-events-auto bg-zinc-900/80 text-zinc-100 rounded-lg px-3 py-2 text-sm">
        <Link to="/gallery" className="underline hover:text-white">
          Gallery
        </Link>
      </div>

      {/* Floating Add button */}
      <button
        aria-label="Add graffiti"
        className="fixed z-[10000] bottom-20 right-6 h-14 w-14 rounded-full text-2xl
                   bg-zinc-900/90 hover:bg-zinc-800 text-zinc-50 shadow-xl
                   border border-zinc-700/60 transition"
        onClick={() => setOpen(true)}
      >
        +
      </button>

      {/* Add Graffiti modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Graffiti">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <PhotoField label="Photo" onChange={setPhotoFile} />

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
              placeholder="e.g., Shibuya mural near the station"
              name="title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Description (optional)</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
              placeholder="Anything notable about the piece?"
              name="desc"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-xl px-3 py-2 border border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl px-3 py-2 border border-zinc-700 bg-zinc-100 text-zinc-900 hover:bg-white"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
