// src/components/NavBar.tsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("admin") === "true";
  });

  // Keep state in sync with localStorage on first load
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("admin") === "true";
    if (stored !== isAdmin) setIsAdmin(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Secret multi-click on logo: 5 clicks within 3 seconds toggles admin
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState<number | null>(null);

  function handleLogoClick() {
    const now = Date.now();

    // If last click was more than 3 seconds ago, reset
    if (!lastClickTime || now - lastClickTime > 3000) {
      setClickCount(1);
      setLastClickTime(now);
      return;
    }

    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    setLastClickTime(now);

    if (nextCount >= 5) {
      const next = !isAdmin;
      setIsAdmin(next);
      if (typeof window !== "undefined") {
        localStorage.setItem("admin", String(next));
      }
      // Reset the counter so it doesn't keep toggling
      setClickCount(0);
      setLastClickTime(null);
    }
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[10000] flex justify-between items-center
                 bg-zinc-900/85 backdrop-blur-md border-b border-zinc-800
                 text-zinc-100 p-3 shadow-none"
    >
      <div className="flex items-center gap-2">
        <Link
          to="/"
          onClick={(e) => {
            // Normal navigation to home
            // plus secret admin toggle via multi-click
            handleLogoClick();
          }}
          className="logo-text text-3xl font-marker tracking-wide ml-3 select-none"
        >
          Map The Walls
        </Link>
        {isAdmin && (
          <div className="px-2 py-1 text-xs text-red-400 border border-red-400/40 rounded">
            ADMIN
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Link to="/" className="hover:text-white/90">
          Explore
        </Link>
        <Link to="/gallery" className="hover:text-white/90">
          Gallery
        </Link>
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
