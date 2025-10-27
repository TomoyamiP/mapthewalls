// src/components/NavBar.tsx
import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <header
      className="fixed top-0 left-0 w-full z-[10000] bg-zinc-900/80 backdrop-blur-md
                 border-b border-zinc-800 text-zinc-100"
    >
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
        <Link to="/" className="font-medium tracking-wide text-sm text-zinc-100 hover:text-white">
          MapTheWalls
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/gallery" className="hover:text-cyan-400 transition">
            Gallery
          </Link>
          <Link to="/about" className="hover:text-cyan-400 transition">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
