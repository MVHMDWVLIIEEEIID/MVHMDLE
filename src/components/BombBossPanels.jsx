// components/BombBossPanels.jsx
import React, { useEffect } from "react";

export function BombLeftPanel({ currentPhrase }) {
  return (
    <div className="w-72 h-72 rounded-lg flex flex-col justify-center items-center bg-[#0a0a0a] border-2 border-gameYellow p-6 relative">
      <h2 className="absolute top-8 text-center text-gameYellow font-black uppercase tracking-widest text-lg">
        Required Phrase
      </h2>

      <div
        key={currentPhrase}
        className="animate-modalIn text-6xl font-black text-gameLight uppercase tracking-widest"
      >
        {currentPhrase}
      </div>
    </div>
  );
}

export function BombRightPanel({
  gameState,
  bombTimeLeft,
  setBombTimeLeft,
  onTimeUp,
}) {
  const BOMB_TIME = 60; // 60 seconds

  useEffect(() => {
    if (gameState !== "playing" || bombTimeLeft <= 0) return;

    const interval = setInterval(() => {
      setBombTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, onTimeUp, setBombTimeLeft, bombTimeLeft]);

  const percentage = (bombTimeLeft / BOMB_TIME) * 100;

  return (
    <div className="w-72 h-72 rounded-lg flex flex-col justify-center items-center bg-[#0a0a0a] border-2 border-gameRed p-6">
      <h2 className="text-center text-gameRed font-black uppercase tracking-widest text-lg mb-6">
        Bomb Defusal
      </h2>

      <div
        className="radial-progress bg-gameRed/10 text-gameRed transition-all duration-300"
        style={{
          "--value": Math.max(1, percentage),
          "--size": "8rem",
          "--thickness": "0.75rem",
        }}
        role="progressbar"
      >
        <span className="countdown font-mono text-4xl text-white">
          <span style={{ "--value": bombTimeLeft }}></span>
        </span>
      </div>
    </div>
  );
}
