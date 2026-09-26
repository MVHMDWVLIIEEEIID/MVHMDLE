import React from "react";
import { SHAPES } from "../hooks/useSurvivalGame";

export function ShapeLeftPanel({ bossType }) {
  const shapeDef = SHAPES[bossType] || SHAPES["shape-t"];

  return (
    <div className="w-72 h-72 rounded-lg flex flex-col justify-center bg-[#0a0a0a] border-2 border-gameLight shadow-[0_0_15px_rgba(0,0,0,0.5)] p-4 relative">
      <h2 className="text-center text-gameGreen font-black uppercase mb-4 tracking-widest text-lg">
        Target Shape
      </h2>
      <div
        className="grid gap-1 mx-auto w-fit"
        style={{
          gridTemplateRows: `repeat(${shapeDef.length}, minmax(0, 1fr))`,
        }}
      >
        {shapeDef.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1">
            {row.map((cell, cIdx) => (
              <div
                key={cIdx}
                className={`w-7 h-7 rounded border-2 transition-all ${
                  cell === "G"
                    ? "bg-gameGreen border-gameGreen shadow-[0_0_10px_rgba(0,225,150,0.5)]"
                    : cell === "Y"
                      ? "bg-gameYellow border-gameYellow shadow-[0_0_10px_rgba(255,213,0,0.5)]"
                      : "bg-transparent border-gameGrey/20"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ShapeRightPanel({ targetWord, mistakes }) {
  return (
    <div className="w-72 h-72 rounded-lg flex flex-col justify-center items-center bg-[#0a0a0a] border-2 border-gameLight shadow-[0_0_15px_rgba(0,0,0,0.5)] p-6">
      <h2 className="text-center text-white/50 font-bold uppercase mb-2 tracking-widest text-xs">
        Target Word
      </h2>
      <div className="text-4xl font-black text-gameLight tracking-widest uppercase mb-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
        {targetWord}
      </div>
      <h2 className="text-center text-white/50 font-bold uppercase mb-2 tracking-widest text-xs">
        Mistakes Left
      </h2>
      <div
        className={`text-6xl font-black ${
          mistakes > 0 ? "text-gameRed" : "text-gameRed animate-pulse"
        } drop-shadow-[0_0_15px_rgba(218,3,42,0.5)]`}
      >
        {Math.max(0, mistakes)}
      </div>
    </div>
  );
}
