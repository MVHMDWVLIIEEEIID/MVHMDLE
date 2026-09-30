// hooks/useBossMechanics.js
import { useState, useRef, useLayoutEffect, useEffect } from "react";

export default function useBossMechanics(game) {
  const BOSS_KEY_REVEAL_START_MS = 300;
  const BOSS_KEY_REVEAL_STEP_MS = 150;
  const BOSS_TILE_REVEAL_TOTAL_MS = 1300;

  const [bossRevealProgress, setBossRevealProgress] = useState({
    rowNumber: -1,
    revealedCount: 5,
  });

  const [bossKeyboardView, setBossKeyboardView] = useState("all");
  const bossRevealTimersRef = useRef([]);
  const bossFocusTimerRef = useRef(null);
  const previousBossSolvedRef = useRef(null);
  const prevBossGuessesLenRef = useRef(0);
  const bossRevealInitializedRef = useRef(false);

  // --- Reveal Animation Logic ---
  useLayoutEffect(() => {
    const clearTimers = () => {
      bossRevealTimersRef.current.forEach((t) => clearTimeout(t));
      bossRevealTimersRef.current = [];
    };

    if (!game.isBossGame || game.bossWordCount <= 1) {
      clearTimers();
      setBossRevealProgress({ rowNumber: -1, revealedCount: 5 });
      prevBossGuessesLenRef.current = 0;
      bossRevealInitializedRef.current = false;
      return;
    }

    const currentLen = game.guesses.length;

    if (!bossRevealInitializedRef.current) {
      bossRevealInitializedRef.current = true;
      prevBossGuessesLenRef.current = currentLen;
      setBossRevealProgress({ rowNumber: -1, revealedCount: 5 });
      return;
    }

    const prevLen = prevBossGuessesLenRef.current;
    prevBossGuessesLenRef.current = currentLen;

    if (currentLen <= prevLen || currentLen === 0) {
      clearTimers();
      setBossRevealProgress({ rowNumber: -1, revealedCount: 5 });
      return;
    }

    const latestRowNumber = game.guesses.reduce((max, g) => {
      if (typeof g?.rowNumber === "number") return Math.max(max, g.rowNumber);
      return max;
    }, -1);

    if (latestRowNumber < 0) return;

    clearTimers();
    setBossRevealProgress({ rowNumber: latestRowNumber, revealedCount: 0 });

    let step = 0;
    const startTimer = setTimeout(() => {
      step = 1;
      setBossRevealProgress({ rowNumber: latestRowNumber, revealedCount: 1 });

      const interval = setInterval(() => {
        step += 1;
        if (step > 5) {
          clearInterval(interval);
          setBossRevealProgress({ rowNumber: -1, revealedCount: 5 });
          return;
        }
        setBossRevealProgress({
          rowNumber: latestRowNumber,
          revealedCount: step,
        });
      }, BOSS_KEY_REVEAL_STEP_MS);
      bossRevealTimersRef.current.push(interval);
    }, BOSS_KEY_REVEAL_START_MS);

    bossRevealTimersRef.current.push(startTimer);
    return clearTimers;
  }, [game.guesses, game.isBossGame, game.bossWordCount]);

  // --- Focus View Logic ---
  useEffect(() => {
    if (!game.isBossGame || game.bossWordCount <= 1) {
      setBossKeyboardView("all");
      return;
    }
    if (
      bossKeyboardView !== "all" &&
      (bossKeyboardView < 0 || bossKeyboardView >= game.bossWordCount)
    ) {
      setBossKeyboardView("all");
    }
  }, [game.isBossGame, game.bossWordCount, bossKeyboardView]);

  useEffect(() => {
    if (!game.isBossGame || game.bossWordCount <= 1) {
      if (bossFocusTimerRef.current) clearTimeout(bossFocusTimerRef.current);
      previousBossSolvedRef.current = null;
      return;
    }

    const solvedWords = game.targetWords.map((word, wordIdx) =>
      game.guesses.some(
        (guess) =>
          guess.word === word?.toLowerCase() && guess.wordIndex === wordIdx,
      ),
    );

    const previousSolvedWords = previousBossSolvedRef.current;
    const focusedWordWasSolved =
      typeof bossKeyboardView === "number" &&
      previousSolvedWords &&
      !previousSolvedWords[bossKeyboardView] &&
      solvedWords[bossKeyboardView];

    previousBossSolvedRef.current = solvedWords;

    if (solvedWords.every(Boolean)) {
      if (bossKeyboardView === "all") return;
      if (bossFocusTimerRef.current) clearTimeout(bossFocusTimerRef.current);
      bossFocusTimerRef.current = setTimeout(() => {
        setBossKeyboardView("all");
        bossFocusTimerRef.current = null;
      }, BOSS_TILE_REVEAL_TOTAL_MS);
      return;
    }

    if (!focusedWordWasSolved) return;

    if (bossFocusTimerRef.current) clearTimeout(bossFocusTimerRef.current);
    bossFocusTimerRef.current = setTimeout(() => {
      const nextUnsolvedWord = solvedWords.findIndex((isSolved) => !isSolved);
      setBossKeyboardView(nextUnsolvedWord === -1 ? "all" : nextUnsolvedWord);
      bossFocusTimerRef.current = null;
    }, BOSS_TILE_REVEAL_TOTAL_MS);
  }, [
    game.guesses,
    game.targetWords,
    game.isBossGame,
    game.bossWordCount,
    bossKeyboardView,
  ]);

  // --- Derived State: Line Colors ---
  const getBossKeyboardLineColors = () => {
    if (!game.isBossGame || game.bossWordCount <= 1) return {};

    const isRevealLocked = bossRevealProgress.rowNumber >= 0;
    const latestRowNumber = bossRevealProgress.rowNumber;
    const revealedCount = bossRevealProgress.revealedCount;

    const visibleWordIndices =
      bossKeyboardView === "all"
        ? Array.from({ length: game.bossWordCount }, (_, idx) => idx)
        : [bossKeyboardView];

    const keyMap = {};
    Object.keys(game.letters).forEach((key) => {
      keyMap[key] = Array(visibleWordIndices.length).fill("bg-gameLight");
    });

    visibleWordIndices.forEach((wordIdx, segmentIdx) => {
      const targetWord = game.targetWords[wordIdx];
      if (!targetWord) return;

      const solution = targetWord.toLowerCase();

      Object.keys(game.letters).forEach((key) => {
        const letter = key.toLowerCase();
        if (!/^[a-z]$/.test(letter)) return;

        const globalColor = game.letters[key].color;
        const isGuessedGlobally = !globalColor.includes("bg-gameLight");

        if (!solution.includes(letter)) {
          if (isGuessedGlobally) {
            keyMap[key][segmentIdx] = "bg-gameGrey";
          } else {
            keyMap[key][segmentIdx] = "bg-gameLight";
          }
          return;
        }

        let hasGreen = false;
        let hasYellow = false;
        let unrevealedWillBeGreen = false; // Add fix for the yellow-flash animation drift

        const guessesForWord = game.guesses.filter(
          (g) => typeof g?.word === "string" && g.wordIndex === wordIdx,
        );

        guessesForWord.forEach((guessObj) => {
          const guess = guessObj.word.toLowerCase();
          const isCurrentReveal =
            isRevealLocked &&
            typeof guessObj?.rowNumber === "number" &&
            guessObj.rowNumber === latestRowNumber;

          const maxIdx = isCurrentReveal
            ? Math.min(revealedCount, guess.length)
            : guess.length;

          for (let i = 0; i < guess.length; i++) {
            if (guess[i] === letter) {
              if (i < maxIdx) {
                if (solution[i] === letter) {
                  hasGreen = true;
                } else {
                  hasYellow = true;
                }
              } else if (isCurrentReveal) {
                if (solution[i] === letter) {
                  unrevealedWillBeGreen = true;
                }
              }
            }
          }
        });

        // Compensate for interval drift: if the global color has already updated to Green
        // for this exact letter, bypass the 'Yellow' fallback check entirely.
        if (unrevealedWillBeGreen && globalColor.includes("bg-gameGreen")) {
          hasGreen = true;
        }

        if (hasGreen) {
          keyMap[key][segmentIdx] = "bg-gameGreen";
        } else if (hasYellow || isGuessedGlobally) {
          keyMap[key][segmentIdx] = "bg-gameYellow";
        } else {
          keyMap[key][segmentIdx] = "bg-gameLight";
        }
      });
    });

    return keyMap;
  };

  return {
    bossKeyboardView,
    setBossKeyboardView,
    bossKeyboardLineColors: getBossKeyboardLineColors(),
  };
}
