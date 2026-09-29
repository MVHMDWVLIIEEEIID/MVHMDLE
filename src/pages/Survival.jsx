// pages/Survival.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { secureStorage } from "../utils/secureStorage";
import {
  generateAndLogShapeData,
  generateAndLogUniqueWords,
  generateAndLogBombPhrases,
} from "../utils/shapeBuilder";

// Components
import Header from "../components/Header";
import Toast from "../components/Toast";
import SurvivalGuideCustomModal from "../components/SurvivalGuideCustomModal";
import SurvivalVictoryStats from "../components/SurvivalVictoryStats";
import SurvivalGameModals from "../components/SurvivalGameModals";
import StandardGameView from "../components/StandardGameView";
import BossGameView from "../components/BossGameView";
import ShapeDictionaryModal from "../components/ShapeDictionaryModal";
import WarningModal from "../components/WarningModal";

// Hooks
import useSurvivalGame from "../hooks/useSurvivalGame";
import useSurvivalProgress from "../hooks/useSurvivalProgress";
import useBossMechanics from "../hooks/useBossMechanics";
import useSurvivalActions from "../hooks/useSurvivalActions";
import useToast from "../hooks/useToast";

export default function Survival({ mode = "survival" }) {
  const navigate = useNavigate();
  const { toasts, addToast } = useToast();
  const [gameResetKey, setGameResetKey] = useState(0);
  const [streakBeforeLastLoss, setStreakBeforeLastLoss] = useState(0);
  const modalReadyAtRef = useRef(0);

  const GUIDE_SEEN_KEY = `wordle-survival-guide-seen-${mode}`;
  const [isGuideOpen, setIsGuideOpen] = useState(
    () => !secureStorage.getItem(GUIDE_SEEN_KEY, false),
  );
  const [isShapeModalOpen, setIsShapeModalOpen] = useState(false);

  const game = useSurvivalGame(mode);
  const progress = useSurvivalProgress(mode);

  const [isModalOpen, setIsModalOpen] = useState(() => {
    if (game.gameState === "won") return [true, "won"];
    if (game.gameState === "lost")
      return progress.hearts <= 0 ? [true, "game-over"] : [true, "lost-heart"];
    return [false, "playing"];
  });

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
    const handleSysEvent = (e) => {
      if (!progress.bonusClaimed) {
        e.detail.handled = true;
        progress.setBonusClaimed(true);
        progress.setHearts((h) => Math.min(5, h + 1));
        addToast(atob("SGVhcnQgcmVkZWVtZWQ="), "special");
        window.dispatchEvent(new CustomEvent("sys-particles"));
      }
    };
    window.addEventListener("sys-fx-11", handleSysEvent);
    return () => window.removeEventListener("sys-fx-11", handleSysEvent);
  }, [
    progress.bonusClaimed,
    progress.setHearts,
    progress.setBonusClaimed,
    addToast,
  ]);

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

  const isBombWarningOpen =
    game.isBossGame &&
    game.bossCategory === "bomb" &&
    !progress.hasSeenBombWarning &&
    game.gameState === "playing";

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

      {game.isBossGame || game.isMiniBossGame ? (
        <BossGameView
          game={game}
          progress={progress}
          gameResetKey={gameResetKey}
          bossKeyboardView={bossKeyboardView}
          setBossKeyboardView={setBossKeyboardView}
          bossKeyboardLineColors={bossKeyboardLineColors}
          handleGameOver={handleGameOver}
          addToast={addToast}
          isBombTimerPaused={isBombWarningOpen}
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

      {/* LEFT: Guide Button */}
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

      {/* RIGHT: Debug FAB Menu (Only visible in Development) */}
      {import.meta.env.DEV && (
        <div className="dropdown dropdown-top dropdown-end absolute bottom-16 right-4 z-50">
          <div
            tabIndex={0}
            role="button"
            className="flex items-center justify-center w-10 h-10 bg-gameRed/20 hover:bg-gameRed text-gameRed hover:text-gameDark border border-gameRed/30 rounded-xl transition-all shadow-lg active:scale-95"
            title="Debug Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <path d="M12 12v.01" />
              <path d="M19 9h-2" />
              <path d="M7 9H5" />
              <path d="M19 14h-2" />
              <path d="M7 14H5" />
              <path d="M12 22c-3.31 0-6-2.69-6-6V9a6 6 0 0 1 12 0v7c0 3.31-2.69 6-6 6z" />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu mb-3 p-2 shadow-[0_0_20px_rgba(255,0,0,0.15)] bg-[#0a0a0a] border-2 border-gameRed/30 rounded-2xl w-48 gap-1.5 z-[100]"
          >
            <li>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-gameRed hover:bg-gameRed/20 py-2.5"
              >
                Wipe Data
              </button>
            </li>
            <li>
              <button
                onClick={() => generateAndLogBombPhrases()}
                className="text-[10px] font-bold uppercase tracking-widest text-white/70 hover:bg-white/10 hover:text-white py-2.5"
              >
                Log Bomb Phrases
              </button>
            </li>
            <li>
              <button
                onClick={() => generateAndLogShapeData()}
                className="text-[10px] font-bold uppercase tracking-widest text-gameGreen hover:bg-gameGreen/20 py-2.5"
              >
                Log Shapes JSON
              </button>
            </li>
            <li>
              <button
                onClick={() => generateAndLogUniqueWords()}
                className="text-[10px] font-bold uppercase tracking-widest text-gameBlue hover:bg-gameBlue/20 py-2.5"
              >
                Log Words JSON
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setIsShapeModalOpen(true);
                  document.activeElement.blur();
                  window.focus();
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-gameYellow hover:bg-gameYellow/20 py-2.5"
              >
                Shapes Dict
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  progress.setCurrency((prev) => prev + 1000000);
                  addToast("Added $1,000,000!", "success");
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-gameGreen hover:bg-gameGreen/20 py-2.5"
              >
                +1M Cash
              </button>
            </li>
          </ul>
          <ShapeDictionaryModal
            isOpen={isShapeModalOpen}
            onClose={() => {
              setIsShapeModalOpen(false);
              document.activeElement.blur();
              window.focus();
            }}
          />
        </div>
      )}

      {/* --- The Warning Modal --- */}
      <WarningModal
        isOpen={isBombWarningOpen}
        onClose={() => {
          progress.setHasSeenBombWarning(true);
          document.activeElement.blur();
          window.focus();
        }}
        title="BOMBEDLE DETECTED"
        message="Defuse the bomb before time runs out! Each correct guess requires the target phrase."
        buttonText="Roger That"
        theme="danger"
      />

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
            if (game.isBossGame || game.isMiniBossGame)
              return handleRetryBoss();
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
          guesses: game.guesses,
          bombPhrases: game.bombPhrases,
          isBossGame: game.isBossGame || game.isMiniBossGame,
          bossCategory: game.bossCategory,
          bossType: game.bossType,
          bossWordCount: game.bossWordCount,
          boss2Count: progress.boss2Count,
          boss4Count: progress.boss4Count,
          boss500Count: progress.boss500Count,
          isCycleComplete:
            (game.playedBossTypes?.length || 0) > 0 &&
            (game.playedBossTypes?.length || 0) === (game.totalBossTypes || 3),
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
