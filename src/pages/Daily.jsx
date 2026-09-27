import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Header from "../components/Header";
import Keyboard from "../components/Keyboard";
import Tiles from "../components/Tiles";
import DailyGameModals from "../components/DailyGameModals";
import useDailyGame from "../hooks/useDailyGame";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import { handleConfetti } from "../utils/confettiUtils";
import GameBoardLayout from "../components/GameBoardLayout";

export default function Daily({ mode = "daily" }) {
  const navigate = useNavigate();
  const game = useDailyGame(mode);
  const { toasts, addToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(() => {
    if (game.gameState === "won") return [true, "won"];
    if (game.gameState === "lost") return [true, "lost"];
    return [false, "playing"];
  });

  useEffect(() => {
    if (game.gameState === "playing") {
      setIsModalOpen([false, "playing"]);
    }
  }, [game.gameState, game.todayString]);

  const handleGameOver = (result) => {
    setTimeout(() => {
      if (result === "won") {
        setIsModalOpen([true, "won"]);
        handleConfetti();
      } else if (result === "lost") {
        setIsModalOpen([true, "lost"]);
      }
    }, 1500);
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
            onGameOver={(res) => {
              if (res === "won-already" || res === "lost-already") {
                setIsModalOpen([true, game.gameState]);
              }
            }}
            addToast={addToast}
          />
        }
        keyboard={
          <Keyboard letters={game.letters} lastChanged={game.lastChanged} />
        }
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
        }}
      />
    </div>
  );
}
