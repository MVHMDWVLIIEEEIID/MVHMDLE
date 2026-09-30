// components/HistoryPanel.jsx
import React, { useState, useEffect } from "react";

export default function HistoryPanel({ history, currentGameCount, gameState }) {
  const [expanded, setExpanded] = useState({});
  // Track if we should render the playing block. Defaults to true if playing.
  const [showPlayingBlock, setShowPlayingBlock] = useState(
    gameState === "playing",
  );

  // Synchronize the playing block's disappearance with the 1.5s tile flip animation
  useEffect(() => {
    if (gameState === "playing") {
      setShowPlayingBlock(true);
    } else {
      // Game ended. Wait exactly 1500ms (RESULT_ANIMATION_MS) before dropping the
      // playing block so it perfectly swaps with the new WIN/LOSS block.
      const timer = setTimeout(() => {
        setShowPlayingBlock(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  const toggleExpand = (idx) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Auto-open the currently playing drawer when a new hint is bought
  useEffect(() => {
    if (history && history.length > 0) {
      const lastItem = history[history.length - 1];
      if (lastItem.type !== "game-marker") {
        setExpanded((prev) => ({ ...prev, [0]: true }));
      }
    }
  }, [history]);

  // 1. Group the flat history array into proper Game bundles
  const groups = [];
  let tempHints = [];

  (history || []).forEach((item) => {
    if (item.type === "game-marker") {
      groups.push({
        gameCount: item.gameCount,
        result: item.result,
        earned: item.earned || 0,
        gameType: item.gameType || "Normal",
        hints: tempHints,
      });
      tempHints = [];
    } else {
      tempHints.push(item);
    }
  });

  // 2. Append the active playing block based on our synchronized state
  if (showPlayingBlock) {
    groups.push({
      gameCount: currentGameCount || 1,
      result: "playing",
      earned: 0,
      gameType: "Normal",
      hints: tempHints,
    });
  }

  // Reverse so newest game is always on top
  const reversedGroups = [...groups].reverse();

  return (
    <div className="w-72 h-72 text-gameLight rounded-lg flex flex-col bg-[#0a0a0a] border-2 border-gameLight overflow-hidden font-sans">
      <header className="h-12 flex-none bg-gameLight px-4 flex justify-between items-center border-b-2 border-gameLight/30 z-10">
        <h2 className="text-xs font-black uppercase text-gameDark leading-none">
          History
        </h2>
      </header>
      <div className="flex-1 overflow-y-auto clean-scroll p-2 space-y-2">
        {reversedGroups.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/20 text-xs italic uppercase">
            No history yet
          </div>
        ) : (
          reversedGroups.map((group, idx) => {
            const isPlaying = group.result === "playing";
            const isWin = group.result === "won";
            const hasHints = group.hints.length > 0;
            const isExpanded =
              expanded[idx] !== undefined ? expanded[idx] : isPlaying;

            const headerColor = isPlaying
              ? "border-gameBlue/40 bg-gameBlue/10 text-gameBlue"
              : isWin
                ? "border-gameGreen/40 bg-gameGreen/10 text-gameGreen"
                : "border-gameRed/40 bg-gameRed/10 text-gameRed";

            const badgeClass = isPlaying
              ? "bg-gameBlue text-gameDark"
              : isWin
                ? "bg-gameGreen text-gameDark"
                : "bg-gameRed text-gameDark";

            const resultText = isPlaying ? "PLAYING" : isWin ? "WIN" : "LOSS";

            // Format Game Type (Hide if "Normal")
            const isNormal =
              !group.gameType || group.gameType.toLowerCase() === "normal";
            const displayGameType = isNormal ? "" : `(${group.gameType})`;

            return (
              <div key={idx} className="flex flex-col gap-1">
                {/* Accordion Trigger */}
                <button
                  onClick={() => hasHints && toggleExpand(idx)}
                  className={`flex flex-col w-full text-left p-3 rounded-lg border transition-colors duration-200 ${headerColor} ${hasHints ? "cursor-pointer hover:bg-white/5" : "cursor-default"}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-black uppercase flex items-center gap-1.5">
                      GAME {group.gameCount} {displayGameType}
                      {hasHints && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      {!isPlaying && group.earned > 0 && (
                        <span className="text-[10px] font-mono text-gameGreen font-bold">
                          +${group.earned.toLocaleString()}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}
                      >
                        {resultText}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Compressed Hints Drawer */}
                {hasHints && (
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0 mt-0"}`}
                  >
                    <div className="overflow-hidden flex flex-col gap-1.5 mx-1">
                      {group.hints.map((log, hIdx) => (
                        <div
                          key={hIdx}
                          className="bg-white/5 border-l-[3px] border-gameGreen p-2.5 rounded-r"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-gameGreen uppercase tracking-wider">
                              {log.name}
                            </span>
                            <span className="text-[10px] font-mono text-white/40 bg-white/5 px-1 rounded">
                              -${log.spent?.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-white/80 font-mono leading-tight">
                            {log.msg}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
