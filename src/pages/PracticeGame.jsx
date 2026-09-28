// pages/PracticeGame.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import Header from "../components/Header";
import Toast from "../components/Toast";
import BossGameView from "../components/BossGameView";
import PracticeGameModals from "../components/PracticeGameModals";
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
      />

      {import.meta.env.DEV && (
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="absolute bottom-4 right-4 bg-gameRed/20 hover:bg-gameRed text-white/50 hover:text-white text-[10px] font-bold py-2 px-3 rounded-lg border border-gameRed/30 transition-all z-50 uppercase tracking-widest"
        >
          Wipe Data
        </button>
      )}

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
