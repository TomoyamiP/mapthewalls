import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[10000] flex justify-between items-center
                    bg-zinc-900/85 backdrop-blur-md border-b border-zinc-800
                    text-zinc-100 p-3 shadow-none">
      <Link
        to="/"
        className="logo-text text-3xl font-marker tracking-wide ml-3"
      >
        Map The Walls
      </Link>
      <div className="flex gap-4">
        <Link to="/" className="hover:text-white/90">Explore</Link>
        <Link to="/gallery" className="hover:text-white/90">Gallery</Link>
        {/* Open About as modal by passing background location */}
        <Link
          to="/about"
          state={{ backgroundLocation: location }}
          className="hover:text-white/90"
        >
          About
        </Link>
      </div>
    </nav>
  );
}
