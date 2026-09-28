// components/BombBossPanels.jsx
import React, { useEffect, useRef } from "react";

export function BombLeftPanel({ currentPhrase }) {
  return (
    <div className="w-72 h-72 rounded-2xl flex items-center justify-center bg-[#0a0a0a] border-2 border-gameYellow relative">
      <h2 className="absolute top-6 text-lg text-gameYellow font-black uppercase tracking-widest">
        Required Phrase
      </h2>

      <div
        key={currentPhrase}
        className="animate-modalIn text-7xl font-black text-white uppercase tracking-widest"
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

  // Use a ref to hold the latest callback. This prevents the interval
  // from restarting every time the parent component re-renders.
  const onTimeUpRef = useRef(onTimeUp);
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    // Only run when actively playing
    if (gameState !== "playing") return;

    const interval = setInterval(() => {
      setBombTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, setBombTimeLeft]);

  const percentage = (bombTimeLeft / BOMB_TIME) * 100;
  const isDanger = bombTimeLeft <= 15;

  return (
    <div className="w-72 h-72 rounded-2xl flex items-center justify-center bg-[#0a0a0a] border-2 border-gameRed relative">
      <h2 className="absolute top-6 text-lg font-black uppercase tracking-widest text-gameRed">
        Bomb Detonates In
      </h2>

      <span
        className={`text-8xl font-black font-mono tracking-tighter ${isDanger ? "animate-pulse text-gameRed" : "text-white"}`}
      >
        {bombTimeLeft}<small>s</small>
      </span>

      {/* Flat, simple linear progress bar with solid track color */}
      <div className="absolute bottom-6 w-full px-6">
        <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className="h-full bg-gameRed rounded-full transition-[width] duration-1000 ease-linear"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
