// components/PracticeShapeSelectorModal.jsx
import { useEffect } from "react";
import { SHAPES } from "../utils/bossConfig";

export default function PracticeShapeSelectorModal({
  isOpen,
  onClose,
  onSelect,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
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
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${visibilityClass}`}
    >
      <div className="fixed inset-0 bg-black/80" onClick={onClose} />

      <style>{`
        .custom-shape-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-shape-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-shape-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
        }
        .custom-shape-scroll::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      <div
        className={`relative flex flex-col w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl bg-[#0a0a0a] border-2 border-white/20 transition-colors duration-500 shadow-[0_0_40px_rgba(255,255,255,0.05)] ${modalTransform}`}
      >
        <div className="relative flex items-center justify-center h-20 shrink-0 w-full border-b border-white/10 bg-[#0a0a0a] z-10 px-6 md:px-8">
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-center text-gameLight">
            Select Training Shape
          </h2>
          <button
            onClick={onClose}
            className="absolute right-6 md:right-8 bg-white/5 hover:bg-white/10 text-white rounded-full p-2.5 transition-all active:scale-90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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

        <div className="flex-1 overflow-y-auto custom-shape-scroll p-6 md:p-8">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            <button
              onClick={() => onSelect("random")}
              className="flex flex-col justify-center items-center p-4 bg-white/5 hover:bg-white/10 border-2 border-white/20 hover:border-white/50 rounded-xl transition-all active:scale-95 group h-full min-h-[120px]"
            >
              <span className="text-5xl font-black text-gameLight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                ?
              </span>
              <span className="text-white/80 group-hover:text-white font-bold uppercase tracking-widest mt-3 text-[10px]">
                Random
              </span>
            </button>

            {Object.entries(SHAPES).map(([key, shapeDef]) => (
              <button
                key={key}
                onClick={() => onSelect(key)}
                className="flex flex-col items-center p-3 bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-gameGreen/50 rounded-xl transition-all active:scale-95 group"
              >
                <h3 className="text-white/60 group-hover:text-gameGreen text-[10px] font-black uppercase mb-3 tracking-widest transition-colors">
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
                          /* REMOVED transition-all here to prevent massive browser reflow lag on resize */
                          className={`w-4 h-4 rounded border ${
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
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
