// src/App.tsx
import MapView from "./components/MapView";

export default function App() {
  return (
    // Wrapper to create a stacking context and fill the viewport
    <div className="relative h-screen w-screen">
      <MapView />

      {/* Floating "Add Graffiti" button (FAB) */}
      <button
        aria-label="Add graffiti"
        // Very high z-index + ensure it can be clicked even over the map.
        className="fixed z-[10000] bottom-20 right-6 h-14 w-14 rounded-full text-2xl
                   bg-zinc-900/90 hover:bg-zinc-800 text-zinc-50 shadow-xl
                   border border-zinc-700/60 transition
                   pointer-events-auto"
        onClick={() => alert("Add Graffiti — coming next ✨")}
      >
        +
      </button>
    </div>
  );
}
