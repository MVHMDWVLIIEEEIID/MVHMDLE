// App.jsx
import { useEffect } from "react";
import { Routes, Route } from "react-router";
import Menu from "./pages/Menu";
import Daily from "./pages/Daily";
import Survival from "./pages/Survival";
import PracticeMenu from "./pages/PracticeMenu";
import PracticeGame from "./pages/PracticeGame";
import MobileBlocker from "./components/MobileBlocker";
import ParticleOverlay from "./components/ParticleOverlay";

export default function App() {
  // Hard Wipe Logic: Instantly clears everything and restarts the app for the new update
  useEffect(() => {
    const CURRENT_VERSION = "2.0.0-final";
    const savedVersion = localStorage.getItem("mvhmdle-app-version");
    if (savedVersion !== CURRENT_VERSION) {
      localStorage.clear();
      localStorage.setItem("mvhmdle-app-version", CURRENT_VERSION);
      window.location.reload();
    }
  }, []);

  return (
    <MobileBlocker>
      <ParticleOverlay />
      <Routes>
        <Route index element={<Menu />} />
        <Route path="/daily" element={<Daily />} />
        <Route path="/survival" element={<Survival />} />
        <Route path="/practice" element={<PracticeMenu />} />
        <Route path="/practice/:bossId" element={<PracticeGame />} />
        <Route path="/practice/:bossId/:subId" element={<PracticeGame />} />
      </Routes>
    </MobileBlocker>
  );
}
