import MapView from "../components/MapView";
import { Link } from "react-router-dom";

export default function Explore() {
  return (
    <div className="relative h-screen w-screen">
      <MapView />
      {/* TEMP: simple top-left nav to check routing */}
      <div className="absolute top-4 left-4 bg-zinc-900/80 text-zinc-100 rounded-lg px-3 py-2 text-sm space-x-3">
        <Link to="/gallery" className="underline">Gallery</Link>
      </div>
      <button
        aria-label="Add graffiti"
        className="fixed z-[10000] bottom-20 right-6 h-14 w-14 rounded-full text-2xl
                   bg-zinc-900/90 hover:bg-zinc-800 text-zinc-50 shadow-xl
                   border border-zinc-700/60 transition"
        onClick={() => alert("Add Graffiti — coming next ✨")}
      >
        +
      </button>
    </div>
  );
}
