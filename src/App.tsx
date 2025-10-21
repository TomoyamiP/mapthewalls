import { BrowserRouter, Routes, Route } from "react-router-dom";
import Explore from "./routes/Explore";
import Gallery from "./routes/Gallery";
import SpotDetail from "./routes/SpotDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Explore />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/spots/:id" element={<SpotDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
