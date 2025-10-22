import { useState } from "react";
import MapView from "../components/MapView";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import PhotoField from "../components/PhotoField";

export default function Explore() {
  const [open, setOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null); // store selected image (for later save)

  return (
    <div className="relative h-screen w-screen">
      <MapView />

      {/* Top-left nav (fixed + above map) */}
      <div
        className="fixed z-[10000] top-4 left-4 pointer-events-auto
                   bg-zinc-900/80 text-zinc-100 rounded-lg px-3 py-2 text-sm"
      >
        <Link to="/gallery" className="underline hover:text-white">
          Gallery
        </Link>
      </div>

      {/* Floating Add Graffiti button */}
      <button
        aria-label="Add graffiti"
        className="fixed z-[10000] bottom-20 right-6 h-14 w-14 rounded-full text-2xl
                   bg-zinc-900/90 hover:bg-zinc-800 text-zinc-50 shadow-xl
                   border border-zinc-700/60 transition"
        onClick={() => setOpen(true)}
      >
        +
      </button>

      {/* Add Graffiti modal (with photo preview, title/desc placeholders) */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Graffiti">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Next step: save to localStorage + place pin");
          }}
        >
          <PhotoField label="Photo" onChange={setPhotoFile} />

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Title</label>
            <input
              type="text"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
              placeholder="e.g., Shibuya mural near the station"
              name="title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Description (optional)</label>
            <textarea
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
              Save (coming soon)
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
