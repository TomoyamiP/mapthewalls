// src/routes/About.tsx
export default function About() {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-zinc-900/85 backdrop-blur-md rounded-2xl shadow-2xl text-zinc-100">
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

      <p className="leading-relaxed">
        Built by <strong>TomoyamiP</strong> in Tokyo, this project aims to document art that exists
        in public space: raw, temporary, and sometimes gone by the next day.
      </p>
    </div>
  );
}
