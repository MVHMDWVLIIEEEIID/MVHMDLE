// hooks/useSurvivalActions.js
import { useRef } from "react";
import { handleConfetti, launchBeatGameConfetti } from "../utils/confettiUtils";
import { calculateWinRewards } from "../utils/economyManager";
import { executeHintMechanic } from "../utils/hintMechanics";
import { SHAPES } from "./useWordPool"; // <-- NEW IMPORT NEEDED FOR SHARE GRID

export default function useSurvivalActions({
  game,
  progress,
  setGameResetKey,
  setIsModalOpen,
  isModalOpen,
  setStreakBeforeLastLoss,
  addToast,
  modalReadyAtRef,
}) {
  const RESULT_ANIMATION_MS = 1500;
  const MAX_HEARTS = 5;
  const transitionLockRef = useRef(false);

  const withTransitionLock = (fn) => {
    if (transitionLockRef.current) return;
    transitionLockRef.current = true;
    fn();
    setTimeout(() => {
      transitionLockRef.current = false;
    }, 400);
  };

  const handleResetWrapper = (advanceLevel = true) => {
    if (transitionLockRef.current) return;
    document.activeElement.blur();
    window.focus();
    withTransitionLock(() => {
      if (advanceLevel) game.resetGame();
      else game.retryCurrentGame();
      progress.resetRoundInfo();
      setGameResetKey((prev) => prev + 1);
      if (advanceLevel) progress.setGamesPlayed((prev) => prev + 1);
      setIsModalOpen([false, "playing"]);
    });
  };

  const handleRetryBoss = () => {
    if (transitionLockRef.current) return;
    document.activeElement.blur();
    window.focus();
    withTransitionLock(() => {
      if (game.isBossGame) {
        game.retryBoss();
        progress.resetRoundInfo();
        setGameResetKey((prev) => prev + 1);
        setIsModalOpen([false, "playing"]);
      } else {
        game.resetGame();
        progress.resetRoundInfo();
        setGameResetKey((prev) => prev + 1);
        progress.setGamesPlayed((prev) => prev + 1);
        setIsModalOpen([false, "playing"]);
      }
    });
  };

  const handleFullReset = () => {
    if (transitionLockRef.current) return;
    document.activeElement.blur();
    window.focus();
    withTransitionLock(() => {
      progress.resetAllProgress();
      game.resetAllGameData();
      setGameResetKey((prev) => prev + 1);
      setIsModalOpen([false, "playing"]);
    });
  };

  const handleGameOver = (result, guessCount) => {
    document.activeElement.blur();
    window.focus();
    const now = Date.now();

    if (result === "won" || result === "lost") {
      modalReadyAtRef.current = now + RESULT_ANIMATION_MS;
    }

    setTimeout(() => {
      if (result === "won") {
        const solvedWords = game.isBossGame ? game.bossWordCount : 1;
        progress.addWin(solvedWords);

        const rewards = calculateWinRewards({
          game,
          progress,
          guessCount,
          MAX_HEARTS,
        });

        if (game.isBossGame) {
          if (game.bossWordCount === 2)
            progress.setBoss2Count(rewards.newBoss2Count);
          if (game.bossWordCount === 4)
            progress.setBoss4Count(rewards.newBoss4Count);
          if (game.bossWordCount === 1)
            progress.setBoss500Count(rewards.newBoss500Count);
          progress.setHearts(rewards.newHearts);
        }

        progress.setCurrency((prev) => prev + rewards.grandTotal);
        progress.setLastReward({
          total: rewards.grandTotal,
          breakdown: rewards.breakdown,
        });
        progress.setStreak((prev) => prev + 1);

        setIsModalOpen([true, "won"]);
        handleConfetti();

        progress.setHintHistory((prev) => [
          ...prev,
          {
            type: "game-marker",
            result: "won",
            gameCount: progress.gamesPlayed,
          },
        ]);
      } else if (result === "lost") {
        setStreakBeforeLastLoss(progress.streak);
        progress.addLoss();

        const newHearts = Math.max(0, progress.hearts - 1);
        progress.setHearts(newHearts);
        progress.setStreak(0);

        progress.setHintHistory((prev) => [
          ...prev,
          {
            type: "game-marker",
            result: "lost",
            gameCount: progress.gamesPlayed,
          },
        ]);

        if (newHearts <= 0) setIsModalOpen([true, "game-over"]);
        else setIsModalOpen([true, "lost-heart"]);
      }
    }, RESULT_ANIMATION_MS);

    if (result === "won-already" && now >= modalReadyAtRef.current)
      setIsModalOpen([true, "won"]);
    else if (result === "lost-already" && now >= modalReadyAtRef.current) {
      if (progress.hearts <= 0) setIsModalOpen([true, "game-over"]);
      else setIsModalOpen([true, "lost-heart"]);
    }
  };

  const handleBuyHint = (name, cost) => {
    document.activeElement.blur();
    window.focus();

    if (progress.currency < cost) return addToast("Not enough cash!", "error");

    const usedCount = progress.hintsUsedInRound[name] || 0;
    if (name === "Hide a Letter" && usedCount >= 5)
      return addToast("Max usage reached!", "error");
    if (
      ["Green Letter", "Yellow Letter", "Vowel Letter"].includes(name) &&
      usedCount >= 1
    )
      return addToast("Already used this round!", "error");

    const { success, logMsg } = executeHintMechanic(
      name,
      game,
      progress,
      addToast,
      launchBeatGameConfetti,
      MAX_HEARTS,
    );

    if (success) {
      progress.setCurrency((prev) => prev - cost);
      progress.setHintsArray((prev) => ({
        ...prev,
        [name]: { ...prev[name], bought: (prev[name].bought || 0) + 1 },
      }));
      progress.setHintsUsedInRound((prev) => ({
        ...prev,
        [name]: (prev[name] || 0) + 1,
      }));

      if (name !== "Heart") {
        progress.setHintHistory((prev) => [
          ...prev,
          { name, msg: logMsg, spent: cost, time: Date.now() },
        ]);
      }
      if (name === "Beat The Game") {
        progress.setRunCompleted(true);
        setIsModalOpen([false, "playing"]);
      }
    }
  };

  // --- FULLY REPAIRED SHARE LOGIC ---
  async function shareGame() {
    document.activeElement.blur();
    window.focus();

    if (game.guesses.length === 0) return;

    if (game.isBossGame) {
      if (game.bossCategory === "shape") {
        // --- SHAPE BOSS SHARE ---
        const shapeDef = SHAPES[game.bossType];
        const grid = shapeDef
          .map((rowArr, rowIndex) => {
            // If the player successfully submitted this row
            if (rowIndex < game.guesses.length) {
              return rowArr
                .map((c) => (c === "G" ? "🟩" : c === "Y" ? "🟨" : "⬛"))
                .join("");
            } else {
              // Unreached rows
              return "⬛⬛⬛⬛⬛";
            }
          })
          .join("\n");

        const streakText =
          progress.streak > 3 ? `${progress.streak} 🔥` : `${progress.streak}`;
        const score = isModalOpen[1] === "won" ? "WIN" : "FAIL";
        const shareText = `[MVHMDLE](https://wordle.mvhmd.dev/) SHAPE BOSS - ${score}\n\n${grid}\n\nStreak: ${streakText}\nTotal: $${progress.currency.toLocaleString()}`;

        try {
          await navigator.clipboard.writeText(shareText);
          addToast("Copied!", "success");
        } catch (err) {
          addToast("Failed to copy", "error");
        }
        return;
      }

      // --- MULTI-WORD BOSS SHARE ---
      const gridsByWord = game.targetWords.map((word, wordIdx) => {
        const wordGuesses = game.guesses.filter((g) => g.wordIndex === wordIdx);
        return wordGuesses.map((guessObj) => {
          const splitSolution = word.toLowerCase().split("");
          const splitGuess = guessObj.word.toLowerCase().split("");
          const statuses = Array(5).fill("⬛");

          splitGuess.forEach((char, i) => {
            if (char === splitSolution[i]) {
              statuses[i] = "🟩";
              splitSolution[i] = null;
            }
          });
          splitGuess.forEach((char, i) => {
            if (statuses[i] === "⬛") {
              const idx = splitSolution.indexOf(char);
              if (idx !== -1) {
                statuses[i] = "🟨";
                splitSolution[idx] = null;
              }
            }
          });
          return statuses.join("");
        });
      });

      const maxRows = Math.max(0, ...gridsByWord.map((rows) => rows.length));
      const allGrids = Array.from({ length: maxRows }, (_, rowIdx) =>
        gridsByWord.map((rows) => rows[rowIdx] || "          ").join("   "),
      ).join("\n");

      const streakText =
        progress.streak > 3 ? `${progress.streak} 🔥` : `${progress.streak}`;
      const shareText = `[MVHMDLE](https://wordle.mvhmd.dev/) BOSS (${game.bossWordCount} words)\n\n${allGrids}\n\nStreak: ${streakText}\nTotal: $${progress.currency.toLocaleString()}`;

      try {
        await navigator.clipboard.writeText(shareText);
        addToast("Copied!", "success");
      } catch (err) {
        addToast("Failed to copy", "error");
      }
    } else {
      // --- STANDARD GAME SHARE ---
      const grid = game.guesses
        .map((guess) => {
          const splitSolution = game.targetWord.toLowerCase().split("");
          // Guesses could be strings (survival) or objects (multi/wordle500 inside wrapper)
          const splitGuess =
            typeof guess === "string"
              ? guess.toLowerCase().split("")
              : guess.word.toLowerCase().split("");
          const statuses = Array(5).fill("⬛");

          splitGuess.forEach((char, i) => {
            if (char === splitSolution[i]) {
              statuses[i] = "🟩";
              splitSolution[i] = null;
            }
          });
          splitGuess.forEach((char, i) => {
            if (statuses[i] === "⬛") {
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

      const score = isModalOpen[1] === "won" ? game.guesses.length : "X";
      const streakText =
        progress.streak > 3 ? `${progress.streak} 🔥` : `${progress.streak}`;
      const shareText = `[MVHMDLE](https://wordle.mvhmd.dev/) ${score}/${game.maxTurns}\n\n${grid}\n\nStreak: ${streakText}\nTotal: $${progress.currency.toLocaleString()}`;

      try {
        await navigator.clipboard.writeText(shareText);
        addToast("Copied!", "success");
      } catch (err) {
        addToast("Failed to copy", "error");
      }
    }
  }

  return {
    handleResetWrapper,
    handleRetryBoss,
    handleFullReset,
    handleGameOver,
    handleBuyHint,
    shareGame,
  };
}
