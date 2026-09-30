// components/SurvivalGuideCustomModal.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import BranchedMenu from "./BranchedMenu";

// --- CUSTOM HARDWARE ICONS ---
const MouseSVG = ({ highlight }) => (
  <svg
    viewBox="0 0 24 36"
    fill="none"
    className="w-[18px] h-6 inline relative -top-0.5 mr-1.5 text-white/50"
  >
    <rect
      x="2"
      y="2"
      width="20"
      height="32"
      rx="10"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M2 14H22" stroke="currentColor" strokeWidth="2" />
    <path d="M12 2V14" stroke="currentColor" strokeWidth="2" />
    {highlight === "left" && (
      <path
        d="M2 12C2 6.477 6.477 2 12 2V14H2Z"
        fill="white"
        className="text-white"
      />
    )}
    {highlight === "right" && (
      <path
        d="M12 2C17.523 2 22 6.477 22 12V14H12V2Z"
        fill="white"
        className="text-white"
      />
    )}
  </svg>
);

const Key = ({ children }) => (
  <div className="inline-flex items-center justify-center px-1.5 py-0.5 mx-1 min-w-[28px] text-[10px] font-black text-gameDark bg-white border border-white/80 rounded tracking-wider">
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
    <div
      className={`flex h-10 w-10 items-center justify-center rounded border-2 text-xl font-bold uppercase ${colors} ${pulse ? "animate-pulse" : ""}`}
    >
      {char}
    </div>
  );
};

// --- MENU DATA ---
const GUIDE_MENU = [
  {
    label: "Core System",
    color: "#f5f5f5",
    children: [
      { value: "basics", label: "How to Play" },
      { value: "earnings", label: "Economy & Earnings" },
      { value: "hints", label: "Hints & Shop" },
    ],
  },
  {
    label: "Mini-Bosses",
    color: "#0099ff",
    children: [
      { value: "duodle", label: "Duodle" },
      { value: "bombedle", label: "Bombedle" },
    ],
  },
  {
    label: "Bosses",
    color: "#da032a",
    children: [
      { value: "fourdle", label: "Fourdle" },
      { value: "shapedle", label: "Shapedle" },
      { value: "500dle", label: "500dle" },
    ],
  },
  {
    label: "Special Modes",
    color: "#ffd500",
    children: [{ value: "rapidle", label: "Rapidle" }],
  },
];

export default function SurvivalGuideCustomModal({
  isOpen,
  onClose,
  initialTab = "basics",
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

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

  const modalTransform = isOpen
    ? "scale-100 opacity-100"
    : "scale-95 opacity-0";

  const renderContent = () => {
    switch (activeTab) {
      case "basics":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-black uppercase tracking-widest text-white mb-2">
                Standard Rules
              </h3>
              <p className="text-white/70 font-mono text-sm leading-relaxed">
                Survival revolves around accumulating wealth to reach{" "}
                <strong>$1,000,000</strong>. You start with 3 Hearts. Failing
                any puzzle loses a Heart; drop to 0, and the run permanently
                ends.
              </p>
            </div>

            {/* Core Mechanics */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-gameLight">
                Dictionary Validation
              </h4>
              <p className="text-white/60 font-mono text-xs leading-relaxed">
                Every guess must be a valid 5-letter English word. Random
                character smashing is forbidden. You have 6 rows to guess the
                target word.
              </p>
            </div>

            {/* Color Clues */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-gameLight">
                Color Clues
              </h4>
              <div className="flex gap-2">
                <MockTile char="S" state="G" />
                <MockTile char="O" state="Y" />
                <MockTile char="L" state="B" />
                <MockTile char="V" state="B" />
                <MockTile char="E" state="B" />
              </div>

              <ul className="space-y-2 font-mono text-xs text-white/60 bg-white/5 border border-white/10 p-4 rounded-xl">
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gameGreen rounded shrink-0"></div>
                  <span>
                    <strong className="text-gameGreen">Green:</strong> Correct
                    letter in the exact correct position.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gameYellow rounded shrink-0"></div>
                  <span>
                    <strong className="text-gameYellow">Yellow:</strong> The
                    letter exists in the word, but belongs in a different spot.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gameGrey rounded shrink-0"></div>
                  <span>
                    <strong className="text-gameGrey">Grey:</strong> The letter
                    is completely absent from the secret word.
                  </span>
                </li>
              </ul>
            </div>

            {/* Duplicate Letters Rule */}
            <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="text-xs font-black uppercase tracking-wider text-gameYellow">
                The Duplicate Letters Rule
              </h4>
              <p className="text-white/60 font-mono text-xs leading-relaxed">
                If you guess a word with repeating letters (e.g.{" "}
                <em>"SPEED"</em> has two E's) but the target word only contains{" "}
                <strong>one</strong>, only one instance lights up. Green
                instances always take priority over Yellow, and excess copies
                are marked Grey.
              </p>
            </div>
          </div>
        );

      case "earnings":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-black uppercase tracking-widest text-gameGreen mb-2">
                Economy & Earnings
              </h3>
              <p className="text-white/70 font-mono text-sm leading-relaxed">
                Reaching the $1,000,000 extraction goal requires maximizing your
                multipliers. Here is how your cash payouts are calculated.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 font-mono">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <h4 className="text-white font-bold text-xs uppercase tracking-widest border-b border-white/10 pb-2">
                  Standard Multipliers
                </h4>
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-xs text-white/80">
                      <span>Base Win</span>
                      <span className="text-gameGreen font-bold">+$4,000</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-white/80">
                      <span>Speed Bonus</span>
                      <span className="text-gameGreen font-bold">+$1,500</span>
                    </div>
                    <p className="text-[10px] text-white/40 mt-0.5 leading-tight">
                      Per unused row. ($2.5k for Bosses).
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-white/80">
                      <span>Streak Bonus</span>
                      <span className="text-gameGreen font-bold">+$500</span>
                    </div>
                    <p className="text-[10px] text-white/40 mt-0.5 leading-tight">
                      Compounds per consecutive win. Losing a game resets this
                      to $0.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#050505] border border-gameYellow/30 rounded-xl space-y-2">
                <h4 className="text-gameYellow font-bold text-xs uppercase tracking-widest border-b border-white/10 pb-2">
                  Boss Windfalls
                </h4>
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-xs text-white/80">
                      <span>Flawless Shape</span>
                      <span className="text-gameYellow font-bold">+$5,000</span>
                    </div>
                    <p className="text-[10px] text-white/40 mt-0.5 leading-tight">
                      Per mistake NOT made during Shapedle (Up to $10,000).
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-white/80">
                      <span>Rapidle Carry</span>
                      <span className="text-gameYellow font-bold">+$3,500</span>
                    </div>
                    <p className="text-[10px] text-white/40 mt-0.5 leading-tight">
                      Per word typed. No streak multipliers apply.
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-white/80">
                      <span>Cycle Completion</span>
                      <span className="text-gameYellow font-bold">
                        +$75,000
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40 mt-0.5 leading-tight">
                      Awarded if you beat a full boss cycle while at Max (5)
                      Hearts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "hints":
        return (
          <div className="space-y-6">
            <h3 className="text-3xl font-black uppercase tracking-widest text-gameGreen mb-2">
              Hints & Items
            </h3>
            <p className="text-white/70 font-mono text-sm leading-relaxed">
              Use your hard-earned cash to buy emergency hints. Access the Shop
              via the <strong className="text-gameGreen">Green Button</strong>{" "}
              in the bottom-left corner. Hint prices scale up the more you buy
              them across the entire run.
            </p>

            <div className="grid grid-cols-1 gap-2 mt-4 font-mono">
              <div className="p-3 bg-white/5 border-l-4 border-gameLight rounded-r-xl flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold text-xs uppercase">
                    Hide A Letter
                  </h4>
                  <p className="text-white/50 text-[10px]">
                    Discards 1 incorrect letter from the keyboard.
                  </p>
                </div>
                <span className="text-[10px] text-white/30">
                  (Max 5 per round)
                </span>
              </div>
              <div className="p-3 bg-white/5 border-l-4 border-gameYellow rounded-r-xl flex items-center justify-between">
                <div>
                  <h4 className="text-gameYellow font-bold text-xs uppercase">
                    Yellow & Vowel Letter
                  </h4>
                  <p className="text-white/50 text-[10px]">
                    Instantly locates a misplaced letter or hidden vowel.
                  </p>
                </div>
                <span className="text-[10px] text-white/30">
                  (Max 1 per round)
                </span>
              </div>
              <div className="p-3 bg-white/5 border-l-4 border-gameGreen rounded-r-xl flex items-center justify-between">
                <div>
                  <h4 className="text-gameGreen font-bold text-xs uppercase">
                    Green Letter
                  </h4>
                  <p className="text-white/50 text-[10px]">
                    Locks a correct letter into its perfect spot.
                  </p>
                </div>
                <span className="text-[10px] text-white/30">
                  (Max 1 per round)
                </span>
              </div>
              <div className="p-3 bg-white/5 border-l-4 border-gameRed rounded-r-xl flex items-center justify-between">
                <div>
                  <h4 className="text-gameRed font-bold text-xs uppercase">
                    +1 Extra Heart
                  </h4>
                  <p className="text-white/50 text-[10px]">
                    Restores a broken heart. Price increases massively.
                  </p>
                </div>
                <span className="text-[10px] text-white/30">
                  (Max 5 Hearts)
                </span>
              </div>
            </div>
          </div>
        );

      case "duodle":
      case "fourdle":
        const isFourdle = activeTab === "fourdle";
        return (
          <div className="space-y-6">
            <h3 className="text-3xl font-black uppercase tracking-widest text-gameBlue mb-2">
              {isFourdle ? "Boss: Fourdle" : "Mini-Boss: Duodle"}
            </h3>
            <p className="text-white/70 font-mono text-sm leading-relaxed">
              Solve {isFourdle ? "4 words" : "2 words"} simultaneously. Every
              guess you submit is tested against all remaining unsolved boards
              at exactly the same time.
            </p>

            <div className="flex flex-col items-center gap-2 p-5 bg-[#050505] rounded-xl border border-gameBlue/20 w-fit mx-auto">
              <span className="text-[10px] text-gameBlue uppercase font-black tracking-widest">
                Keyboard Focus
              </span>
              <div className="flex items-center justify-center rounded-md border border-gameLight/25 bg-black p-1">
                <button className="mx-0.5 min-w-12 rounded px-2 py-1 text-[10px] font-black uppercase tracking-wide transition-all bg-gameLight/20 text-gameLight">
                  1ST
                </button>
                <button className="mx-0.5 min-w-12 rounded px-2 py-1 text-[10px] font-black uppercase tracking-wide transition-all bg-gameGreen text-gameDark">
                  2ND
                </button>
                {isFourdle && (
                  <>
                    <button className="mx-0.5 min-w-12 rounded px-2 py-1 text-[10px] font-black uppercase tracking-wide transition-all bg-gameLight/20 text-gameLight">
                      3RD
                    </button>
                    <button className="mx-0.5 min-w-12 rounded px-2 py-1 text-[10px] font-black uppercase tracking-wide transition-all bg-gameLight/20 text-gameLight">
                      4TH
                    </button>
                  </>
                )}
                <button className="mx-0.5 min-w-12 rounded px-2 py-1 text-[10px] font-black uppercase tracking-wide transition-all bg-gameLight/20 text-gameLight">
                  ALL
                </button>
              </div>
              <p className="text-[9px] text-white/40 mt-1 max-w-[200px] text-center font-mono leading-tight">
                Controls what colors the keyboard displays.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-gameBlue/30 bg-gameBlue/5">
              <h4 className="text-gameBlue font-black uppercase tracking-widest text-sm mb-3">
                Keyboard Shortcuts
              </h4>
              <p className="text-white/70 font-mono text-xs leading-relaxed mb-4">
                By default, your keyboard highlights the <i>best</i> status of a
                letter across all active boards. To isolate a specific word:
              </p>
              <ul className="space-y-3 text-sm text-white/90 font-mono">
                <li className="flex items-start gap-2">
                  <div className="mt-1">
                    <MouseSVG highlight="left" />
                  </div>
                  <span className="leading-tight">
                    <strong>Left Click a Board:</strong> Focuses your keyboard
                    to show hints ONLY for that specific word.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1">
                    <div className="inline-flex items-center gap-0.5 relative -top-0.5 mr-2">
                      <MouseSVG highlight="left" />
                      <span className="text-[10px] font-black italic text-white leading-none">
                        x2
                      </span>
                    </div>
                  </div>
                  <span className="leading-tight">
                    <strong>Double Click:</strong> Resets the keyboard back to
                    the combined "ALL" view.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        );

      case "bombedle":
        return (
          <div className="space-y-6">
            <h3 className="text-3xl font-black uppercase tracking-widest text-gameRed mb-2">
              Mini-Boss: Bombedle
            </h3>
            <p className="text-white/70 font-mono text-sm leading-relaxed">
              A high-pressure race against time. You have exactly{" "}
              <strong>60 seconds</strong> to solve all 6 rows. The clock does
              not stop while you think.
            </p>

            <div className="flex gap-4 items-center justify-center my-6">
              <div className="w-24 h-24 rounded-2xl border-2 border-gameRed flex flex-col items-center justify-center bg-[#050505]">
                <span className="text-[9px] text-gameRed font-black uppercase tracking-widest mb-1">
                  Timer
                </span>
                <span className="text-4xl font-mono font-black text-gameRed animate-pulse">
                  42s
                </span>
              </div>
              <div className="w-24 h-24 rounded-2xl border-2 border-gameYellow flex flex-col items-center justify-center bg-[#050505]">
                <span className="text-[9px] text-gameYellow font-black uppercase tracking-widest mb-1">
                  Phrase
                </span>
                <span className="text-3xl font-black text-white uppercase">
                  SH
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-gameRed/30 bg-gameRed/5">
              <h4 className="text-gameRed font-black uppercase tracking-widest text-sm mb-2">
                Detonation Rules
              </h4>
              <p className="text-white/70 font-mono text-sm leading-relaxed">
                Every guess you submit <strong>MUST</strong> contain the exact
                active phrase shown on the panel (e.g., if the phrase is "SH",
                words like "SMASH" or "SHOES" are valid). If you submit a word
                missing the phrase, it gets rejected!
              </p>
            </div>
          </div>
        );

      case "shapedle":
        return (
          <div className="space-y-6">
            <h3 className="text-3xl font-black uppercase tracking-widest text-gameGreen mb-2">
              Boss: Shapedle
            </h3>
            <p className="text-white/70 font-mono text-sm leading-relaxed">
              You must perfectly match the required color constraints on every
              single turn to paint the target shape on the board.
            </p>

            <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-[#050505] border border-white/10 rounded-2xl">
              <div className="flex flex-col gap-1 p-3 bg-black border-2 border-gameGreen/30 rounded-xl">
                <div className="flex gap-1">
                  <div className="w-6 h-6 bg-gameGreen rounded" />
                  <div className="w-6 h-6 bg-transparent border-2 border-gameGrey/30 rounded" />
                  <div className="w-6 h-6 bg-gameYellow rounded" />
                </div>
                <div className="flex gap-1">
                  <div className="w-6 h-6 bg-transparent border-2 border-gameGrey/30 rounded" />
                  <div className="w-6 h-6 bg-gameGreen rounded" />
                  <div className="w-6 h-6 bg-transparent border-2 border-gameGrey/30 rounded" />
                </div>
              </div>
              <p className="text-sm font-mono text-white/60 leading-relaxed text-center md:text-left">
                If the shape row requires{" "}
                <span className="text-gameGreen font-bold">Green</span> -{" "}
                <span className="text-gameGrey font-bold">Grey</span> -{" "}
                <span className="text-gameYellow font-bold">Yellow</span>, your
                submitted word MUST evaluate to exactly those colors against the
                hidden target word.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-gameGreen/30 bg-gameGreen/5">
              <h4 className="text-gameGreen font-black uppercase tracking-widest text-sm mb-2">
                3 Strikes, You're Out
              </h4>
              <p className="text-white/70 font-mono text-sm leading-relaxed">
                If you submit a word that does not evaluate to the required
                shape colors, it will be rejected and you will receive a{" "}
                <strong>Mistake</strong>. If you make 3 mistakes, you instantly
                fail the Boss and lose a heart.
              </p>
            </div>
          </div>
        );

      case "500dle":
        return (
          <div className="space-y-6">
            <h3 className="text-3xl font-black uppercase tracking-widest text-gameYellow mb-2">
              Boss: 500dle
            </h3>
            <p className="text-white/70 font-mono text-sm leading-relaxed">
              The ultimate mastermind logic puzzle. The game{" "}
              <strong>WILL NOT</strong> color your keyboard or your tiles.
              Instead, it only tells you <i>how many</i> tiles are Green,
              Yellow, or Red on the side panel.
            </p>

            <div className="flex items-center justify-center gap-6 my-6 bg-[#050505] p-5 rounded-2xl border border-white/10">
              <div className="flex gap-1">
                <MockTile char="S" />
                <MockTile char="P" />
                <MockTile char="A" />
                <MockTile char="R" />
                <MockTile char="K" />
              </div>
              <div className="w-1 h-10 bg-white/10 rounded-full" />
              <div className="flex gap-1">
                <MockTile char="1" state="G" />
                <MockTile char="2" state="Y" />
                <MockTile char="2" state="R" />
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-gameYellow/30 bg-gameYellow/5">
              <h4 className="text-gameYellow font-black uppercase tracking-widest text-sm mb-3">
                Logic Shortcuts
              </h4>
              <p className="text-white/70 font-mono text-xs leading-relaxed mb-4">
                You must color the board yourself to solve the logic puzzle. The
                colors you set on the board will automatically reflect on your
                keyboard!
              </p>
              <ul className="space-y-3 text-xs text-white/90 font-mono">
                <li className="flex items-center gap-2">
                  <MouseSVG highlight="left" />
                  <span>
                    <strong>Left Click:</strong> Cycles color (Grey Red Yellow
                    Green).
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Key>SHIFT</Key>{" "}
                    <span className="mx-1 text-white/30">+</span>{" "}
                    <MouseSVG highlight="left" />
                  </div>
                  <span>
                    <strong>Mass Paint:</strong> Applies the next color to ALL
                    identical letters.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Key>ALT</Key> <span className="mx-1 text-white/30">+</span>{" "}
                    <MouseSVG highlight="right" />
                  </div>
                  <span>
                    <strong>Lock Dead:</strong> Marks ALL identical letters as{" "}
                    <strong>Locked Red</strong>.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Key>CTRL</Key>{" "}
                    <span className="mx-1 text-white/30">+</span>{" "}
                    <MouseSVG highlight="right" />
                  </div>
                  <span>
                    <strong>Wipe Board:</strong> Clears all manual colors from
                    the entire board.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        );

      case "rapidle":
        return (
          <div className="space-y-6">
            <h3 className="text-3xl font-black uppercase tracking-widest text-gameBlue mb-2">
              Special: Rapidle
            </h3>
            <p className="text-white/70 font-mono text-sm leading-relaxed">
              Pure typing speed. You have exactly <strong>10 Seconds</strong>.
              Type as many valid 5-letter words as physically possible before
              the clock hits zero.
            </p>

            <div className="flex gap-4 items-center justify-center my-6">
              <div className="w-24 h-24 rounded-2xl border-2 border-gameBlue flex flex-col items-center justify-center bg-[#050505]">
                <span className="text-[10px] text-gameBlue font-black uppercase tracking-widest mb-1">
                  Time
                </span>
                <span className="text-4xl font-mono font-black text-white animate-pulse">
                  4s
                </span>
              </div>
              <div className="flex gap-1 opacity-80 scale-90 md:scale-100">
                <MockTile char="T" state="BL" />
                <MockTile char="Y" state="BL" />
                <MockTile char="P" state="BL" />
                <MockTile char="E" state="BL" />
                <MockTile char="S" state="BL" />
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-gameBlue/30 bg-gameBlue/5">
              <h4 className="text-gameBlue font-black uppercase tracking-widest text-sm mb-2">
                Scoring
              </h4>
              <p className="text-white/70 font-mono text-sm leading-relaxed">
                Rapidle is a free bonus round. You cannot lose a heart. Every
                valid word you successfully submit grants a massive{" "}
                <strong>$3,500 Cash Bonus</strong>. The grid scrolls infinitely
                as you type!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 transition-all duration-300 ease-out ${visibilityClass}`}
    >
      <div className="fixed inset-0 bg-black/80" onClick={onClose} />
      <div
        className={`relative w-full max-w-[65rem] h-[85vh] md:h-[75vh] flex flex-col md:flex-row overflow-hidden rounded-3xl bg-[#0a0a0a] border-2 border-white/20 transition-all duration-500 ${modalTransform}`}
      >
        {/* --- LEFT SIDEBAR (Branched Menu Component) --- */}
        <div className="w-full md:w-72 lg:w-80 h-[35%] md:h-full flex-shrink-0 border-b md:border-b-0 md:border-r border-white/10 bg-[#0f0f0f] flex flex-col relative z-20">
          <div className="p-6 md:p-8 border-b border-white/10 shrink-0">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gameBlue"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Intel Guide
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-shape-scroll">
            {isOpen && (
              <BranchedMenu
                key={initialTab}
                items={GUIDE_MENU}
                defaultOpen={[0, 1, 2, 3]}
                defaultActive={initialTab}
                onSelect={(value) => setActiveTab(value)}
                color="#f5f5f5"
                accentColor="#0099ff"
                lineColor="#3f3f46"
                width={280}
              />
            )}
          </div>
        </div>

        {/* --- RIGHT CONTENT AREA --- */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#0a0a0a]">
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

          <div className="flex-1 overflow-y-auto custom-shape-scroll p-8 md:p-12 lg:p-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full max-w-2xl mx-auto h-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        .custom-shape-scroll::-webkit-scrollbar { width: 6px; }
        .custom-shape-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-shape-scroll::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 9999px; }
        .custom-shape-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.2); }
      `}</style>
    </div>
  );
}
