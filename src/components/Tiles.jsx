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
  isShapeMode = false, // <--- [NEW]
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
    [onGuessSubmit, triggerShake, addToast, turn],
  );

  const { currentGuess } = useGameInput({
    turn,
    rowCount,
    gameState,
    guessesLength: guesses.length,
    onValidSubmit: handleValidSubmit,
    onGameOver,
    triggerShake,
    addToast,
  });

  return (
    <WordGrid
      guesses={guesses}
      currentGuess={currentGuess}
      targetWord={targetWord}
      turn={turn}
      rowCount={rowCount}
      gameState={gameState}
      shake={shake}
      lastSubmittedTurn={lastSubmittedTurn}
      sizeMode="normal"
      bannedRows={bannedRows}
      bannedFlash={bannedFlash}
      isShapeMode={isShapeMode} // <--- [NEW]
    />
  );
}
