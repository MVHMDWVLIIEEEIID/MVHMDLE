import { useState, useEffect, useRef, useCallback } from "react";
import Wordle500Board, { MANUAL_COLORS } from "./Wordle500Board";
import useGameInput from "../hooks/useGameInput";
import { getStatusCounts } from "../hooks/useWordle500Game";
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

  // [REFACTORED] Pass validation logic to the custom hook
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
        // Calculate if the submitted guess yielded 0 yellow and 0 green
        const counts = getStatusCounts(guessToSubmit, game.targetWord);

        setManualColors((prev) => {
          let newColors = prev.map((row) => [...row]);
          let currentRowColors = Array(5).fill("gray");

          if (counts.green === 0 && counts.yellow === 0) {
            currentRowColors = Array(5).fill("locked-red");
            const badLetters = guessToSubmit.split("");

            // Retroactively turn older matched tiles red
            newColors = newColors.map((rowColors, rIdx) => {
              const oldGuessObj = game.guesses[rIdx];
              const oldGuessStr =
                typeof oldGuessObj === "string"
                  ? oldGuessObj
                  : oldGuessObj?.word || "";

              if (!oldGuessStr) return rowColors;

              return rowColors.map((col, cIdx) => {
                if (badLetters.includes(oldGuessStr[cIdx])) {
                  return "locked-red";
                }
                return col;
              });
            });
          }

          return [...newColors, currentRowColors];
        });
        setLastSubmittedId((prev) => prev + 1);
        return true;
      }
      return false;
    },
    // Ensure game.targetWord and triggerBannedFlash are in the dependency array
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

  const changeManualColor = (
    rowIndex,
    letterIndex,
    applyToAll = false,
    forceReset = false,
  ) => {
    if (game.gameState !== "playing") return;
    setManualColors((prev) => {
      const newColors = prev.map((row) => [...row]);
      const current = newColors[rowIndex]?.[letterIndex];

      // Exit immediately if the tile is locked or invalid
      if (!current || current === "locked-red") return prev;

      const nextColor = forceReset
        ? "gray"
        : MANUAL_COLORS[
            (MANUAL_COLORS.indexOf(current) + 1) % MANUAL_COLORS.length
          ];

      if (applyToAll && game.guesses) {
        const targetLetter = game.guesses[rowIndex]?.[letterIndex];
        game.guesses.forEach((guessStr, r) => {
          if (typeof guessStr === "string" && newColors[r]) {
            for (let c = 0; c < 5; c++) {
              // Prevent overwriting locked red tiles globally
              if (
                guessStr[c] === targetLetter &&
                newColors[r][c] !== "locked-red"
              ) {
                newColors[r][c] = nextColor;
              }
            }
          }
        });
      } else {
        newColors[rowIndex][letterIndex] = nextColor;
      }
      return newColors;
    });
  };

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
