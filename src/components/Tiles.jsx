// components/Tiles.jsx
import { useState, useCallback } from "react";
import useGameInput from "../hooks/useGameInput";
import WordGrid from "./WordGrid";

export default function Tiles({
  guesses = [],
  turn = 0,
  targetWord,
  gameState = "playing",
  onGuessSubmit,
  onGameOver,
  addToast,
  rowCount = 6,
  bannedRows = 0,
  isShapeMode = false,
  isBombMode = false,
  isRapidleMode = false,
  isPaused = false,
}) {
  const [shake, setShake] = useState(false);
  const [bannedFlash, setBannedFlash] = useState(false);
  const [lastSubmittedTurn, setLastSubmittedTurn] = useState(-1);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const triggerBannedFlash = useCallback(() => {
    setBannedFlash(true);
    setTimeout(() => setBannedFlash(false), 2000);
  }, []);

  const handleValidSubmit = useCallback(
    (guessToSubmit) => {
      if (
        onGuessSubmit &&
        onGuessSubmit(
          guessToSubmit,
          undefined,
          triggerShake,
          triggerBannedFlash,
          () => {
            triggerShake();
            if (addToast) addToast("Word already submitted!", "error");
          },
        )
      ) {
        setLastSubmittedTurn(turn);
        return true;
      }
      return false;
    },
    [onGuessSubmit, triggerShake, addToast, turn, triggerBannedFlash],
  );

  const { currentGuess } = useGameInput({
    turn,
    // By passing an un-reachable row count, we unlock infinite typing capability
    rowCount: isRapidleMode ? 9999 : rowCount,
    gameState,
    guessesLength: guesses.length,
    onValidSubmit: handleValidSubmit,
    onGameOver,
    triggerShake,
    addToast,
    isPaused, // Passed down from parent
  });

  // --- Infinite Scroll Setup for Rapidle ---
  let displayGuesses = guesses;
  let displayTurn = turn;
  let displayRowCount = rowCount;
  let displayLastSubmittedTurn = lastSubmittedTurn;

  if (isRapidleMode) {
    // Strictly require the game to be active to show the empty typing row
    const needsActiveRow = gameState === "playing";
    const totalVisualRows = guesses.length + (needsActiveRow ? 1 : 0);
    displayRowCount = Math.min(6, totalVisualRows);
    displayRowCount = Math.max(1, displayRowCount); // Ensure at least 1 row exists

    if (totalVisualRows > 6) {
      const startIdx = totalVisualRows - 6;
      displayGuesses = guesses.slice(
        startIdx,
        startIdx + (needsActiveRow ? 5 : 6),
      );
      displayTurn = needsActiveRow ? 5 : displayRowCount;
      displayLastSubmittedTurn = lastSubmittedTurn - startIdx;
    } else {
      displayTurn = needsActiveRow ? guesses.length : displayRowCount;
    }
  }

  return (
    <WordGrid
      guesses={displayGuesses}
      currentGuess={currentGuess}
      targetWord={targetWord}
      turn={displayTurn}
      rowCount={displayRowCount}
      gameState={gameState}
      shake={shake}
      lastSubmittedTurn={displayLastSubmittedTurn}
      sizeMode="normal"
      bannedRows={bannedRows}
      bannedFlash={bannedFlash}
      isShapeMode={isShapeMode}
      isBombMode={isBombMode}
      isRapidleMode={isRapidleMode}
    />
  );
}
