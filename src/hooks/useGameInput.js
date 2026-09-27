import { useState, useEffect, useRef } from "react";
import data from "../data/words.json";

export default function useGameInput({
  turn,
  rowCount,
  gameState,
  guessesLength,
  onValidSubmit,
  onGameOver,
  triggerShake,
  addToast,
}) {
  const [currentGuess, setCurrentGuess] = useState("");
  const isSubmittingRef = useRef(false);

  // [FIX] Uncommented this block! This was preventing users from pressing
  // enter on any subsequent guesses because the lock was never being cleared.
  useEffect(() => {
    isSubmittingRef.current = false;
  }, [turn, gameState, guessesLength]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        return;
      }

      if (e.repeat) return;
      const key = e.key;

      if (key === "Enter") {
        e.preventDefault();
        if (isSubmittingRef.current) return;

        if (gameState !== "playing" || turn >= rowCount) {
          if (gameState === "won") onGameOver?.("won-already");
          else onGameOver?.("lost-already");
          return;
        }

        const guessToSubmit = currentGuess?.toLowerCase();

        if (guessToSubmit.length !== 5) {
          triggerShake?.();
          addToast?.("Not enough letters!", "error");
          return;
        }

        if (!data.includes(guessToSubmit)) {
          triggerShake?.();
          addToast?.("Incorrect word", "error");
          return;
        }

        const accepted = onValidSubmit(guessToSubmit);
        if (accepted) {
          isSubmittingRef.current = true;
          setCurrentGuess("");
        }
        return;
      }

      if (gameState !== "playing" || turn >= rowCount) return;

      if (key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }

      if (/^[a-zA-Z]$/.test(key)) {
        if (currentGuess.length < 5) {
          setCurrentGuess((prev) => (prev + key)?.toLowerCase());
        }
      } else if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        addToast?.("Game only accepts English letters", "error");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentGuess,
    turn,
    rowCount,
    gameState,
    onValidSubmit,
    onGameOver,
    triggerShake,
    addToast,
  ]);

  return { currentGuess, setCurrentGuess };
}
