// components/Shop.jsx
import React from "react";

const HIDE_A_LETTER_STEP = 250;
const HEART_STEP = 25000;

const STANDARD_HINT_SCALING = {
  "Vowel Letter": { perBuyStep: 0.15, maxMultiplier: 3.0 },
  "Yellow Letter": { perBuyStep: 0.15, maxMultiplier: 3.0 },
  "Green Letter": { perBuyStep: 0.2, maxMultiplier: 3.5 },
  Row: { perBuyStep: 0.25, maxMultiplier: 3.0 },
};

const getScaledHintPrice = (baseCost, totalBought, scaling) => {
  if (!scaling) return baseCost;
  const scaled = Math.floor(baseCost * (1 + totalBought * scaling.perBuyStep));
  const capped = Math.floor(baseCost * scaling.maxMultiplier);
  return Math.min(scaled, capped);
};

export default function Shop({
  currency,
  hearts = 0,
  hintsArray,
  onBuyHint,
  hintsUsedInRound = {},
  gameState,
  isModalOpen,
}) {
  const MAX_HEARTS = 5;

  return (
    <div className="flex-1 w-full text-gameLight flex flex-col font-sans overflow-y-auto clean-scroll pr-1 pb-1">
      {Object.entries(hintsArray).map(([name, data]) => {
        const usedCount = hintsUsedInRound[name] || 0;
        const totalBought = data.bought || 0;
        let currentPrice;

        // --- PRICING LOGIC ---
        if (name === "Hide a Letter") {
          currentPrice = data.cost + usedCount * HIDE_A_LETTER_STEP;
        } else if (name === "Heart") {
          currentPrice = data.cost + totalBought * HEART_STEP;
        } else if (name === "Beat The Game") {
          currentPrice = data.cost;
        } else {
          currentPrice = getScaledHintPrice(
            data.cost,
            totalBought,
            STANDARD_HINT_SCALING[name],
          );
        }

        const canAfford = currency >= currentPrice;
        const isRoundOver = gameState !== "playing" || isModalOpen;

        let isLocked = false;
        if (name === "Hide a Letter") {
          isLocked = usedCount >= 5;
        } else if (name === "Heart") {
          isLocked = usedCount >= 1 || hearts >= MAX_HEARTS;
        } else if (
          ["Green Letter", "Yellow Letter", "Vowel Letter", "Row"].includes(
            name,
          )
        ) {
          isLocked = usedCount >= 1;
        }

        const isDisabled = !canAfford || isLocked || isRoundOver;

        return (
          <button
            key={name}
            onClick={() => onBuyHint(name, currentPrice)}
            disabled={isDisabled}
            className={`group w-full border-b border-white/5 px-2 py-2 transition-all duration-200 flex flex-row items-center justify-between min-h-[3.5rem] relative
              ${!isDisabled ? "hover:bg-white/5 active:bg-white/10 cursor-pointer rounded-xl" : "opacity-30 cursor-not-allowed"}
            `}
          >
            {/* Highlight Bar */}
            {!isDisabled && (
              <div className="absolute left-0 top-2 bottom-2 w-1 bg-gameLight scale-y-0 group-hover:scale-y-100 transition-transform duration-200 rounded-full" />
            )}

            {/* LEFT SIDE: Name & Description */}
            <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0 mr-2 ml-1.5">
              <span
                className={`text-xs font-black uppercase tracking-wider truncate w-full text-left transition-colors ${
                  !isDisabled
                    ? "text-white group-hover:text-gameLight"
                    : "text-white/40"
                }`}
              >
                {name}
              </span>
              <p className="text-[8.5px] text-white/50 leading-tight uppercase tracking-tight font-bold text-left w-full break-words whitespace-normal">
                {data.desc}
              </p>
            </div>

            {/* RIGHT SIDE: Price & Level Stack */}
            <div className="flex flex-col items-end justify-center shrink-0">
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded mb-0.5 ${
                  canAfford
                    ? "bg-green-500/10 text-green-500"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                ${currentPrice.toLocaleString()}
              </span>
              {/* Level Display */}
              {data.bought > 0 && (
                <span className="text-[8px] text-gameYellow/80 font-bold uppercase tracking-wider">
                  ({data.bought} times)
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
