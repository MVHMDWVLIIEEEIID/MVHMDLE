import { useState, useRef, useLayoutEffect, useEffect } from "react";

export default function useBossMechanics(game) {
  const BOSS_KEY_REVEAL_START_MS = 300; //
  const BOSS_KEY_REVEAL_STEP_MS = 150; //
  const BOSS_TILE_REVEAL_TOTAL_MS = 1300; //

  const [bossRevealProgress, setBossRevealProgress] = useState({
    rowNumber: -1,
    revealedCount: 5,
  }); //[cite: 1]
  const [bossKeyboardView, setBossKeyboardView] = useState("all"); //[cite: 1]

  const bossRevealTimersRef = useRef([]); //[cite: 1]
  const bossFocusTimerRef = useRef(null); //[cite: 1]
  const previousBossSolvedRef = useRef(null); //[cite: 1]
  const prevBossGuessesLenRef = useRef(0); //[cite: 1]
  const bossRevealInitializedRef = useRef(false); //[cite: 1]

  // Reveal Animation Logic[cite: 1]
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

  // Focus View Logic[cite: 1]
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

  // Derived State: Line Colors[cite: 1]
  const getBossKeyboardLineColors = () => {
    if (!game.isBossGame || game.bossWordCount <= 1) return {};
    const isRevealLocked = bossRevealProgress.rowNumber >= 0;
    const latestRowNumber = bossRevealProgress.rowNumber;
    const revealedCount = bossRevealProgress.revealedCount;
    const visibleWordIndices =
      bossKeyboardView === "all"
        ? Array.from({ length: game.bossWordCount }, (_, idx) => idx)
        : [bossKeyboardView];

    const isLetterRevealedForGuess = (guessObj, letter) => {
      const guess = guessObj.word.toLowerCase();
      if (
        isRevealLocked &&
        typeof guessObj?.rowNumber === "number" &&
        guessObj.rowNumber === latestRowNumber
      ) {
        for (let i = 0; i < Math.min(revealedCount, guess.length); i++) {
          if (guess[i] === letter) return true;
        }
        return false;
      }
      return guess.includes(letter);
    };

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

        const guessesForWord = game.guesses.filter(
          (g) =>
            typeof g?.word === "string" &&
            g.wordIndex === wordIdx &&
            isLetterRevealedForGuess(g, letter),
        );

        if (guessesForWord.length === 0) {
          keyMap[key][segmentIdx] = "bg-gameLight";
          return;
        }

        let hasGreen = false;
        guessesForWord.forEach((guessObj) => {
          const guess = guessObj.word.toLowerCase();
          const maxIdx =
            isRevealLocked &&
            typeof guessObj?.rowNumber === "number" &&
            guessObj.rowNumber === latestRowNumber
              ? Math.min(revealedCount, guess.length)
              : guess.length;

          for (let i = 0; i < maxIdx; i++) {
            if (guess[i] === letter && solution[i] === letter) {
              hasGreen = true;
              break;
            }
          }
        });

        if (hasGreen) {
          keyMap[key][segmentIdx] = "bg-gameGreen";
          return;
        }
        if (solution.includes(letter)) {
          keyMap[key][segmentIdx] = "bg-gameYellow";
        } else {
          keyMap[key][segmentIdx] = "bg-gameGrey";
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
