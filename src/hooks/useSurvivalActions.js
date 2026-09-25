import { useRef } from "react";
import confetti from "canvas-confetti";

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

  const handleConfetti = () => {
    const end = Date.now() + 3000;
    const colors = ["#ed143d", "#3498db", "#ffd500", "#00e196"];
    const frame = () => {
      if (Date.now() > end) return;
      confetti({
        particleCount: 4,
        angle: 90,
        spread: 75,
        origin: { x: 0, y: 0.75 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 90,
        spread: 75,
        origin: { x: 1, y: 0.75 },
        colors,
      });
      requestAnimationFrame(frame);
    };
    frame();
  };

  const launchBeatGameConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
      colors: ["#00e196", "#ffd500", "#3498db", "#ed143d"],
    };
    const randomInRange = (min, max) => Math.random() * (max - min) + min;
    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
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
        const unusedRows = game.maxTurns - guessCount;

        let BASE_WIN = 3000;
        let bossBase = 0;
        let bossBonus = 0;
        let heartAdded = false;
        let heartCashBonus = 0;

        if (game.isBossGame) {
          if (game.bossWordCount === 2) {
            bossBase = 10000;
            bossBonus = 2000 * (1 + (progress.boss2Count || 0));
            progress.setBoss2Count((c) => (c || 0) + 1);
          } else if (game.bossWordCount === 4) {
            bossBase = 16000;
            bossBonus = 4000 * (1 + (progress.boss4Count || 0));
            progress.setBoss4Count((c) => (c || 0) + 1);
            heartAdded = progress.hearts < MAX_HEARTS;
            if (heartAdded)
              progress.setHearts((h) => Math.min(MAX_HEARTS, h + 1));
            else heartCashBonus = 50000;
          }
        }

        const SPEED_BONUS = unusedRows * 1000;
        const STREAK_BONUS = (progress.streak + 1) * 150;
        const totalEarned = bossBase + bossBonus || BASE_WIN;
        const grandTotal = game.isBossGame
          ? totalEarned +
            2000 *
              (game.bossWordCount === 2
                ? game.boss2Count || 0
                : game.bossWordCount === 4
                  ? game.boss4Count || 0
                  : 0) +
            STREAK_BONUS +
            heartCashBonus
          : totalEarned + SPEED_BONUS + STREAK_BONUS;

        progress.setCurrency((prev) => prev + grandTotal);
        progress.setLastReward({
          total: grandTotal,
          breakdown: {
            base: bossBase || BASE_WIN,
            bonus: bossBonus || 0,
            speed: SPEED_BONUS,
            streak: STREAK_BONUS,
            unusedCount: unusedRows,
            heartAdded,
            heartCashBonus,
          },
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

    let success = false;
    let logMsg = "";

    if (name === "Heart") {
      if (progress.hearts >= MAX_HEARTS)
        return addToast("Hearts are already full!", "info");
      progress.setHearts((h) => Math.min(MAX_HEARTS, h + 1));
      success = true;
      addToast("Extra Life Purchased ❤️", "success");
    } else if (name === "Row") {
      game.addExtraRow();
      success = true;
      logMsg = "Added Extra Row!";
      addToast("Row Added!", "success");
    } else if (name === "Beat The Game") {
      success = true;
      logMsg = "GAME BEATEN!";
      launchBeatGameConfetti();
    } else {
      const solutionArr = game.targetWord.toLowerCase().split("");
      if (name === "Green Letter") {
        let unknownIndices = [];
        solutionArr.forEach((_, i) => {
          let known = false;
          game.guesses.forEach((g) => {
            if (g[i] === solutionArr[i]) known = true;
          });
          if (!known) unknownIndices.push(i);
        });
        if (unknownIndices.length > 0) {
          const revealIdx =
            unknownIndices[Math.floor(Math.random() * unknownIndices.length)];
          const char = solutionArr[revealIdx];
          logMsg = `Position ${revealIdx + 1} is '${char.toUpperCase()}'`;
          game.changeColor("bg-gameGreen", char);
          success = true;
          addToast(`Revealed: ${char.toUpperCase()}`, "success");
        } else addToast("All letters known!", "info");
      } else if (name === "Yellow Letter") {
        const candidates = solutionArr.filter(
          (c) =>
            !game.letters[c].color.includes("bg-gameGreen") &&
            !game.letters[c].color.includes("bg-gameYellow"),
        );
        if (candidates.length > 0) {
          const char =
            candidates[Math.floor(Math.random() * candidates.length)];
          logMsg = `Word contains '${char.toUpperCase()}'`;
          game.changeColor("bg-gameYellow", char);
          success = true;
          addToast(`Word has: ${char.toUpperCase()}`, "success");
        } else addToast("No hidden yellow letters!", "info");
      } else if (name === "Hide a Letter") {
        const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
        const candidates = alphabet.filter(
          (c) =>
            !solutionArr.includes(c) &&
            !game.letters[c].color.includes("bg-gameGrey"),
        );
        if (candidates.length > 0) {
          const char =
            candidates[Math.floor(Math.random() * candidates.length)];
          game.changeColor("bg-gameGrey", char);
          logMsg = `Removed: ${char.toUpperCase()}`;
          success = true;
          addToast(`Removed ${char.toUpperCase()}`, "success");
        } else addToast("No more to hide!", "info");
      } else if (name === "Vowel Letter") {
        const vowels = ["a", "e", "i", "o", "u"];
        const present = vowels.filter((v) => game.targetWord.includes(v));
        logMsg =
          present.length > 0
            ? `Contains: ${present[0].toUpperCase()}`
            : "No vowels in word!";
        addToast(
          present.length > 0
            ? `Vowel: ${present[0].toUpperCase()}`
            : "No vowels found!",
          "info",
        );
        success = true;
      }
    }

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
      if (name !== "Heart")
        progress.setHintHistory((prev) => [
          ...prev,
          { name, msg: logMsg, spent: cost, time: Date.now() },
        ]);
      if (name === "Beat The Game") {
        progress.setRunCompleted(true);
        setIsModalOpen([false, "playing"]);
      }
    }
  };

  async function shareGame() {
    document.activeElement.blur();
    window.focus();
    if (game.guesses.length === 0) return;

    if (game.isBossGame) {
      const gridsByWord = game.targetWords.map((word, wordIdx) => {
        const wordGuesses = game.guesses.filter((g) => g.wordIndex === wordIdx);
        return wordGuesses.map((guessObj) => {
          const splitSolution = word.toLowerCase().split("");
          const splitGuess = guessObj.word.toLowerCase().split("");
          const statuses = Array(5).fill("\u2B1B");
          splitGuess.forEach((char, i) => {
            if (char === splitSolution[i]) {
              statuses[i] = "\uD83D\uDFE9";
              splitSolution[i] = null;
            }
          });
          splitGuess.forEach((char, i) => {
            if (statuses[i] !== "\uD83D\uDFE9") {
              const idx = splitSolution.indexOf(char);
              if (idx !== -1) {
                statuses[i] = "\uD83D\uDFE8";
                splitSolution[idx] = null;
              }
            }
          });
          return statuses.join("");
        });
      });

      const maxRows = Math.max(0, ...gridsByWord.map((rows) => rows.length));
      const allGrids = Array.from({ length: maxRows }, (_, rowIdx) =>
        gridsByWord
          .map((rows) => rows[rowIdx] || "\u2B1B\u2B1B\u2B1B\u2B1B\u2B1B")
          .join("   "),
      ).join("\n");

      const streakText =
        progress.streak > 3
          ? `${progress.streak} \uD83D\uDD25`
          : `${progress.streak}`;
      const shareText = `[MVHMDLE](https://wordle.mvhmd.dev/) BOSS (${game.bossWordCount} words)\n\n${allGrids}\n\nStreak: ${streakText}\nTotal: $${progress.currency.toLocaleString()} \uD83D\uDCB0`;
      await navigator.clipboard.writeText(shareText);
    } else {
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

      const score = isModalOpen[1] === "won" ? game.guesses.length : "X";
      const shareText = `[MVHMDLE](https://wordle.mvhmd.dev/) ${score}/${game.maxTurns}\n\n${grid}\n\nStreak: ${progress.streak}${progress.streak > 3 ? " 🔥" : ""}\nTotal: $${progress.currency.toLocaleString()} 💰`;
      await navigator.clipboard.writeText(shareText);
    }
    addToast("Copied!", "success");
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
