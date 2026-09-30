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

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideInitialTab, setGuideInitialTab] = useState("basics");
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

  // --- AUTO-OPEN GUIDE ON FIRST EVER ENCOUNTER ---
  useEffect(() => {
    if (game.gameState !== "playing" || progress.runCompleted) return;

    if (game.isBossGame || game.isMiniBossGame) {
      let tabId =
        game.bossCategory === "shape"
          ? "shapedle"
          : game.bossCategory === "rapidle"
            ? "rapidle"
            : game.bossType;

      if (tabId && !progress.seenBossGuides[tabId]) {
        progress.setSeenBossGuides((prev) => ({ ...prev, [tabId]: true }));
        setGuideInitialTab(tabId);
        setIsGuideOpen(true);
      }
    } else {
      if (!progress.seenBossGuides["basics"]) {
        progress.setSeenBossGuides((prev) => ({ ...prev, basics: true }));
        setGuideInitialTab("basics");
        setIsGuideOpen(true);
      }
    }
  }, [
    game.isBossGame,
    game.isMiniBossGame,
    game.bossCategory,
    game.bossType,
    game.gameCount,
    game.gameState,
    progress.runCompleted,
  ]);

  useEffect(() => {
    const handleSysEvent = (e) => {
      if (!progress.bonusClaimed) {
        e.detail.handled = true;
        progress.setBonusClaimed(true);
        progress.setHearts(5);
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

  const isRapidleWarningOpen =
    game.isBossGame &&
    game.bossCategory === "rapidle" &&
    !progress.hasSeenRapidleWarning &&
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
          isBombTimerPaused={isBombWarningOpen || isGuideOpen}
          isRapidleTimerPaused={isRapidleWarningOpen || isGuideOpen}
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
          isPaused={isGuideOpen}
        />
      )}

      <div className="absolute bottom-4 right-4 z-40 flex flex-col items-end">
        <button
          onClick={() => {
            setGuideInitialTab("basics");
            setIsGuideOpen(true);
            document.activeElement.blur();
            window.focus();
          }}
          className="flex flex-col items-center justify-center w-16 h-16 bg-gameBlue/90 hover:bg-gameBlue text-gameDark border-2 border-gameBlue rounded-2xl transition-all active:scale-95"
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

      {import.meta.env.DEV && (
        <div className="dropdown dropdown-bottom dropdown-end absolute top-15 right-4 z-50">
          <div
            tabIndex={0}
            role="button"
            className="flex items-center justify-center w-10 h-10 bg-gameRed hover:opacity-100 opacity-75 text-black hover:text-gameDark border border-gameRed/30 rounded-xl transition-all active:scale-95"
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
            className="dropdown-content menu mt-3 p-2 bg-[#0a0a0a] border-2 border-gameRed/30 rounded-2xl w-48 gap-1.5 z-[100]"
          >
            <li>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-gameRed hover:bg-gameRed/20 py-2.5 justify-center text-center w-full"
              >
                Wipe Data
              </button>
            </li>
            <li>
              <button
                onClick={() => generateAndLogBombPhrases()}
                className="text-[10px] font-bold uppercase tracking-widest text-white/70 hover:bg-white/10 hover:text-white py-2.5 justify-center text-center w-full"
              >
                Log Bomb Phrases
              </button>
            </li>
            <li>
              <button
                onClick={() => generateAndLogShapeData()}
                className="text-[10px] font-bold uppercase tracking-widest text-gameGreen hover:bg-gameGreen/20 py-2.5 justify-center text-center w-full"
              >
                Log Shapes JSON
              </button>
            </li>
            <li>
              <button
                onClick={() => generateAndLogUniqueWords()}
                className="text-[10px] font-bold uppercase tracking-widest text-gameBlue hover:bg-gameBlue/20 py-2.5 justify-center text-center w-full"
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
                className="text-[10px] font-bold uppercase tracking-widest text-gameYellow hover:bg-gameYellow/20 py-2.5 justify-center text-center w-full"
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
                className="text-[10px] font-bold uppercase tracking-widest text-gameGreen hover:bg-gameGreen/20 py-2.5 justify-center text-center w-full"
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
      <WarningModal
        isOpen={isRapidleWarningOpen}
        onClose={() => {
          progress.setHasSeenRapidleWarning(true);
          document.activeElement.blur();
          window.focus();
        }}
        title="RAPIDLE DETECTED"
        message="Type as many valid 5-letter words as you can in 10 seconds. GO FAST!"
        buttonText="Start Typing"
        theme="warning"
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
        initialTab={guideInitialTab}
        bannedWords={game.bannedOpeningWords}
        onClose={() => {
          setIsGuideOpen(false);
          document.activeElement.blur();
          window.focus();
        }}
      />
    </div>
  );
}
