import MapView from "./components/MapView";

export default function App() {
  return (
    <div className="bg-red-500 p-4 text-white">
      Tailwind test bar — you should see a red strip here.
      <div className="relative">
        <MapView />
        <button
          aria-label="Add graffiti"
          className="fixed bottom-6 right-6 rounded-full h-14 w-14 text-2xl
                     bg-zinc-900/90 hover:bg-zinc-800 text-zinc-50 shadow-xl
                     border border-zinc-700/60 transition"
          onClick={() => alert("Add Graffiti — coming next ✨")}
        >
          +
        </button>
      </div>
    </div>
  );
}
