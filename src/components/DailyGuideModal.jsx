// components/DailyGuideModal.jsx
import React, { useEffect } from "react";

const MockTile = ({ char, state }) => {
  let colors = "bg-[#111] border-gameGrey/30 text-white/50";
  if (state === "G") colors = "bg-gameGreen border-gameGreen text-gameDark";
  if (state === "Y") colors = "bg-gameYellow border-gameYellow text-gameDark";
  if (state === "B") colors = "bg-gameGrey border-gameGrey text-gameDark";

  return (
    <div
      className={`flex h-11 w-11 items-center justify-center rounded-lg border-2 text-xl font-black uppercase ${colors}`}
    >
      {char}
    </div>
  );
};

export default function DailyGuideModal({ isOpen, onClose }) {
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
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8 transition-all duration-300 ease-out ${visibilityClass}`}
    >
      <div className="fixed inset-0 bg-black/80" onClick={onClose} />

      <div
        className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto custom-guide-scroll rounded-3xl bg-[#0a0a0a] border-2 border-gameGreen/50 p-8 md:p-12 transition-all duration-500 ${modalTransform}`}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 md:top-8 md:right-8 z-50 bg-white/5 hover:bg-white/15 text-white rounded-full p-2.5 transition-all active:scale-90"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 md:h-6 md:w-6"
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

        <div className="space-y-8 font-sans">
          {/* Header */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gameGreen block mb-1">
              Field Manual
            </span>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
              How To Play Daily
            </h2>
            <p className="text-white/60 font-mono text-xs mt-2 leading-relaxed">
              Every day at midnight, a single secret 5-letter word is chosen for
              everyone worldwide. You have <strong>6 attempts</strong> to
              uncover it.
            </p>
          </div>

          {/* Section 1: The Core Loop */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-gameLight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gameGreen"></span>
              1. Valid Guesses Only
            </h3>
            <p className="text-white/70 font-mono text-xs leading-relaxed">
              Every guess must be a real <strong>5-letter English word</strong>{" "}
              from the dictionary. You cannot mash random letters like{" "}
              <em>"QWERT"</em> to scout vowels. Hit{" "}
              <span className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded border border-white/20">
                ENTER
              </span>{" "}
              to submit your row.
            </p>
          </div>

          {/* Section 2: Color Feedback */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gameLight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gameYellow"></span>
              2. Color Clues
            </h3>
            <p className="text-white/70 font-mono text-xs leading-relaxed">
              After each submitted guess, the tiles change color to indicate how
              close each letter was to the solution:
            </p>

            <div className="space-y-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
              <div className="flex items-center gap-4">
                <MockTile char="S" state="G" />
                <div className="text-xs font-mono">
                  <span className="text-gameGreen font-bold uppercase block">
                    Green (Correct Spot)
                  </span>
                  <span className="text-white/60">
                    The letter <strong>S</strong> is in the secret word and in
                    the exact right position.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <MockTile char="P" state="Y" />
                <div className="text-xs font-mono">
                  <span className="text-gameYellow font-bold uppercase block">
                    Yellow (Misplaced)
                  </span>
                  <span className="text-white/60">
                    The letter <strong>P</strong> exists in the secret word, but
                    it belongs in another column.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <MockTile char="K" state="B" />
                <div className="text-xs font-mono">
                  <span className="text-gameGrey font-bold uppercase block">
                    Grey (Absent)
                  </span>
                  <span className="text-white/60">
                    The letter <strong>K</strong> is completely absent from the
                    secret word.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Duplicate Letters (The most misunderstood rule) */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-gameLight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gameRed"></span>
              3. The Duplicate Letters Rule
            </h3>
            <p className="text-white/70 font-mono text-xs leading-relaxed">
              If your guess contains duplicate letters (e.g. two{" "}
              <strong>E</strong>'s), but the target word only contains{" "}
              <strong>one</strong>, only one will light up:
            </p>

            <div className="bg-[#050505] border border-white/10 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-1.5 justify-center py-1">
                <MockTile char="S" state="B" />
                <MockTile char="P" state="B" />
                <MockTile char="E" state="G" />
                <MockTile char="E" state="B" />
                <MockTile char="D" state="B" />
              </div>
              <p className="text-[11px] font-mono text-white/50 text-center leading-normal">
                If the secret word is <strong>"CREPT"</strong> (which has only
                one E), the first E becomes{" "}
                <span className="text-gameGreen font-bold">GREEN</span>, while
                the extra E turns{" "}
                <span className="text-gameGrey font-bold">GREY</span>. Green
                instances always take priority over Yellow instances!
              </p>
            </div>
          </div>

          {/* Section 4: Keyboard & Streak Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-1.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-gameLight">
                Keyboard Tracking
              </h4>
              <p className="text-[11px] font-mono text-white/60 leading-relaxed">
                Letters on the virtual keyboard update to match your best
                discovery. If a key is greyed out, do not type it again.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-1.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-gameYellow">
                Streak Preservation
              </h4>
              <p className="text-[11px] font-mono text-white/60 leading-relaxed">
                You get 1 attempt per day. Failing to solve the word in 6
                guesses or missing a full calendar day drops your streak
                straight back to <strong>0</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-guide-scroll::-webkit-scrollbar { width: 6px; }
        .custom-guide-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-guide-scroll::-webkit-scrollbar-thumb { background-color: rgba(0, 225, 150, 0.2); border-radius: 9999px; }
        .custom-guide-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(0, 225, 150, 0.4); }
      `}</style>
    </div>
  );
}
