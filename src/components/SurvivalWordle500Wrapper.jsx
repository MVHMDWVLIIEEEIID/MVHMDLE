import { useState, useEffect } from "react";
import Wordle500Board, { MANUAL_COLORS } from "./Wordle500Board";
import data from "../data/words.json";

export default function SurvivalWordle500Wrapper({
  game,
  onGuessSubmit,
  addToast,
}) {
  const [currentGuess, setCurrentGuess] = useState("");
  const [manualColors, setManualColors] = useState([]);
  const [lastSubmittedId, setLastSubmittedId] = useState(0);

  // Intercept keystrokes locally to feed currentGuess to the board
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (game.gameState !== "playing") return;

      if (e.key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (e.key === "Enter") {
        const guessToSubmit = currentGuess.toLowerCase();

        if (guessToSubmit.length !== 5) {
          addToast("Not enough letters!", "error");
          return;
        }

        if (!data.includes(guessToSubmit)) {
          addToast("Incorrect word", "error");
          return;
        }

        const accepted = onGuessSubmit(
          guessToSubmit,
          0,
          () => addToast("Not enough letters", "error"),
          () => addToast("Word already submitted!", "error"),
        );

        // If the main hook accepts the guess, update the board's visual state
        if (accepted) {
          setManualColors((prev) => [...prev, Array(5).fill("gray")]);
          setLastSubmittedId((prev) => prev + 1);
          setCurrentGuess("");
        }
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        if (currentGuess.length < 5) {
          setCurrentGuess((prev) => prev + e.key.toLowerCase());
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGuess, game.gameState, onGuessSubmit, addToast]);

  // Handle the manual color cycling logic
  const changeManualColor = (rowIndex, letterIndex) => {
    if (game.gameState !== "playing") return;
    setManualColors((prev) => {
      const newColors = prev.map((row) => [...row]);
      const current = newColors[rowIndex]?.[letterIndex];
      if (!current) return prev;

      const nextIndex =
        (MANUAL_COLORS.indexOf(current) + 1) % MANUAL_COLORS.length;
      newColors[rowIndex][letterIndex] = MANUAL_COLORS[nextIndex];
      return newColors;
    });
  };

  // Merge the survival game data with the local typing data
  const unifiedGameObj = {
    ...game,
    currentGuess,
    manualColors,
    lastSubmittedId,
    changeManualColor,
  };

  return <Wordle500Board game={unifiedGameObj} />;
}
