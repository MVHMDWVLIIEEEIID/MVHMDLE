// components/BossTiles.jsx
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import useGameInput from "../hooks/useGameInput";
import WordGrid from "./WordGrid";

const RESIZE_BEFORE_FLIP_MS = 300;
const FLIP_TOTAL_MS = 1250;
const WORD_CLICK_DELAY_MS = 250;

export default function BossTiles({
  guesses = [],
  turn = 0,
  targetWords = [],
  gameState = "playing",
  onGuessSubmit,
  onGameOver,
  addToast,
  rowCount = 6,
  bannedRows = 0,
  selectedView = "all",
  onWordClick,
  onWordDoubleClick,
  isPaused = false,
}) {
  const solutions = useMemo(
    () => targetWords.map((w) => w?.toLowerCase()),
    [targetWords],
  );

  const [shake, setShake] = useState(false);
  const [bannedFlash, setBannedFlash] = useState(false);
  const [pendingFlipTurn, setPendingFlipTurn] = useState(-1);
  const [lastSubmittedTurn, setLastSubmittedTurn] = useState(-1);
  const wordClickTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (wordClickTimerRef.current) clearTimeout(wordClickTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (pendingFlipTurn < 0) return undefined;
    const timeoutId = setTimeout(() => {
      setLastSubmittedTurn(pendingFlipTurn);
      setPendingFlipTurn(-1);
    }, RESIZE_BEFORE_FLIP_MS);
    return () => clearTimeout(timeoutId);
  }, [pendingFlipTurn]);

  useEffect(() => {
    if (lastSubmittedTurn < 0) return undefined;
    const timeoutId = setTimeout(() => {
      setLastSubmittedTurn(-1);
    }, FLIP_TOTAL_MS);
    return () => clearTimeout(timeoutId);
  }, [lastSubmittedTurn]);

  const isFourWordMode = solutions.length === 4;
  const isTwoWordMode = solutions.length === 2;
  const sizeMode = isFourWordMode
    ? "boss-4"
    : isTwoWordMode
      ? "boss-2"
      : "normal";

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
      const allSolved = solutions.every((solution, idx) =>
        guesses.some((g) => g.word === solution && g.wordIndex === idx),
      );

      if (allSolved) {
        triggerShake();
        if (addToast) addToast("Already completed!", "error");
        return false;
      }

      const accepted = onGuessSubmit(
        guessToSubmit,
        isFourWordMode ? undefined : 0,
        triggerShake,
        triggerBannedFlash,
        () => {
          triggerShake();
          if (addToast) addToast("Word already submitted!", "error");
        },
      );

      if (accepted) {
        setPendingFlipTurn(turn);
        return true;
      }
      return false;
    },
    [
      solutions,
      guesses,
      onGuessSubmit,
      triggerShake,
      triggerBannedFlash,
      addToast,
      turn,
      isFourWordMode,
    ],
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
    isPaused, // Passed down from parent
  });

  const containerClass = isFourWordMode
    ? "flex flex-row gap-4 w-fit"
    : "flex flex-row gap-20 w-fit mx-auto";

  return (
    <div className={containerClass}>
      {solutions.map((solution, wordIdx) => {
        const wordGuessesObjs = guesses.filter((g) => g.wordIndex === wordIdx);
        const isSolved = wordGuessesObjs.some((g) => g.word === solution);

        const gridGuesses = Array(rowCount).fill("");
        wordGuessesObjs.forEach((g) => {
          if (typeof g.rowNumber === "number") {
            gridGuesses[g.rowNumber] = g.word;
          }
        });

        return (
          <div
            key={wordIdx}
            className="flex flex-col items-center m-0 p-0"
            onClick={() => {
              if (wordClickTimerRef.current)
                clearTimeout(wordClickTimerRef.current);
              wordClickTimerRef.current = setTimeout(() => {
                onWordClick?.(wordIdx);
                wordClickTimerRef.current = null;
              }, WORD_CLICK_DELAY_MS);
            }}
            onDoubleClick={() => {
              if (wordClickTimerRef.current) {
                clearTimeout(wordClickTimerRef.current);
                wordClickTimerRef.current = null;
              }
              onWordDoubleClick?.(wordIdx);
            }}
          >
            <div
              className={`transition-opacity duration-200 ease-out ${
                selectedView === "all" || selectedView === wordIdx
                  ? "opacity-100"
                  : "opacity-60"
              }`}
            >
              <WordGrid
                guesses={gridGuesses}
                currentGuess={currentGuess}
                targetWord={solution}
                turn={turn}
                rowCount={rowCount}
                gameState={gameState}
                shake={shake}
                lastSubmittedTurn={lastSubmittedTurn}
                pendingFlipTurn={pendingFlipTurn}
                sizeMode={sizeMode}
                hideEmptyRowsAfterWin={true}
                bannedRows={bannedRows}
                bannedFlash={bannedFlash}
              />
            </div>
            {isSolved && (
              <div className="mt-2 px-4 py-1 text-gameGreen font-bold rounded text-sm w-full border center">
                Word Defeated
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
