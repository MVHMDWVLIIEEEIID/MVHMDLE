// pages/Daily.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import Header from "../components/Header";
import Keyboard from "../components/Keyboard";
import Tiles from "../components/Tiles";
import DailyGameModals from "../components/DailyGameModals";
import DailyGuideModal from "../components/DailyGuideModal"; // <-- Added Guide Modal
import useDailyGame from "../hooks/useDailyGame";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import { handleConfetti } from "../utils/confettiUtils";
import GameBoardLayout from "../components/GameBoardLayout";

export default function Daily({ mode = "daily" }) {
  const navigate = useNavigate();
  const game = useDailyGame(mode);
  const { toasts, addToast } = useToast();

  const [isGuideOpen, setIsGuideOpen] = useState(false); // <-- Track Guide State

  const [isModalOpen, setIsModalOpen] = useState(() => {
    if (game.gameState === "won") return [true, "won"];
    if (game.gameState === "lost") return [true, "lost"];
    return [false, "playing"];
  });
  const modalReadyAtRef = useRef(0);
  const RESULT_ANIMATION_MS = 1500;

  useEffect(() => {
    if (game.gameState === "playing") {
      setIsModalOpen([false, "playing"]);
    }
  }, [game.gameState, game.todayString]);

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
          setIsModalOpen([true, "won"]);
          handleConfetti();
        } else if (result === "lost") {
          setIsModalOpen([true, "lost"]);
        }
      }, RESULT_ANIMATION_MS);
    }
  };

  const handleShare = async () => {
    if (game.guesses.length === 0) return;
    const grid = game.guesses
      .map((guess) => {
        const splitSolution = game.targetWord.toLowerCase().split("");
        const splitGuess = guess.toLowerCase().split("");
        const statuses = Array(5).fill("⬛");

        splitGuess.forEach((char, i) => {
          if (char === splitSolution[i]) {
            statuses[i] = "🟩";
            splitSolution[i] = null;
          }
        });

        splitGuess.forEach((char, i) => {
          if (statuses[i] !== "🟩") {
            const idx = splitSolution.indexOf(char);
            if (idx !== -1) {
              statuses[i] = "🟨";
              splitSolution[idx] = null;
            }
          }
        });

        return statuses.join("");
      })
      .join("\n");

    const score = game.gameState === "won" ? game.guesses.length : "X";
    const shareText = `[MVHMDLE](https://wordle.mvhmd.dev/) DAILY ${score}/6\n\n${grid}\n\nStreak: ${game.streak}${game.streak > 3 ? " 🔥" : ""}`;

    try {
      await navigator.clipboard.writeText(shareText);
      addToast("Copied!", "success");
    } catch (err) {
      addToast("Failed to copy", "error");
    }
  };

  return (
    <div className="flex flex-col h-screen relative overflow-hidden bg-gameDark text-white">
      <Toast toasts={toasts} />
      <div className="flex-1 center flex-col">
        <Header
          mode="DAILY CHALLENGE"
          onModeClick={() => navigate("/")}
          streak={game.streak > 3 ? `${game.streak} 🔥` : game.streak}
        />
      </div>

      <GameBoardLayout
        boardContainerClass="w-96"
        board={
          <Tiles
            guesses={game.guesses}
            turn={game.turn}
            targetWord={game.targetWord}
            gameState={game.gameState}
            onGuessSubmit={(g) => game.submitGuess(g, handleGameOver)}
            onGameOver={handleGameOver}
            addToast={addToast}
          />
        }
        keyboard={
          <Keyboard letters={game.letters} lastChanged={game.lastChanged} />
        }
      />

      {/* Guide Button FAB - Right Aligned & Blue */}
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

      {/* Daily Mode Guide Modal */}
      <DailyGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <DailyGameModals
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen([false, isModalOpen[1]]);
          document.activeElement.blur();
          window.focus();
        }}
        onShare={handleShare}
        stats={{
          targetWord: game.targetWord,
          streak: game.streak,
          guesses: game.guesses,
        }}
      />
    </div>
  );
}
