import { useState, useEffect, useRef, useCallback } from "react";
import Wordle500Board, { MANUAL_COLORS } from "./Wordle500Board";
import useGameInput from "../hooks/useGameInput"; // [REFACTORED]

const COLORS_STORAGE_KEY = "survival-wordle500-manual-colors";

export default function SurvivalWordle500Wrapper({
  game,
  onGuessSubmit,
  onGameOver,
  addToast,
}) {
  const [manualColors, setManualColors] = useState(() => {
    if (!game.guesses) return [];
    try {
      const saved = JSON.parse(localStorage.getItem(COLORS_STORAGE_KEY)) || [];
      return Array.from(
        { length: game.guesses.length },
        (_, i) => saved[i] || Array(5).fill("gray"),
      );
    } catch {
      return Array.from({ length: game.guesses.length }, () =>
        Array(5).fill("gray"),
      );
    }
  });

  const [lastSubmittedId, setLastSubmittedId] = useState(() =>
    game.guesses ? game.guesses.length : 0,
  );

  const [shake, setShake] = useState(false);
  const shakeTimeoutRef = useRef(null);

  const triggerShake = useCallback(() => {
    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    setShake(false);
    requestAnimationFrame(() => setShake(true));
    shakeTimeoutRef.current = setTimeout(() => setShake(false), 500);
  }, []);

  useEffect(
    () => () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    },
    [],
  );

  useEffect(() => {
    localStorage.setItem(COLORS_STORAGE_KEY, JSON.stringify(manualColors));
  }, [manualColors]);

  // [REFACTORED] Pass validation logic to the custom hook
  const handleValidSubmit = useCallback(
    (guessToSubmit) => {
      if (game.guesses && game.guesses.includes(guessToSubmit)) {
        triggerShake();
        addToast("Word already submitted!", "error");
        return false;
      }

      const accepted = onGuessSubmit(guessToSubmit, 0, triggerShake, () => {
        triggerShake();
        addToast("Word already submitted!", "error");
      });

      if (accepted) {
        setManualColors((prev) => [...prev, Array(5).fill("gray")]);
        setLastSubmittedId((prev) => prev + 1);
        return true;
      }
      return false;
    },
    [game.guesses, onGuessSubmit, triggerShake, addToast],
  );

  const currentTurn = game.guesses ? game.guesses.length : 0;

  const { currentGuess } = useGameInput({
    turn: currentTurn,
    rowCount: game.maxTurns,
    gameState: game.gameState,
    guessesLength: currentTurn,
    onValidSubmit: handleValidSubmit,
    onGameOver: (type) => onGameOver?.(type),
    triggerShake,
    addToast,
  });

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
