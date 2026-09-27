import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Wordle500Board from "./Wordle500Board";
import useGameInput from "../hooks/useGameInput";
import {
  getUpdatedSubmitColors,
  getUpdatedManualColors,
} from "../hooks/useWordle500Game";

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
  const [bannedFlash, setBannedFlash] = useState(false);
  const shakeTimeoutRef = useRef(null);

  const hasColors = useMemo(() => {
    return manualColors.some((row) =>
      row.some((color) => color !== "gray" && color !== "locked-red"),
    );
  }, [manualColors]);

  // Transmit both the color status and the exact manual colors array to BossGameView
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("wordle500-colors-status", {
        detail: { hasColors, manualColors },
      }),
    );
  }, [hasColors, manualColors]);

  const triggerShake = useCallback(() => {
    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    setShake(false);
    requestAnimationFrame(() => setShake(true));
    shakeTimeoutRef.current = setTimeout(() => setShake(false), 500);
  }, []);

  const triggerBannedFlash = useCallback(() => {
    setBannedFlash(true);
    setTimeout(() => setBannedFlash(false), 2000);
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

  const handleValidSubmit = useCallback(
    (guessToSubmit) => {
      if (game.guesses && game.guesses.includes(guessToSubmit)) {
        triggerShake();
        addToast("Word already submitted!", "error");
        return false;
      }

      const accepted = onGuessSubmit(
        guessToSubmit,
        0,
        triggerShake,
        triggerBannedFlash,
        () => {
          triggerShake();
          addToast("Word already submitted!", "error");
        },
      );

      if (accepted) {
        setManualColors((prev) =>
          getUpdatedSubmitColors(
            guessToSubmit,
            game.targetWord,
            prev,
            game.guesses,
          ),
        );
        setLastSubmittedId((prev) => prev + 1);
        return true;
      }
      return false;
    },
    [
      game.guesses,
      game.targetWord,
      onGuessSubmit,
      triggerShake,
      addToast,
      triggerBannedFlash,
    ],
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

  const changeManualColor = useCallback(
    (
      rowIndex,
      letterIndex,
      applyToAll = false,
      forceReset = false,
      clearAllBoard = false,
    ) => {
      if (game.gameState !== "playing") return;
      setManualColors((prev) =>
        getUpdatedManualColors(
          rowIndex,
          letterIndex,
          applyToAll,
          forceReset,
          prev,
          game.guesses,
          clearAllBoard,
        ),
      );
    },
    [game.gameState, game.guesses],
  );

  useEffect(() => {
    const handleClear = () => {
      if (game.gameState === "playing") {
        changeManualColor(0, 0, false, false, true);
      }
    };
    window.addEventListener("clear-wordle500", handleClear);
    return () => window.removeEventListener("clear-wordle500", handleClear);
  }, [changeManualColor, game.gameState]);

  const unifiedGameObj = {
    ...game,
    currentGuess,
    manualColors,
    lastSubmittedId,
    shake,
    bannedFlash,
    changeManualColor,
  };

  return <Wordle500Board game={unifiedGameObj} />;
}