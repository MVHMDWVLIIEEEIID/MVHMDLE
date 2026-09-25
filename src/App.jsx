import { Routes, Route } from "react-router";
import Menu from "./pages/Menu";
import Daily from "./pages/Daily";
import Survival from "./pages/Survival";
import MobileBlocker from "./components/MobileBlocker"; // Import

export default function App() {
  return (
    <MobileBlocker>
      <Routes>
        <Route index element={<Menu />} />
        <Route path="/daily" element={<Daily />} />
        <Route path="/survival" element={<Survival />} />
      </Routes>
    </MobileBlocker>
  );
}
