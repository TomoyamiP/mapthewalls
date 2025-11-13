// src/routes/Landing.tsx
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <NavBar />

      <main className="max-w-5xl mx-auto px-4 pt-28 pb-16 flex flex-col gap-10 md:flex-row md:items-center">
        {/* Left: hero copy */}
        <section className="md:w-3/5 space-y-5">
          <p className="text-[11px] tracking-[0.2em] uppercase text-zinc-400">
            A living archive of Tokyo graffiti
          </p>

          <h1 className="text-4xl md:text-5xl font-marker leading-tight drop-shadow-[0_0_20px_rgba(0,0,0,0.7)]">
            Map The Walls
          </h1>

          <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
            Map The Walls lets you pin graffiti and street art around Tokyo —
            add photos, rate pieces, and see what&apos;s already been buffed or
            still riding. Photos live in Supabase storage; spots stay lightweight
            in your browser so it feels fast and local.
          </p>

          <ul className="text-sm text-zinc-300 space-y-2">
            <li>• Drop pins for new pieces you find in the city.</li>
            <li>• Rate walls from 1–5 stars and vote &ldquo;buff it&rdquo; or &ldquo;frame it&rdquo;.</li>
            <li>• Browse a gallery of spots and zoom into each location.</li>
          </ul>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium
                         bg-cyan-500 text-zinc-950 hover:bg-cyan-400
                         border border-cyan-400/60 shadow-lg shadow-cyan-500/20"
            >
              Enter the map
            </Link>

            <Link
              to="/about"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium
                         border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800/80 text-zinc-100"
            >
              Read about the project
            </Link>
          </div>
        </section>

        {/* Right: visual card / preview */}
        <section className="md:w-2/5 mt-6 md:mt-0">
          <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br
                          from-zinc-900/90 via-zinc-900/60 to-zinc-800/80
                          p-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
            <div
              className="aspect-[4/3] rounded-2xl border border-zinc-700/60
                         bg-[radial-gradient(circle_at_top,_#fecaca33,_transparent_55%),radial-gradient(circle_at_bottom,_#22d3ee33,_transparent_55%)]
                         flex items-center justify-center"
            >
              <div className="text-center px-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 mb-2">
                  Preview
                </p>
                <p className="text-sm text-zinc-100">
                  Zoomable map with clustered pins and a gallery of walls you&apos;ve
                  logged — tuned for wandering Tokyo backstreets and tunnels.
                </p>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-zinc-500">
              Built by TomoyamiP as a personal project to document street art
              before it disappears.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
