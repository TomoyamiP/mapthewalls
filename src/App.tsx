// src/App.tsx
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Explore from "./routes/Explore";
import Archive from "./routes/Archive";
import SpotDetail from "./routes/SpotDetail";
import About from "./routes/About";
import Modal from "./components/Modal";
import NavBar from "./components/NavBar";

function AppRoutes() {
  const location = useLocation() as typeof useLocation & {
    state?: { backgroundLocation?: Location };
  };
  const backgroundLocation = location.state && location.state.backgroundLocation;

  return (
    <>
      {/* Main content; if we came via modal state, keep showing the background route */}
      <Routes location={backgroundLocation || location}>
        <Route
          path="/"
          element={<Explore dimControls={!!backgroundLocation} />}
        />
        <Route path="/archive" element={<Archive />} />
        <Route path="/spots/:id" element={<SpotDetail />} />
        {/* Fallback: full-page About when directly hitting /about or refreshing */}
        <Route
          path="/about"
          element={
            <div className="pt-16 px-4"> {/* offset for fixed NavBar */}
              <About />
            </div>
          }
        />
        <Route path="*" element={<Explore />} />
      </Routes>

      {/* Modal layer when navigated with backgroundLocation */}
      {backgroundLocation && <AboutModal />}
    </>
  );
}

function AboutModal() {
  const navigate = useNavigate();

  return (
    <Modal open={true} onClose={() => navigate(-1)}>
      {/* Centered modal content */}
      <div className="w-full max-w-3xl mx-auto px-4 pt-6 pb-4">
        {/* Scrollable area (mobile-safe, dark-mode friendly) */}
        <div
          className="
            max-h-[calc(100dvh-9rem)]
            overflow-y-auto
            overscroll-contain
            pr-2
            scrollbar-thin
            scrollbar-thumb-zinc-700
            scrollbar-track-zinc-900
          "
        >
          <About />
        </div>
      </div>
    </Modal>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* NavBar is global so it shows on all routes, including direct /about */}
      <NavBar />
      <AppRoutes />
    </BrowserRouter>
  );
}
