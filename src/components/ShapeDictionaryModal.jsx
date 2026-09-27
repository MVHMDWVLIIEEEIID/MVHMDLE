import { useEffect } from "react";
import { SHAPES } from "../utils/bossConfig";

export default function ShapeDictionaryModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, onClose]);

  const visibilityClass = isOpen
    ? "opacity-100 pointer-events-auto backdrop-blur-xl"
    : "opacity-0 pointer-events-none backdrop-blur-none";
  const modalTransform = isOpen ? "animate-modalIn" : "animate-modalOut";

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 transition-all duration-300 ease-out ${visibilityClass}`}
    >
      <div className="fixed inset-0 bg-black/80" onClick={onClose} />
      <div
        className={`relative w-full max-w-5xl max-h-[90vh] overflow-y-auto clean-scroll rounded-3xl bg-[#0a0a0a] border-2 border-gameYellow/50 p-6 md:p-10 transition-colors duration-500 shadow-[0_0_40px_rgba(255,213,0,0.12)] ${modalTransform}`}
      >
        <div className="relative flex items-center justify-center mb-8 h-10 w-full">
          <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase text-center text-gameYellow">
            Shape Dictionary
          </h2>
          <button
            onClick={onClose}
            className="absolute right-0 bg-white/5 hover:bg-white/10 text-white rounded-full p-2.5 transition-all active:scale-90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Object.entries(SHAPES).map(([key, shapeDef]) => (
            <div
              key={key}
              className="flex flex-col items-center p-4 bg-white/5 border border-gameYellow/20 rounded-xl"
            >
              <h3 className="text-gameYellow text-xs font-black uppercase mb-4 tracking-widest">
                {key.replace("shape-", "")}
              </h3>
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
                        className={`w-5 h-5 rounded border transition-all ${
                          cell === "G"
                            ? "bg-gameGreen border-gameGreen shadow-[0_0_6px_rgba(0,225,150,0.5)]"
                            : cell === "Y"
                              ? "bg-gameYellow border-gameYellow shadow-[0_0_6px_rgba(255,213,0,0.5)]"
                              : "bg-transparent border-gameGrey/30"
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
