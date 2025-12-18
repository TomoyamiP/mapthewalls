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
        <Route path="/" element={<Explore dimControls={!!backgroundLocation} />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/spots/:id" element={<SpotDetail />} />

        {/* Fallback: full-page About when directly hitting /about or refreshing */}
        <Route
          path="/about"
          element={
            <div className="px-4 pt-[calc(5.5rem+env(safe-area-inset-top))] pb-6">
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
      {/* Full-height container so the scroll box matches the screen height */}
      <div className="w-full max-w-2xl mx-auto px-4 h-[100dvh]">
        {/* Offset content so it starts BELOW the fixed NavBar */}
        <div className="h-full overflow-y-auto overscroll-contain pr-1 pt-[calc(5.5rem+env(safe-area-inset-top))] pb-6">
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
