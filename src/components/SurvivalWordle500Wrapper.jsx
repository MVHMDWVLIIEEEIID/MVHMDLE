import { useState, useEffect, useRef } from "react";
import Wordle500Board, { MANUAL_COLORS } from "./Wordle500Board";
import data from "../data/words.json";

const COLORS_STORAGE_KEY = "survival-wordle500-manual-colors";

export default function SurvivalWordle500Wrapper({
  game,
  onGuessSubmit,
  onGameOver,
  addToast,
}) {
  const [currentGuess, setCurrentGuess] = useState("");
  
  const [manualColors, setManualColors] = useState(() => {
    if (!game.guesses) return [];
    try {
      const saved = JSON.parse(localStorage.getItem(COLORS_STORAGE_KEY)) || [];
      return Array.from({ length: game.guesses.length }, (_, i) => 
        saved[i] || Array(5).fill("gray")
      );
    } catch {
      return Array.from({ length: game.guesses.length }, () => Array(5).fill("gray"));
    }
  });

  const [lastSubmittedId, setLastSubmittedId] = useState(() =>
    game.guesses ? game.guesses.length : 0
  );
  
  const [shake, setShake] = useState(false);
  const shakeTimeoutRef = useRef(null);

  const triggerShake = () => {
    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    setShake(false);
    requestAnimationFrame(() => setShake(true));
    shakeTimeoutRef.current = setTimeout(() => setShake(false), 500);
  };

  useEffect(
    () => () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    },
    [],
  );

  useEffect(() => {
    localStorage.setItem(COLORS_STORAGE_KEY, JSON.stringify(manualColors));
  }, [manualColors]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Intercept Enter key specifically to reopen the modal if the game is over
      if (e.key === "Enter") {
        if (game.gameState !== "playing") {
          if (game.gameState === "won") onGameOver?.("won-already");
          else onGameOver?.("lost-already");
          return;
        }

        const guessToSubmit = currentGuess.toLowerCase();

        if (guessToSubmit.length !== 5) {
          triggerShake();
          addToast("Not enough letters!", "error");
          return;
        }

        if (!data.includes(guessToSubmit)) {
          triggerShake();
          addToast("Incorrect word", "error");
          return;
        }

        if (game.guesses && game.guesses.includes(guessToSubmit)) {
          triggerShake();
          addToast("Word already submitted!", "error");
          return;
        }

        const accepted = onGuessSubmit(
          guessToSubmit,
          0,
          triggerShake,
          () => {
            triggerShake();
            addToast("Word already submitted!", "error");
          },
        );

        if (accepted) {
          setManualColors((prev) => [...prev, Array(5).fill("gray")]);
          setLastSubmittedId((prev) => prev + 1);
          setCurrentGuess("");
        }
        return; // Important: Return early so we don't fall into the block below
      }

      // Block any other keypresses if the game is no longer active
      if (game.gameState !== "playing") return;

      if (e.key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        if (currentGuess.length < 5) {
          setCurrentGuess((prev) => prev + e.key.toLowerCase());
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        addToast("Game only accepts English letters", "error");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGuess, game.gameState, onGuessSubmit, onGameOver, addToast, game.guesses]);

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

  const unifiedGameObj = {
    ...game,
    currentGuess,
    manualColors,
    lastSubmittedId,
    shake,
    changeManualColor,
  };

  return <Wordle500Board game={unifiedGameObj} />;
}