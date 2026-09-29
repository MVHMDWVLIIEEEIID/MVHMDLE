// components/RapidlePanels.jsx
import React, { useEffect, useRef } from "react";

export function RapidleLeftPanel({ guessesCount }) {
  return (
    <div className="w-72 h-72 rounded-2xl flex items-center justify-center bg-[#0a0a0a] border-2 border-gameBlue relative">
      <h2 className="absolute top-6 text-lg text-gameBlue font-black uppercase tracking-widest">
        Words Typed
      </h2>
      <div
        key={guessesCount}
        className="animate-modalIn text-8xl font-black text-white uppercase tracking-widest"
      >
        {guessesCount}
      </div>
    </div>
  );
}

export function RapidleRightPanel({
  gameState,
  rapidleTimeLeft,
  setRapidleTimeLeft,
  onTimeUp,
  isPaused = false,
}) {
  const RAPIDLE_TIME = 10; // 10 seconds
  const TICK_KEY = "wordle-rapidle-last-tick";
  const onTimeUpRef = useRef(onTimeUp);
  const hasEndedRef = useRef(false);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    const lastTick = localStorage.getItem(TICK_KEY);

    if (lastTick) {
      const elapsedSecs = Math.floor(
        (Date.now() - parseInt(lastTick, 10)) / 1000,
      );

      if (elapsedSecs > 0) {
        setRapidleTimeLeft((prev) => {
          const newTime = prev - elapsedSecs;
          if (newTime <= 0) {
            if (!hasEndedRef.current) {
              hasEndedRef.current = true;
              setTimeout(() => onTimeUpRef.current(), 0);
            }
            return 0;
          }
          return newTime;
        });
      }
    }

    if (gameState !== "playing" || isPaused) {
      localStorage.removeItem(TICK_KEY);
      return;
    }

    localStorage.setItem(TICK_KEY, Date.now().toString());

    const interval = setInterval(() => {
      localStorage.setItem(TICK_KEY, Date.now().toString());

      setRapidleTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          localStorage.removeItem(TICK_KEY);
          if (!hasEndedRef.current) {
            hasEndedRef.current = true;
            onTimeUpRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, isPaused, setRapidleTimeLeft]);

  const percentage = (rapidleTimeLeft / RAPIDLE_TIME) * 100;
  const isDanger = rapidleTimeLeft <= 3;

  return (
    <div className="w-72 h-72 rounded-2xl flex items-center justify-center bg-[#0a0a0a] border-2 border-gameBlue relative">
      <h2 className="absolute top-6 text-lg font-black uppercase tracking-widest text-gameBlue">
        Time Remaining
      </h2>

      <span
        className={`text-8xl font-black font-mono tracking-tighter ${
          isDanger ? "animate-pulse text-gameRed" : "text-white"
        }`}
      >
        {rapidleTimeLeft}
        <small>s</small>
      </span>

      <div className="absolute bottom-6 w-full px-6">
        <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${isDanger ? "bg-gameRed" : "bg-gameBlue"}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
