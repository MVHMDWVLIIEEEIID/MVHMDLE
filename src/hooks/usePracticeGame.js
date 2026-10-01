// hooks/usePracticeGame.js
import { useState, useCallback, useEffect } from "react";
import useSecureState from "./useSecureState";
import { getGuessStatuses } from "../utils/gameUtils";
import { SHAPES } from "../utils/bossConfig";
import usePracticePool from "./usePracticePool";
import { getCheatSheetForWord } from "../utils/shapeValidator";
import data from "../data/words.json";

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

export default function usePracticeGame(bossId, subId) {
  const pool = usePracticePool(bossId, subId);

  const STATE_KEY = `practice-${bossId}-${subId || "rand"}`;

  const [guesses, setGuesses] = useSecureState(`${STATE_KEY}-guesses`, []);
  const [turn, setTurn] = useSecureState(`${STATE_KEY}-turn`, 0);
  const [shapeMistakes, setShapeMistakes] = useSecureState(
    `${STATE_KEY}-shape-mistakes`,
    2,
  );
  const [bombTimeLeft, setBombTimeLeft] = useSecureState(
    `${STATE_KEY}-bomb-time`,
    60,
  );
  const [letters, setLetters] = useSecureState(
    `${STATE_KEY}-letters`,
    getInitialLetters(),
  );
  const [gameState, setGameState] = useSecureState(
    `${STATE_KEY}-state`,
    "playing",
  );

  const [lastChanged, setLastChanged] = useState({
    letter: null,
    timestamp: 0,
  });

  useEffect(() => {
    if (import.meta.env.DEV) {
      if (pool.bossCategory === "shape" && pool.targetWord && pool.bossType) {
        const shapeArrays = SHAPES[pool.bossType].map((row) =>
          row.map((c) => (c === "G" ? 2 : c === "Y" ? 1 : 0)),
        );
        const rowProofs = getCheatSheetForWord(
          pool.targetWord,
          shapeArrays,
          data,
        );

        console.log(
          `%c[SHAPE BOSS ACTIVE] Shape: ${pool.bossType} | Target: ${pool.targetWord}`,
          "color: #00e196; font-weight: bold; font-size: 14px;",
        );
        console.log({
          shape: pool.bossType,
          targetWord: pool.targetWord,
          cheatSheet: rowProofs.map((guesses, i) => ({
            row: i + 1,
            shapeConstraint: SHAPES[pool.bossType][i],
            answers: guesses,
          })),
        });
      } else if (pool.bossCategory === "multi") {
        if (!pool.targetWords || pool.targetWords.length === 0) return;
        console.log(
          `[DEBUG][practice] target words (${pool.bossWordCount}): ${pool.targetWords.join(", ")}`,
        );
      } else if (pool.bossCategory === "bomb") {
        if (!pool.bombPhrases || pool.bombPhrases.length === 0) return;
        const usedWords = new Set();
        const cheatSheet = pool.bombPhrases.map((phrase) => {
          const match = data.find(
            (w) => w.includes(phrase) && !usedWords.has(w),
          );
          if (match) usedWords.add(match);
          return match || "NO_MATCH";
        });
        console.log(
          `[DEBUG][practice] target phrases: ${pool.bombPhrases.join(", ")}\n[DEBUG][practice] cheat sheet (unique): ${cheatSheet.join(", ")}`,
        );
      } else if (pool.targetWord) {
        console.log(`[DEBUG][practice] target word: ${pool.targetWord}`);
      }
    }
  }, [
    pool.bossCategory,
    pool.bossWordCount,
    pool.targetWord,
    pool.targetWords,
    pool.bombPhrases,
    pool.bossType,
  ]);

  const isShapeBoss = pool.bossCategory === "shape";
  const isBombBoss = pool.bossCategory === "bomb";

  const triggerBombTimeUp = useCallback(
    (onGameOverCallback) => {
      if (gameState !== "playing") return;
      setGameState("lost");
      if (onGameOverCallback) onGameOverCallback("lost", pool.maxTurns);
    },
    [gameState, pool.maxTurns, setGameState],
  );

  const changeColor = (newColor, letterKey) => {
    const key = letterKey.toLowerCase();

    // Trigger animation for EVERY evaluated letter, regardless of color upgrade
    setLastChanged({ letter: key, timestamp: Date.now() });

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

      return { ...prev, [key]: { ...current, color: newColor } };
    });
  };

  const submitGuess = (
    guess,
    _wordIndex,
    onGameOver,
    onBannedWord,
    onDuplicateWord,
    onMistake,
  ) => {
    if (gameState !== "playing") return false;

    if (
      !pool.targetWord &&
      (!Array.isArray(pool.targetWords) || pool.targetWords.length === 0)
    )
      return false;

    const normalizedGuess = guess.toLowerCase();

    if (
      (pool.bossCategory === "multi" &&
        guesses.some((g) => g.word === normalizedGuess)) ||
      (pool.bossCategory !== "multi" && guesses.includes(normalizedGuess))
    ) {
      if (onDuplicateWord) onDuplicateWord();
      return false;
    }

    if (pool.bossCategory === "bomb") {
      const requiredPhrase = pool.bombPhrases[turn];
      if (!requiredPhrase) return false;

      if (!normalizedGuess.includes(requiredPhrase)) {
        if (onMistake) onMistake();
        return false;
      }

      const newGuesses = [...guesses, guess];
      setGuesses(newGuesses);

      if (newGuesses.length >= pool.maxTurns) {
        setGameState("won");
        onGameOver("won", newGuesses.length);
      } else {
        setTurn(turn + 1);
      }
      return true;
    }

    if (pool.bossCategory === "shape") {
      const requiredRow = SHAPES[pool.bossType]?.[turn];
      if (!requiredRow) return false;

      const statuses = getGuessStatuses(guess, pool.targetWord);
      let matches = true;

      for (let i = 0; i < 5; i++) {
        let expected = "bg-gameGrey";
        if (requiredRow[i] === "G") expected = "bg-gameGreen";
        else if (requiredRow[i] === "Y") expected = "bg-gameYellow";

        if (statuses[i] !== expected) {
          matches = false;
          break;
        }
      }

      if (!matches) {
        const newMistakes = shapeMistakes - 1;
        setShapeMistakes(newMistakes);
        if (newMistakes < 0) {
          setGameState("lost");
          onGameOver("lost", pool.maxTurns);
        } else {
          if (onMistake) onMistake();
        }
        return false;
      }

      const newGuesses = [...guesses, guess];
      setGuesses(newGuesses);

      if (newGuesses.length >= pool.maxTurns) {
        setGameState("won");
        onGameOver("won", newGuesses.length);
      } else {
        setTurn(turn + 1);
      }
      return true;
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

  const resetGame = () => {
    pool.generateNextGame();
    setLetters(getInitialLetters());
    setLastChanged({ letter: null, timestamp: 0 });
    setGuesses([]);
    setTurn(0);
    setGameState("playing");
    setShapeMistakes(2);
    setBombTimeLeft(60);
    localStorage.removeItem("wordle-bomb-last-tick");
    localStorage.removeItem("wordle-rapidle-last-tick");
  };

  return {
    ...pool,
    bannedRows: 0,
    guesses,
    turn,
    gameState,
    letters,
    lastChanged,
    shapeMistakes,
    bombTimeLeft,
    setBombTimeLeft,
    changeColor,
    submitGuess,
    resetGame,
    retryBoss: resetGame,
    triggerBombTimeUp,
  };
}
