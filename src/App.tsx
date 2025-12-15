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
      {/* Scroll container: keeps About readable on mobile */}
      <div className="w-full max-w-2xl mx-auto px-4 py-4">
        <div className="max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain pr-1">
          <About />
        </div>
      </div>
      {/* Removed the "Back to map" link */}
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
