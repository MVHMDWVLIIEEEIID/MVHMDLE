import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { secureStorage } from "../utils/secureStorage";

// Components
import Header from "../components/Header";
import Toast from "../components/Toast";
import SurvivalGuideCustomModal from "../components/SurvivalGuideCustomModal";
import SurvivalVictoryStats from "../components/SurvivalVictoryStats";
import SurvivalGameModals from "../components/SurvivalGameModals";
import StandardGameView from "../components/StandardGameView";
import BossGameView from "../components/BossGameView";

// Hooks
import useSurvivalGame from "../hooks/useSurvivalGame";
import useSurvivalProgress from "../hooks/useSurvivalProgress";
import useBossMechanics from "../hooks/useBossMechanics";
import useSurvivalActions from "../hooks/useSurvivalActions";

export default function Survival({ mode = "survival" }) {
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  const [gameResetKey, setGameResetKey] = useState(0);
  const [streakBeforeLastLoss, setStreakBeforeLastLoss] = useState(0);
  const modalReadyAtRef = useRef(0);

  const GUIDE_SEEN_KEY = `wordle-survival-guide-seen-${mode}`;
  const [isGuideOpen, setIsGuideOpen] = useState(
    () => !secureStorage.getItem(GUIDE_SEEN_KEY, false),
  );

  // Base Data Hooks
  const game = useSurvivalGame(mode);
  const progress = useSurvivalProgress(mode);

  const [isModalOpen, setIsModalOpen] = useState(() => {
    if (game.gameState === "won") return [true, "won"];
    if (game.gameState === "lost")
      return progress.hearts <= 0 ? [true, "game-over"] : [true, "lost-heart"];
    return [false, "playing"];
  });

  const addToast = (msg, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => {
      const updated = [...prev, { id, msg, type }];
      return updated.length > 3 ? updated.slice(updated.length - 3) : updated;
    });
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      2500,
    );
  };

  // Dedicated Hooks
  const { bossKeyboardView, setBossKeyboardView, bossKeyboardLineColors } =
    useBossMechanics(game);
  const {
    handleResetWrapper,
    handleRetryBoss,
    handleFullReset,
    handleGameOver,
    handleBuyHint,
    shareGame,
  } = useSurvivalActions({
    game,
    progress,
    setGameResetKey,
    setIsModalOpen,
    isModalOpen,
    setStreakBeforeLastLoss,
    addToast,
    modalReadyAtRef,
  });

  useEffect(() => {
    if (isGuideOpen) secureStorage.setItem(GUIDE_SEEN_KEY, true);
  }, [isGuideOpen, GUIDE_SEEN_KEY]);

  if (progress.runCompleted) {
    return (
      <SurvivalVictoryStats
        stats={progress.runStats}
        onNewRun={handleFullReset}
        onBackToMenu={() => navigate("/")}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen relative overflow-hidden bg-gameDark text-white">
      <Toast toasts={toasts} />

      <div className="flex-1 center flex-col">
        <Header
          mode="SURVIVAL CHALLENGE"
          streak={progress.streak}
          hearts={progress.hearts}
          onModeClick={() => navigate("/")}
        />
      </div>

      {game.isBossGame ? (
        <BossGameView
          game={game}
          progress={progress}
          gameResetKey={gameResetKey}
          bossKeyboardView={bossKeyboardView}
          setBossKeyboardView={setBossKeyboardView}
          bossKeyboardLineColors={bossKeyboardLineColors}
          handleGameOver={handleGameOver}
          addToast={addToast}
        />
      ) : (
        <StandardGameView
          game={game}
          progress={progress}
          gameResetKey={gameResetKey}
          isModalOpen={isModalOpen[0]}
          handleBuyHint={handleBuyHint}
          handleGameOver={handleGameOver}
          addToast={addToast}
        />
      )}

      <button
        onClick={() => {
          setIsGuideOpen(true);
          document.activeElement.blur();
          window.focus();
        }}
        className="absolute bottom-4 left-4 bg-gameBlue/20 hover:bg-gameBlue text-white/50 hover:text-white text-[10px] font-bold py-2 px-3 rounded-lg border border-gameBlue/30 transition-all z-50 uppercase tracking-widest"
      >
        Guide
      </button>

      <SurvivalGameModals
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen([false, isModalOpen[1]]);
          document.activeElement.blur();
          window.focus();
        }}
        onNext={() => {
          const modalType = isModalOpen[1];
          if (modalType === "game-over") return handleFullReset();
          if (modalType === "lost-heart") {
            if (game.isBossGame) return handleRetryBoss();
            return handleResetWrapper(false);
          }
          return handleResetWrapper();
        }}
        onShare={shareGame}
        onFullReset={handleFullReset}
        stats={{
          streak: progress.streak,
          streakBeforeLastLoss,
          currency: progress.currency,
          gamesPlayed: progress.gamesPlayed,
          hearts: progress.hearts,
          lastReward: progress.lastReward,
          targetWord: game.targetWord,
          targetWords: game.targetWords,
          isBossGame: game.isBossGame,
          bossType: game.bossType,
          bossWordCount: game.bossWordCount,
          boss2Count: progress.boss2Count,
          boss4Count: progress.boss4Count,
        }}
      />

      <SurvivalGuideCustomModal
        isOpen={isGuideOpen}
        onClose={() => {
          setIsGuideOpen(false);
          document.activeElement.blur();
          window.focus();
        }}
      />
    </div>
  );
}
