// pages/PracticeGame.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import Header from "../components/Header";
import Toast from "../components/Toast";
import BossGameView from "../components/BossGameView";
import PracticeGameModals from "../components/PracticeGameModals";
import PracticeGuideModal from "../components/PracticeGuideModal"; // <-- Import New Guide Modal
import usePracticeGame from "../hooks/usePracticeGame";
import useSecureState from "../hooks/useSecureState";
import useBossMechanics from "../hooks/useBossMechanics";
import useToast from "../hooks/useToast";
import { handleConfetti } from "../utils/confettiUtils";

export default function PracticeGame() {
  const navigate = useNavigate();
  const { bossId, subId } = useParams();
  const { toasts, addToast } = useToast();

  const [gameResetKey, setGameResetKey] = useState(0);
  const [isGuideOpen, setIsGuideOpen] = useState(false); // <-- Track Guide State

  const STREAK_KEY = `practice-streak-${bossId}-${subId || "rand"}`;
  const [streak, setStreak] = useSecureState(STREAK_KEY, 0);

  const game = usePracticeGame(bossId, subId);
  const { bossKeyboardView, setBossKeyboardView, bossKeyboardLineColors } =
    useBossMechanics(game);

  const [isModalOpen, setIsModalOpen] = useState(() => {
    if (game.gameState === "won") return [true, "won"];
    if (game.gameState === "lost") return [true, "lost"];
    return [false, "playing"];
  });

  const modalReadyAtRef = useRef(0);
  const RESULT_ANIMATION_MS = 1500;

  const handleGameOver = (result) => {
    document.activeElement.blur();
    window.focus();
    const now = Date.now();

    if (result === "won" || result === "lost") {
      modalReadyAtRef.current = now + RESULT_ANIMATION_MS;
    }

    if (result === "won-already" && now >= modalReadyAtRef.current) {
      setIsModalOpen([true, "won"]);
      return;
    }
    if (result === "lost-already" && now >= modalReadyAtRef.current) {
      setIsModalOpen([true, "lost"]);
      return;
    }

    if (result === "won" || result === "lost") {
      setTimeout(() => {
        if (result === "won") {
          setStreak((s) => s + 1);
          setIsModalOpen([true, "won"]);
          handleConfetti();
        } else if (result === "lost") {
          setStreak(0);
          setIsModalOpen([true, "lost"]);
        }
      }, RESULT_ANIMATION_MS);
    }
  };

  const handleNext = () => {
    game.resetGame();
    setGameResetKey((prev) => prev + 1);
    setIsModalOpen([false, "playing"]);
  };

  const handleQuit = () => {
    navigate("/practice");
  };

  return (
    <div className="flex flex-col h-screen relative overflow-hidden bg-gameDark text-white">
      <Toast toasts={toasts} />

      <div className="flex-1 center flex-col shrink-0">
        <Header
          mode={`PRACTICE: ${bossId.replace("-boss", "").toUpperCase()}`}
          streak={streak}
          hideHearts={true}
          onModeClick={handleQuit}
        />
      </div>

      <BossGameView
        game={game}
        progress={{ addWordsTyped: () => {} }}
        gameResetKey={gameResetKey}
        bossKeyboardView={bossKeyboardView}
        setBossKeyboardView={setBossKeyboardView}
        bossKeyboardLineColors={bossKeyboardLineColors}
        handleGameOver={handleGameOver}
        addToast={addToast}
        isBombTimerPaused={isGuideOpen} // Pause bomb if guide is open
      />

      {/* Guide Button FAB (Same styling as Survival) */}
      <div className="absolute bottom-4 right-4 z-40 flex flex-col items-end">
        <button
          onClick={() => {
            setIsGuideOpen(true);
            document.activeElement.blur();
            window.focus();
          }}
          className="flex flex-col items-center justify-center w-16 h-16 bg-gameBlue/90 hover:bg-gameBlue text-gameDark border-2 border-gameBlue rounded-2xl shadow-[0_0_15px_rgba(0,153,255,0.3)] hover:shadow-[0_0_20px_rgba(0,153,255,0.5)] transition-all active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 mb-0.5"
          >
            <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.938.618 5.5 1.765.15.111.35.111.5 0 1.562-1.147 3.505-1.765 5.5-1.765 1.042 0 2.062.196 3.024.56.55.209 1.127-.19 1.127-.773V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533Z" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">
            Guide
          </span>
        </button>
      </div>

      {/* DEV Tool: Moved to bottom-left so it doesn't overlap the Guide FAB */}
      {import.meta.env.DEV && (
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="absolute bottom-4 left-4 bg-gameRed/20 hover:bg-gameRed text-white/50 hover:text-white text-[10px] font-bold py-2 px-3 rounded-lg border border-gameRed/30 transition-all z-50 uppercase tracking-widest"
        >
          Wipe Data
        </button>
      )}

      {/* New Practice Guide Modal */}
      <PracticeGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        bossId={bossId}
      />

      <PracticeGameModals
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen([false, isModalOpen[1]])}
        onNext={handleNext}
        onQuit={handleQuit}
        stats={{
          streak,
          targetWords:
            game.targetWords?.length > 0 ? game.targetWords : [game.targetWord],
          guesses: game.guesses,
          bombPhrases: game.bombPhrases,
          bossCategory: game.bossCategory,
        }}
      />
    </div>
  );
}
