import { useState, useEffect } from "react";
import useSecureState from "./useSecureState";
import { getGuessStatuses } from "../utils/gameUtils";
import useWordPool from "./useWordPool";

const getInitialLetters = () => ({
  q: { color: " bg-gameLight ", row: 1 },
  w: { color: " bg-gameLight ", row: 1 },
  e: { color: " bg-gameLight ", row: 1 },
  r: { color: " bg-gameLight ", row: 1 },
  t: { color: " bg-gameLight ", row: 1 },
  y: { color: " bg-gameLight ", row: 1 },
  u: { color: " bg-gameLight ", row: 1 },
  i: { color: " bg-gameLight ", row: 1 },
  o: { color: " bg-gameLight ", row: 1 },
  p: { color: " bg-gameLight ", row: 1 },
  a: { color: " bg-gameLight ", row: 2 },
  s: { color: " bg-gameLight ", row: 2 },
  d: { color: " bg-gameLight ", row: 2 },
  f: { color: " bg-gameLight ", row: 2 },
  g: { color: " bg-gameLight ", row: 2 },
  h: { color: " bg-gameLight ", row: 2 },
  j: { color: " bg-gameLight ", row: 2 },
  k: { color: " bg-gameLight ", row: 2 },
  l: { color: " bg-gameLight ", row: 2 },
  enter: { color: " bg-gameLight ", row: 3, big: true },
  z: { color: " bg-gameLight ", row: 3 },
  x: { color: " bg-gameLight ", row: 3 },
  c: { color: " bg-gameLight ", row: 3 },
  v: { color: " bg-gameLight ", row: 3 },
  b: { color: " bg-gameLight ", row: 3 },
  n: { color: " bg-gameLight ", row: 3 },
  m: { color: " bg-gameLight ", row: 3 },
  back: { color: " bg-gameLight ", row: 3, big: true },
});

export default function useSurvivalGame(mode) {
  const pool = useWordPool(mode);

  const TILES_GUESSES_KEY = `${mode}-guesses`;
  const TILES_TURN_KEY = `${mode}-turn`;
  const GAME_STATE_KEY = `${mode}-game-state`;
  const LETTERS_KEY = `wordle-letters-${mode}`;

  const [guesses, setGuesses] = useSecureState(TILES_GUESSES_KEY, []);
  const [turn, setTurn] = useSecureState(TILES_TURN_KEY, 0);
  const [letters, setLetters] = useSecureState(
    LETTERS_KEY,
    getInitialLetters(),
  );
  const [lastChanged, setLastChanged] = useState({
    letter: null,
    timestamp: 0,
  });

  const [gameState, setGameState] = useSecureState(GAME_STATE_KEY, () => {
    // [NEW] الاعتماد على الفئة الجديدة (Category) بدلاً من الاختباص في الشروط
    if (pool.bossCategory === "multi") {
      if (guesses.length > 0 && Array.isArray(guesses[0])) {
        const allWordsGuessed = pool.targetWords.every((word, idx) =>
          guesses.some(
            (g) => g.word === word?.toLowerCase() && g.wordIndex === idx,
          ),
        );
        if (allWordsGuessed) return "won";
      }
      if (turn >= pool.maxTurns) return "lost";
    } else {
      const lastGuess = guesses[guesses.length - 1];
      if (
        typeof lastGuess === "string" &&
        lastGuess === pool.targetWord?.toLowerCase()
      )
        return "won";
      if (turn >= pool.maxTurns) return "lost";
    }
    return "playing";
  });

  useEffect(() => {
    if (!Array.isArray(pool.targetWords) || pool.targetWords.length === 0)
      return;
    if (pool.bossCategory === "multi") {
      console.log(
        `[DEBUG][${mode}] target words (${pool.bossWordCount}): ${pool.targetWords.join(", ")}`,
      );
    } else if (pool.targetWord) {
      console.log(`[DEBUG][${mode}] target word: ${pool.targetWord}`);
    }
  }, [
    mode,
    pool.bossCategory,
    pool.bossWordCount,
    pool.targetWord,
    pool.targetWords,
  ]);

  const changeColor = (newColor, letterKey) => {
    const key = letterKey.toLowerCase();
    setLetters((prev) => {
      const current = prev[key];
      if (!current) return prev;
      const currentColor = current.color;
      if (currentColor.includes("bg-gameGreen")) return prev;
      if (
        currentColor.includes("bg-gameYellow") &&
        !newColor.includes("bg-gameGreen")
      )
        return prev;
      if (
        currentColor.includes("bg-gameGrey") &&
        newColor.includes("bg-gameGrey")
      )
        return prev;
      setLastChanged({ letter: key, timestamp: Date.now() });
      return { ...prev, [key]: { ...current, color: newColor } };
    });
  };

  const submitGuess = (
    guess,
    _wordIndex,
    onGameOver,
    onBannedWord,
    onDuplicateWord,
  ) => {
    if (gameState !== "playing") return false;
    if (
      !pool.targetWord &&
      (!Array.isArray(pool.targetWords) || pool.targetWords.length === 0)
    )
      return false;

    const normalizedGuess = guess.toLowerCase();
    const openingGuessCount = pool.isBossGame
      ? pool.bossWordCount === 4
        ? 3
        : pool.bossWordCount === 2
          ? 2
          : 1
      : 1;
    const bannedRows = openingGuessCount + 1;

    if (
      (pool.bossCategory === "multi" &&
        guesses.some((g) => g.word === normalizedGuess)) ||
      (pool.bossCategory !== "multi" && guesses.includes(normalizedGuess))
    ) {
      if (onDuplicateWord) onDuplicateWord();
      return false;
    }
    if (
      turn < bannedRows &&
      pool.bannedOpeningWords.includes(normalizedGuess)
    ) {
      if (onBannedWord) onBannedWord();
      return false;
    }
    if (
      turn < openingGuessCount &&
      !pool.bannedOpeningWords.includes(normalizedGuess)
    ) {
      pool.setBannedOpeningWords((prev) => [...prev, normalizedGuess]);
    }

    if (pool.bossCategory === "multi") {
      const limit = pool.bossWordCount;
      const guessesToAdd = [];

      for (let i = 0; i < limit; i++) {
        const isSolved = guesses.some(
          (g) =>
            g.word === pool.targetWords[i]?.toLowerCase() && g.wordIndex === i,
        );
        if (!isSolved)
          guessesToAdd.push({ word: guess, wordIndex: i, rowNumber: turn });
      }

      const newGuesses = [...guesses, ...guessesToAdd];
      setGuesses(newGuesses);

      for (let i = 0; i < limit; i++) {
        const isSolved = guesses.some(
          (g) =>
            g.word === pool.targetWords[i]?.toLowerCase() && g.wordIndex === i,
        );
        if (!isSolved) {
          const statuses = getGuessStatuses(guess, pool.targetWords[i]);
          guess.split("").forEach((char, j) => {
            setTimeout(() => changeColor(statuses[j], char), j * 150 + 300);
          });
        }
      }

      const allWordsGuessed = pool.targetWords.every((word, idx) =>
        newGuesses.some(
          (g) => g.word === word?.toLowerCase() && g.wordIndex === idx,
        ),
      );

      const newlySolved = [];
      for (let i = 0; i < limit; i++) {
        const wasSolvedBefore = guesses.some(
          (g) =>
            g.word === pool.targetWords[i]?.toLowerCase() && g.wordIndex === i,
        );
        if (!wasSolvedBefore && guess === pool.targetWords[i]?.toLowerCase()) {
          newlySolved.push(pool.randomIndices[i]);
        }
      }

      pool.removeSolvedTargets(newlySolved);

      if (allWordsGuessed) {
        setGameState("won");
        onGameOver("won", newGuesses.length);
      } else {
        const newTurn = turn + 1;
        setTurn(newTurn);
        if (newTurn >= pool.maxTurns) {
          setGameState("lost");
          onGameOver("lost", pool.maxTurns);
        }
      }
    } else {
      const newGuesses = [...guesses, guess];
      setGuesses(newGuesses);

      const statuses = getGuessStatuses(guess, pool.targetWord);
      guess.split("").forEach((char, i) => {
        setTimeout(() => changeColor(statuses[i], char), i * 150 + 300);
      });

      if (guess === pool.targetWord?.toLowerCase()) {
        pool.removeSolvedTargets([pool.random]);
        setGameState("won");
        onGameOver("won", newGuesses.length);
      } else {
        const newTurn = turn + 1;
        setTurn(newTurn);
        if (newTurn >= pool.maxTurns) {
          setGameState("lost");
          onGameOver("lost", pool.maxTurns);
        }
      }
    }
    return true;
  };

  const addExtraRow = () => pool.setMaxTurns((prev) => prev + 1);

  const resetBoard = () => {
    setLetters(getInitialLetters());
    setLastChanged({ letter: null, timestamp: 0 });
    setGuesses([]);
    setTurn(0);
    setGameState("playing");
  };

  const resetGame = () => {
    const hasWords = pool.generateNextGame(true);
    if (!hasWords) {
      resetBoard();
      setGameState("won");
      return;
    }
    resetBoard();
  };

  const resetAllGameData = () => {
    pool.resetPoolData();
    resetBoard();
  };

  const retryCurrentGame = () => {
    pool.generateNextGame(false);
    resetBoard();
  };

  const undoLastGuess = () => {
    if (guesses.length > 0) {
      setGuesses((prev) => prev.slice(0, -1));
      setTurn((prev) => Math.max(0, prev - 1));
      setGameState("playing");
      return true;
    }
    return false;
  };

  return {
    targetWord: pool.targetWord,
    targetWords: pool.targetWords,
    guesses,
    turn,
    maxTurns: pool.maxTurns,
    gameState,
    letters,
    lastChanged,
    changeColor,
    submitGuess,
    resetGame,
    resetAllGameData,
    retryCurrentGame,
    retryBoss: retryCurrentGame,
    undoLastGuess,
    addExtraRow,
    isBossGame: pool.isBossGame,
    bossWordCount: pool.bossWordCount,
    bossType: pool.bossType,
    bossCategory: pool.bossCategory, // [NEW] تم تصديرها للواجهة
    gameCount: pool.gameCount,
    availableSolutionCount: pool.availableSolutionCount,
  };
}
