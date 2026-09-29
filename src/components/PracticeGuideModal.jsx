// components/PracticeGuideModal.jsx
import React, { useEffect } from "react";

// --- CUSTOM HARDWARE ICONS ---
const MouseSVG = ({ highlight }) => (
  <svg viewBox="0 0 24 36" fill="none" className="w-[18px] h-6 inline relative -top-0.5 mr-1.5 text-white/50">
    <rect x="2" y="2" width="20" height="32" rx="10" stroke="currentColor" strokeWidth="2" />
    <path d="M2 14H22" stroke="currentColor" strokeWidth="2" />
    <path d="M12 2V14" stroke="currentColor" strokeWidth="2" />
    {highlight === "left" && <path d="M2 12C2 6.477 6.477 2 12 2V14H2Z" fill="white" className="text-white" />}
    {highlight === "right" && <path d="M12 2C17.523 2 22 6.477 22 12V14H12V2Z" fill="white" className="text-white" />}
  </svg>
);

const Key = ({ children }) => (
  <div className="inline-flex items-center justify-center px-1.5 py-0.5 mx-1 min-w-[28px] text-[10px] font-black text-gameDark bg-white border border-white/80 rounded shadow-[0_3px_0_rgba(150,150,150,1)] tracking-wider">
    {children}
  </div>
);

const MockTile = ({ char, state, pulse }) => {
  let colors = "bg-[#111] border-gameGrey/30 text-white/50";
  if (state === "G") colors = "bg-gameGreen border-gameGreen text-gameDark";
  if (state === "Y") colors = "bg-gameYellow border-gameYellow text-gameDark";
  if (state === "B") colors = "bg-gameGrey border-gameGrey text-gameDark";
  if (state === "BL") colors = "bg-gameBlue border-gameBlue text-white";
  if (state === "R") colors = "bg-gameRed border-gameRed text-white";

  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded border-2 text-xl font-bold uppercase shadow-lg ${colors} ${pulse ? "animate-pulse" : ""}`}>
      {char}
    </div>
  );
};

export default function PracticeGuideModal({ isOpen, onClose, bossId }) {
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

  // Dynamic Theming based on Boss
  let borderColor = "border-white/20";
  if (bossId === "duodle" || bossId === "fourdle") borderColor = "border-gameBlue/50";
  if (bossId === "bombedle") borderColor = "border-gameRed/50";
  if (bossId === "shapedle") borderColor = "border-gameGreen/50";
  if (bossId === "500dle") borderColor = "border-gameYellow/50";

  const renderContent = () => {
    switch (bossId) {
      case "duodle":
      case "fourdle":
        const isFourdle = bossId === "fourdle";
        return (
          <div className="space-y-6">
            <h3 className="text-3xl font-black uppercase tracking-widest text-gameBlue mb-2">
              {isFourdle ? "Boss: Fourdle" : "Mini-Boss: Duodle"}
            </h3>
            <p className="text-white/70 font-mono text-sm leading-relaxed">
              Solve {isFourdle ? "4 words" : "2 words"} simultaneously. Every guess you submit is tested against all remaining unsolved boards at exactly the same time.
            </p>

            <div className="flex flex-col items-center gap-2 p-5 bg-[#050505] rounded-xl border border-gameBlue/20 w-fit mx-auto shadow-inner">
              <span className="text-[10px] text-gameBlue uppercase font-black tracking-widest">Keyboard Focus</span>
              <div className="flex items-center justify-center rounded-md border border-gameLight/25 bg-black p-1 shadow-lg">
                 <button className="mx-0.5 min-w-12 rounded px-2 py-1 text-[10px] font-black uppercase tracking-wide transition-all bg-gameLight/20 text-gameLight">1ST</button>
                 <button className="mx-0.5 min-w-12 rounded px-2 py-1 text-[10px] font-black uppercase tracking-wide transition-all bg-gameGreen text-gameDark shadow-[0_0_10px_rgba(0,225,150,0.5)]">2ND</button>
                 {isFourdle && (
                   <>
                     <button className="mx-0.5 min-w-12 rounded px-2 py-1 text-[10px] font-black uppercase tracking-wide transition-all bg-gameLight/20 text-gameLight">3RD</button>
                     <button className="mx-0.5 min-w-12 rounded px-2 py-1 text-[10px] font-black uppercase tracking-wide transition-all bg-gameLight/20 text-gameLight">4TH</button>
                   </>
                 )}
                 <button className="mx-0.5 min-w-12 rounded px-2 py-1 text-[10px] font-black uppercase tracking-wide transition-all bg-gameLight/20 text-gameLight">ALL</button>
              </div>
              <p className="text-[9px] text-white/40 mt-1 max-w-[200px] text-center font-mono leading-tight">
                Controls what colors the keyboard displays.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-gameBlue/30 bg-gameBlue/5">
              <h4 className="text-gameBlue font-black uppercase tracking-widest text-sm mb-3">Keyboard Shortcuts</h4>
              <p className="text-white/70 font-mono text-xs leading-relaxed mb-4">
                By default, your keyboard highlights the <i>best</i> status of a letter across all active boards. To isolate a specific word:
              </p>
              <ul className="space-y-3 text-sm text-white/90 font-mono">
                <li className="flex items-start gap-2">
                  <div className="mt-1"><MouseSVG highlight="left" /></div>
                  <span className="leading-tight"><strong>Left Click a Board:</strong> Focuses your keyboard to show hints ONLY for that specific word.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1">
                    <div className="inline-flex items-center gap-0.5 relative -top-0.5 mr-2">
                      <MouseSVG highlight="left" /><span className="text-[10px] font-black italic text-white leading-none">x2</span>
                    </div>
                  </div>
                  <span className="leading-tight"><strong>Double Click:</strong> Resets the keyboard back to the combined "ALL" view.</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case "bombedle":
        return (
          <div className="space-y-6">
            <h3 className="text-3xl font-black uppercase tracking-widest text-gameRed mb-2">Mini-Boss: Bombedle</h3>
            <p className="text-white/70 font-mono text-sm leading-relaxed">
              A high-pressure race against time. You have exactly <strong>60 seconds</strong> to solve all 6 rows. The clock does not stop while you think.
            </p>
            
            <div className="flex gap-4 items-center justify-center my-6">
              <div className="w-24 h-24 rounded-2xl border-2 border-gameRed flex flex-col items-center justify-center bg-[#050505] shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <span className="text-[9px] text-gameRed font-black uppercase tracking-widest mb-1">Timer</span>
                <span className="text-4xl font-mono font-black text-gameRed animate-pulse">42s</span>
              </div>
              <div className="w-24 h-24 rounded-2xl border-2 border-gameYellow flex flex-col items-center justify-center bg-[#050505] shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                <span className="text-[9px] text-gameYellow font-black uppercase tracking-widest mb-1">Phrase</span>
                <span className="text-3xl font-black text-white uppercase">SH</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-gameRed/30 bg-gameRed/5">
              <h4 className="text-gameRed font-black uppercase tracking-widest text-sm mb-2">Detonation Rules</h4>
              <p className="text-white/70 font-mono text-sm leading-relaxed">
                Every guess you submit <strong>MUST</strong> contain the exact active phrase shown on the panel (e.g., if the phrase is "SH", words like "SMASH" or "SHOES" are valid). If you submit a word missing the phrase, it gets rejected!
              </p>
            </div>
          </div>
        );

      case "shapedle":
        return (
          <div className="space-y-6">
            <h3 className="text-3xl font-black uppercase tracking-widest text-gameGreen mb-2">Boss: Shapedle</h3>
            <p className="text-white/70 font-mono text-sm leading-relaxed">
              You must perfectly match the required color constraints on every single turn to paint the target shape on the board. 
            </p>
            
            <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-[#050505] border border-white/10 rounded-2xl">
              <div className="flex flex-col gap-1 p-3 bg-black border-2 border-gameGreen/30 rounded-xl shadow-inner">
                <div className="flex gap-1"><div className="w-6 h-6 bg-gameGreen rounded" /><div className="w-6 h-6 bg-transparent border-2 border-gameGrey/30 rounded" /><div className="w-6 h-6 bg-gameYellow rounded" /></div>
                <div className="flex gap-1"><div className="w-6 h-6 bg-transparent border-2 border-gameGrey/30 rounded" /><div className="w-6 h-6 bg-gameGreen rounded" /><div className="w-6 h-6 bg-transparent border-2 border-gameGrey/30 rounded" /></div>
              </div>
              <p className="text-sm font-mono text-white/60 leading-relaxed text-center md:text-left">
                If the shape row requires <span className="text-gameGreen font-bold">Green</span> - <span className="text-gameGrey font-bold">Grey</span> - <span className="text-gameYellow font-bold">Yellow</span>, your submitted word MUST evaluate to exactly those colors against the hidden target word.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-gameGreen/30 bg-gameGreen/5">
              <h4 className="text-gameGreen font-black uppercase tracking-widest text-sm mb-2">3 Strikes, You're Out</h4>
              <p className="text-white/70 font-mono text-sm leading-relaxed">
                If you submit a word that does not evaluate to the required shape colors, it will be rejected and you will receive a <strong>Mistake</strong>. If you make 3 mistakes, you instantly fail the Boss and lose a heart.
              </p>
            </div>
          </div>
        );

      case "500dle":
        return (
          <div className="space-y-6">
            <h3 className="text-3xl font-black uppercase tracking-widest text-gameYellow mb-2">Boss: 500dle</h3>
            <p className="text-white/70 font-mono text-sm leading-relaxed">
              The ultimate mastermind logic puzzle. The game <strong>WILL NOT</strong> color your keyboard or your tiles. Instead, it only tells you <i>how many</i> tiles are Green, Yellow, or Red on the side panel.
            </p>
            
            <div className="flex items-center justify-center gap-6 my-6 bg-[#050505] p-5 rounded-2xl border border-white/10">
              <div className="flex gap-1">
                <MockTile char="S"/><MockTile char="P"/><MockTile char="A"/><MockTile char="R"/><MockTile char="K"/>
              </div>
              <div className="w-1 h-10 bg-white/10 rounded-full" />
              <div className="flex gap-1">
                <MockTile char="1" state="G"/><MockTile char="2" state="Y"/><MockTile char="2" state="R"/>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-gameYellow/30 bg-gameYellow/5">
              <h4 className="text-gameYellow font-black uppercase tracking-widest text-sm mb-3">Logic Shortcuts</h4>
              <p className="text-white/70 font-mono text-xs leading-relaxed mb-4">
                You must color the board yourself to solve the logic puzzle. The colors you set on the board will automatically reflect on your keyboard!
              </p>
              <ul className="space-y-3 text-xs text-white/90 font-mono">
                <li className="flex items-center gap-2">
                  <MouseSVG highlight="left" />
                  <span><strong>Left Click:</strong> Cycles color (Grey ➔ Red ➔ Yellow ➔ Green).</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="flex items-center"><Key>SHIFT</Key> <span className="mx-1 text-white/30">+</span> <MouseSVG highlight="left" /></div>
                  <span><strong>Mass Paint:</strong> Applies the next color to ALL identical letters.</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="flex items-center"><Key>ALT</Key> <span className="mx-1 text-white/30">+</span> <MouseSVG highlight="right" /></div>
                  <span><strong>Lock Dead:</strong> Marks ALL identical letters as <strong>Locked Red</strong>.</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="flex items-center"><Key>CTRL</Key> <span className="mx-1 text-white/30">+</span> <MouseSVG highlight="right" /></div>
                  <span><strong>Wipe Board:</strong> Clears all manual colors from the entire board.</span>
                </li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 transition-all duration-300 ease-out ${visibilityClass}`}>
      <div className="fixed inset-0 bg-black/80" onClick={onClose} />
      <div className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto custom-shape-scroll rounded-3xl bg-[#0a0a0a] border-2 ${borderColor} p-8 md:p-12 shadow-[0_0_60px_rgba(255,255,255,0.05)] transition-all duration-500 ${modalTransform}`}>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 md:top-8 md:right-8 z-50 bg-white/5 hover:bg-white/15 text-white rounded-full p-2.5 transition-all active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {renderContent()}
      </div>

      {/* Local Scrollbar Styles */}
      <style>{`
        .custom-shape-scroll::-webkit-scrollbar { width: 6px; }
        .custom-shape-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-shape-scroll::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 9999px; }
        .custom-shape-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.2); }
      `}</style>
    </div>
  );
}