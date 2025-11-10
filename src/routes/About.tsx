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

      <h1 className="text-2xl font-semibold mb-4">About Map The Walls</h1>

      <p className="mb-3 leading-relaxed">
        <strong>Map The Walls</strong> is a living record of graffiti and street art
        spotted across Tokyo and beyond. The city’s walls, tunnels, and back alleys
        are constantly changing — tags fade, new pieces go up, whole buildings
        disappear overnight. This app tries to keep track of that movement before it’s gone.
      </p>

      <p className="mb-3 leading-relaxed">
        The project started as a way to mix tech and curiosity — to notice what’s around us,
        to map it, and to give credit to the people keeping visual culture alive outside
        of galleries. Each marker represents a photo someone took when they stopped and looked twice.
      </p>

      <p className="text-zinc-100 mt-4 leading-relaxed">
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
