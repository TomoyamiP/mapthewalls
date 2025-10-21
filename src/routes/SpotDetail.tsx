import { Link, useParams } from "react-router-dom";

export default function SpotDetail() {
  const { id } = useParams();

  // TEMP: demo image; later we’ll load real spot by id from localStorage/API
  const img = `https://picsum.photos/seed/${id}/1200/900`;

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <header className="p-4 flex items-center justify-between">
        <Link to="/gallery" className="text-sm underline text-zinc-300 hover:text-zinc-100">
          ← Back to gallery
        </Link>
        <div className="text-sm text-zinc-400">Spot ID: {id}</div>
      </header>

      <section className="px-4 md:px-6">
        <div className="rounded-2xl overflow-hidden border border-zinc-800">
          <img src={img} alt={`Spot ${id}`} className="w-full h-auto object-cover" />
        </div>

        {/* Rating + meta */}
        <div className="mt-4 flex items-center gap-4">
          <button className="rounded-xl px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700">
            ★ Rate
          </button>
          <div className="text-sm text-zinc-400">0 ratings • 0.0 avg</div>
        </div>

        {/* Mini map placeholder (we'll wire react-leaflet next) */}
        <div className="mt-6">
          <h2 className="text-sm text-zinc-400 mb-2">Location</h2>
          <div className="h-64 w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 flex items-center justify-center text-zinc-500">
            Mini-map goes here
          </div>
        </div>
      </section>
    </main>
  );
}
