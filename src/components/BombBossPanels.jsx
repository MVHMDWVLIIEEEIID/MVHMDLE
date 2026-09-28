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
  isPaused = false,
}) {
  const BOMB_TIME = 60; // 60 seconds
  const TICK_KEY = "wordle-bomb-last-tick";

  const onTimeUpRef = useRef(onTimeUp);
  const hasDetonatedRef = useRef(false);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    // 1. Recover offline time (if any) BEFORE evaluating the pause state.
    // This ensures that if the tab was closed while the bomb was live,
    // we deduct that missing time the exact moment they load back in.
    const lastTick = localStorage.getItem(TICK_KEY);

    if (lastTick) {
      const elapsedSecs = Math.floor(
        (Date.now() - parseInt(lastTick, 10)) / 1000,
      );

      if (elapsedSecs > 0) {
        setBombTimeLeft((prev) => {
          const newTime = prev - elapsedSecs;
          // If the offline time drained the remaining time completely:
          if (newTime <= 0) {
            if (!hasDetonatedRef.current) {
              hasDetonatedRef.current = true;
              setTimeout(() => onTimeUpRef.current(), 0);
            }
            return 0;
          }
          return newTime;
        });
      }
    }

    // 2. Stop ticking if paused (e.g. Warning Modal is open) or the game is over.
    if (gameState !== "playing" || isPaused) {
      // Clear the tick key so that the time spent paused isn't subtracted when unpaused
      localStorage.removeItem(TICK_KEY);
      return;
    }

    // 3. Mark the exact start time of this active session
    localStorage.setItem(TICK_KEY, Date.now().toString());

    // 4. Run the secure interval
    const interval = setInterval(() => {
      // Constantly update the tracking tick so we know exactly when they left
      localStorage.setItem(TICK_KEY, Date.now().toString());

      setBombTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          localStorage.removeItem(TICK_KEY);

          if (!hasDetonatedRef.current) {
            hasDetonatedRef.current = true;
            onTimeUpRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, isPaused, setBombTimeLeft]);

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
        {bombTimeLeft}
        <small>s</small>
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
