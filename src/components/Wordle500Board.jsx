import { useEffect, useRef, useState } from "react";
import {
  getLetterStatuses,
  getStatusCounts,
  MANUAL_COLORS,
  WORDLE500_TURNS,
} from "../hooks/useWordle500Game";

const RESIZE_BEFORE_FLIP_MS = 300;
const FLIP_TOTAL_MS = 1250;
const FLIP_ANIMATION_MS = 600;
const TILE_REVEAL_STEP_MS = 100;

const colorClasses = {
  gray: "bg-gameGrey border-gameGrey text-gameDark",
  red: "bg-gameRed border-gameRed text-white",
  yellow: "bg-gameYellow border-gameYellow text-gameDark",
  green: "bg-gameGreen border-gameGreen text-gameDark",
};

const countColors = {
  green: "bg-gameGreen border-gameGreen text-gameDark",
  yellow: "bg-gameYellow border-gameYellow text-gameDark",
  red: "bg-gameRed border-gameRed text-white",
};

export default function Wordle500Board({ game }) {
  const [revealingSubmissionId, setRevealingSubmissionId] = useState(null);
  const [revealedCountColors, setRevealedCountColors] = useState(() =>
    game.lastSubmittedId
      ? Object.fromEntries(
          Object.keys(countColors).map((color) => [
            color,
            game.lastSubmittedId,
          ]),
        )
      : null,
  );
  const previousSubmissionIdRef = useRef(game.lastSubmittedId || 0);

  useEffect(() => {
    const submissionId = game.lastSubmittedId || 0;
    if (submissionId === previousSubmissionIdRef.current || submissionId === 0)
      return undefined;

    previousSubmissionIdRef.current = submissionId;

    const startTimer = setTimeout(() => {
      setRevealingSubmissionId({ id: submissionId, phase: "resizing" });
    }, 0);

    const revealTimers = Object.keys(countColors).map((color, index) =>
      setTimeout(
        () => {
          setRevealedCountColors((revealedColors) => ({
            ...revealedColors,
            [color]: submissionId,
          }));
        },
        RESIZE_BEFORE_FLIP_MS +
          FLIP_ANIMATION_MS / 2 +
          index * TILE_REVEAL_STEP_MS,
      ),
    );
    const resizeTimer = setTimeout(() => {
      setRevealingSubmissionId({ id: submissionId, phase: "flipping" });
    }, RESIZE_BEFORE_FLIP_MS);
    const clearTimer = setTimeout(() => {
      setRevealingSubmissionId(null);
    }, FLIP_TOTAL_MS);

    return () => {
      clearTimeout(startTimer);
      revealTimers.forEach(clearTimeout);
      clearTimeout(resizeTimer);
      clearTimeout(clearTimer);
    };
  }, [game.lastSubmittedId]);

  const rows = Array.from({ length: WORDLE500_TURNS }, (_, rowIndex) => {
    const guess =
      game.guesses[rowIndex] ||
      (rowIndex === game.guesses.length ? game.currentGuess : "");
    const isSubmitted = rowIndex < game.guesses.length;
    const actualColors = isSubmitted
      ? getLetterStatuses(guess, game.targetWord)
      : [];
    const colors =
      game.gameState === "playing" ? game.manualColors[rowIndex] : actualColors;
    const counts = isSubmitted ? getStatusCounts(guess, game.targetWord) : null;
    const isLastSubmittedRow =
      isSubmitted && rowIndex === game.guesses.length - 1;
    const isResizingRow =
      isLastSubmittedRow &&
      revealingSubmissionId?.id === game.lastSubmittedId &&
      revealingSubmissionId.phase === "resizing";
    const shouldFlipCounts =
      isLastSubmittedRow &&
      revealingSubmissionId?.id === game.lastSubmittedId &&
      revealingSubmissionId.phase === "flipping";

    const isCurrentRow =
      rowIndex === game.guesses.length && game.gameState === "playing";
    const isUncoloredRow = isCurrentRow || isResizingRow;

    return (
      <div
        className="flex items-center gap-1"
        key={`wordle500-row-${rowIndex}`}
      >
        <div className="grid grid-cols-5 gap-px">
          {Array.from({ length: 5 }, (_, letterIndex) => {
            const letter = guess[letterIndex] || "";
            const color = isSubmitted
              ? colors?.[letterIndex] || "gray"
              : "gray";
            const clickable = isSubmitted && game.gameState === "playing";
            return (
              <button
                key={`${rowIndex}-${letterIndex}`}
                type="button"
                tabIndex={-1}
                disabled={!clickable}
                aria-label={`${letter || "empty"} letter ${letterIndex + 1}, ${color}`}
                onClick={(e) => {
                  e.currentTarget.blur();
                  game.changeManualColor(rowIndex, letterIndex);
                }}
                className={`flex h-10 w-10 m-[1.5px] items-center justify-center rounded border-2 text-2xl font-bold uppercase outline-none transition-colors duration-300 ease-out ${isUncoloredRow ? "bg-gameLight border-gameLight text-gameDark" : colorClasses[color]} ${clickable ? "cursor-pointer hover:scale-105" : "cursor-default"} ${isCurrentRow && letterIndex === game.currentGuess.length ? "border-gameGreen!" : "border-transparent"}`}
              >
                {letter}
              </button>
            );
          })}
        </div>
        <div
          className="flex gap-px"
          aria-label={
            counts
              ? `${counts.green} green, ${counts.yellow} yellow, ${counts.red} red`
              : "No result yet"
          }
        >
          {Object.keys(countColors).map((color) => (
            <div
              key={`${color}-${game.lastSubmittedId || 0}`}
              className={`flex h-10 w-10 m-[1.5px] items-center justify-center rounded border-2 text-2xl font-bold outline-none ${countColors[color]} ${shouldFlipCounts ? "animate-flip" : ""}`}
              style={
                shouldFlipCounts
                  ? {
                      animationDelay: `${Object.keys(countColors).indexOf(color) * TILE_REVEAL_STEP_MS}ms`,
                    }
                  : undefined
              }
            >
              {counts &&
              (!isLastSubmittedRow ||
                revealedCountColors?.[color] === game.lastSubmittedId)
                ? counts[color]
                : ""}
            </div>
          ))}
        </div>
      </div>
    );
  });

  return <div className="flex flex-col gap-px">{rows}</div>;
}

export { MANUAL_COLORS };
