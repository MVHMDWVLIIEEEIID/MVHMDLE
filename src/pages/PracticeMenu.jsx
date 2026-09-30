// pages/PracticeMenu.jsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { BOSS_REGISTRY, MINI_BOSS_REGISTRY } from "../utils/bossConfig";
import Header from "../components/Header";
import PracticeShapeSelectorModal from "../components/PracticeShapeSelectorModal";

export default function PracticeMenu() {
  const navigate = useNavigate();
  const [isShapeModalOpen, setIsShapeModalOpen] = useState(false);

  const allBosses = [
    ...Object.values(MINI_BOSS_REGISTRY),
    ...Object.values(BOSS_REGISTRY),
  ];

  const handleSelectBoss = (bossId) => {
    if (bossId === "shapedle") {
      setIsShapeModalOpen(true);
    } else {
      navigate(`/practice/${bossId}`);
    }
  };

  return (
    <div className="flex flex-col h-screen relative overflow-hidden bg-gameDark text-white">
      {/* 1. Header Area: Exactly mimics Survival/Daily */}
      <div className="flex-1 center flex-col shrink-0">
        <Header
          mode="PRACTICE MENU"
          hideHearts={true}
          onModeClick={() => navigate("/")}
        />
      </div>

      {/* 2. Board Area: Exactly mimics GameBoardLayout's top half (flex-10) */}
      <div className="flex-14 flex justify-center items-center overflow-y-auto clean-scroll">
        <div className="max-w-5xl mx-auto flex flex-col items-center w-full">
          <h2 className="text-3xl font-black uppercase text-gameLight mb-8 text-center tracking-widest">
            Select A Boss
          </h2>

          <div className="flex flex-wrap justify-center gap-6 w-full max-w-4xl">
            {allBosses.map((boss) => (
              <button
                key={boss.id}
                onClick={() => handleSelectBoss(boss.id)}
                className="flex flex-col items-center justify-center p-8 bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-gameLight/50  rounded-2xl transition-all duration-300 active:scale-95 group w-full sm:w-[calc(50%-1.5rem)] md:w-[calc(33.333%-1.5rem)] min-w-[220px]"
              >
                <h3 className="text-2xl font-black text-gameLight uppercase tracking-wider text-center group-hover:scale-105 transition-transform duration-300">
                  {/* Because the IDs are clean now (duodle, fourdle), we can print them directly */}
                  {boss.id}
                </h3>
                <span className="text-sm font-bold text-white/50 uppercase tracking-widest group-hover:text-gameLight transition-colors">
                  {boss.category === "multi" ? "Multi-Word" : boss.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <PracticeShapeSelectorModal
        isOpen={isShapeModalOpen}
        onClose={() => setIsShapeModalOpen(false)}
        onSelect={(shapeId) => {
          setIsShapeModalOpen(false);
          // Redirect using new ID
          navigate(`/practice/shapedle/${shapeId}`);
        }}
      />
    </div>
  );
}
