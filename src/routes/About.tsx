// src/routes/About.tsx
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  const handleClose = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-zinc-900/85 backdrop-blur-md rounded-2xl shadow-2xl text-zinc-100 relative">
      {/* Close (×) button in red */}
      <button
        onClick={handleClose}
        aria-label="Close About"
        className="absolute top-3 right-4 text-2xl text-red-500 hover:text-red-400"
      >
        ×
      </button>

      <h1 className="text-2xl font-semibold mb-4">A Record of What’s Already Fading</h1>

      <p className="mb-3 leading-relaxed">
        <strong>Map The Walls</strong> is a living record of graffiti and street art
        spotted across Tokyo and beyond. The city’s walls, tunnels, and back alleys
        are constantly changing — tags fade, new pieces go up, whole buildings
        disappear overnight. This app tries to keep track of that movement before it’s gone.
      </p>

      <p className="mb-6 leading-relaxed">
        The project started as a way to mix tech and curiosity — to notice what’s around us,
        to map it, and to give credit to the people keeping visual culture alive outside
        of galleries. Each marker represents a photo someone took when they stopped and looked twice.
      </p>

      {/* ---------- Minimal instructions section ---------- */}
      <div className="mt-4 space-y-2">
        <h2 className="text-sm uppercase tracking-wide text-zinc-400">How to use</h2>
        <ul className="text-sm text-zinc-300 space-y-1">
          <li>• Tap the camera icon to add a new graffiti photo (Explore)</li>
          <li>• Spots save locally and stay anonymous</li>
          <li>• Tap any pin to open details</li>
          <li>• Rate pieces 1–5 stars and/or vote “buff it / frame it”</li>
        </ul>
      </div>

      <p className="text-zinc-100 mt-8 leading-relaxed">
        Built by{" "}
        <a
          href="https://github.com/TomoyamiP"
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-500 hover:text-red-400 no-underline"
        >
          TomoyamiP
        </a>{" "}
        in Tokyo — this project aims to document art that exists in public space: raw,
        temporary, and sometimes gone by the next day.
      </p>
    </div>
  );
}
