import { Routes, Route } from "react-router";
import Menu from "./pages/Menu";
import Daily from "./pages/Daily";
import Survival from "./pages/Survival";
import MobileBlocker from "./components/MobileBlocker"; // Import
import Wordle500 from "./pages/Wordle500";

export default function App() {
  return (
    <MobileBlocker>
      <Routes>
        <Route index element={<Menu />} />
        <Route path="/daily" element={<Daily />} />
        <Route path="/survival" element={<Survival />} />
        <Route path="/wordle500" element={<Wordle500 />} />
      </Routes>
    </MobileBlocker>
  );
}
