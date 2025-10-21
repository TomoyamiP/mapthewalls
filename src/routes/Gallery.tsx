import { Link } from "react-router-dom";

export default function Gallery() {
  // TEMP: fake items to prove navigation. Real items will come from localStorage.
  const fake = Array.from({ length: 8 }).map((_, i) => ({
    id: `demo-${i + 1}`,
    title: `Demo Spot ${i + 1}`,
    thumb: `https://picsum.photos/seed/graff${i}/400/300`,
  }));

  return (
    <main className="min-h-screen bg-black text-zinc-100 p-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Showcase</h1>
        <Link to="/" className="text-sm underline text-zinc-300 hover:text-zinc-100">
          Explore map
        </Link>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {fake.map((s) => (
          <Link key={s.id} to={`/spots/${s.id}`} className="group">
            <div className="aspect-[4/3] overflow-hidden rounded-xl border border-zinc-800">
              <img
                src={s.thumb}
                alt={s.title}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            </div>
            <div className="mt-2 text-xs text-zinc-400 group-hover:text-zinc-200">
              {s.title}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
