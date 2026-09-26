import React from "react";
import { getGuessStatuses } from "../utils/gameUtils";

export default function WordGrid({
  guesses = [],
  currentGuess = "",
  targetWord = "",
  turn = 0,
  rowCount = 6,
  gameState = "playing",
  shake = false,
  lastSubmittedTurn = -1,
  pendingFlipTurn = -1,
  sizeMode = "normal",
  hideEmptyRowsAfterWin = false,
  bannedRows = 0,
  bannedFlash = false,
}) {
  const items = [];
  const flipDelay = sizeMode === "normal" ? 150 : 100;

  // [FIX] العثور على السطر الذي تم فيه حل الكلمة بنجاح
  const solvedRowIndex = guesses.findIndex(
    (g) => g && targetWord && g.toLowerCase() === targetWord.toLowerCase(),
  );
  const isGridSolved = solvedRowIndex !== -1;

  for (let i = 0; i < rowCount; i++) {
    // [FIX] إخفاء السطور الزائدة إذا تم حل الكلمة والخاصية مفعلة
    if (hideEmptyRowsAfterWin && isGridSolved && i > solvedRowIndex) {
      continue;
    }

    const isBannedRow = i < bannedRows;
    const isPrevRow = i < turn || (gameState === "won" && i === turn);

    // [FIX] منع ظهور مؤشر الكتابة (المربعات البيضاء) على الشبكة التي تم حلها بالفعل
    const isCurrentRow = i === turn && gameState === "playing" && !isGridSolved;

    const rowWord = guesses[i] || "";
    const rowHasGuess = Boolean(rowWord);

    const isPendingRevealRow = i === pendingFlipTurn && rowHasGuess;
    const shouldFlip = i === lastSubmittedTurn && rowHasGuess;
    const shouldShowStatuses = isPrevRow && rowHasGuess && !isPendingRevealRow;

    let rowLetters = Array(5).fill("");
    let rowStatuses = Array(5).fill("");

    if (isPrevRow && rowHasGuess) {
      rowLetters = rowWord.split("");
    }
    if (shouldShowStatuses) {
      rowStatuses = getGuessStatuses(rowWord, targetWord);
    } else if (isCurrentRow) {
      rowLetters = currentGuess.split("");
    }

    // [FIX] إعطاء شفافية كاملة للسطر الفائز حتى لو لم تنتهِ اللعبة الكلية بعد
    const isSolvedRow = isGridSolved && i === solvedRowIndex;

    for (let j = 0; j < 5; j++) {
      const char = rowLetters[j];
      const isNextTile = isCurrentRow && j === currentGuess.length;

      let colorClass = "bg-gameLight border-gameLight text-gameDark";
      if (shouldShowStatuses) {
        if (rowStatuses[j] === "bg-gameGreen")
          colorClass = "bg-gameGreen border-gameGreen text-gameDark";
        else if (rowStatuses[j] === "bg-gameYellow")
          colorClass = "bg-gameYellow border-gameYellow text-gameDark";
        else colorClass = "bg-gameGrey border-gameGrey text-gameDark";
      }

      let tileWidthClass = "w-11";
      let tileHeight = isCurrentRow ? "h-11" : "h-11";
      let fontSize = "text-2xl";
      let tileMargin = "m-0.5";
      const opacityClass =
        isCurrentRow || (gameState === "won" && i === turn) || isSolvedRow
          ? "opacity-100"
          : "opacity-60";

      if (sizeMode === "boss-4") {
        tileWidthClass = "w-10";
        tileHeight = isCurrentRow ? "h-10" : "h-7";
        fontSize = isCurrentRow ? "text-2xl" : "text-[22px]";
        tileMargin = "m-[1.5px]";
      } else if (sizeMode === "boss-2") {
        tileWidthClass = "w-12";
        tileHeight = isCurrentRow ? "h-11" : "h-10";
        fontSize = isCurrentRow ? "text-[26px]" : "text-[22px]";
        tileMargin = "m-[1.5px]";
      }

      items.push(
        <input
          key={`${i}-${j}`}
          className={`text-center ${tileWidthClass} ${tileHeight} ${tileMargin} ${fontSize} pointer-events-none font-bold uppercase border-2 transition-[height,font-size,background-color,border-color,color] duration-300 ease-out outline-none rounded aspect-square
            ${opacityClass}
            ${shouldFlip ? "animate-flip" : ""}
            ${shake && isCurrentRow ? "animate-shake border-red-500!" : isNextTile ? "border-gameBlue!" : isBannedRow && !shouldShowStatuses && bannedFlash ? "border-gameRed" : "border-transparent"}
            ${colorClass}`}
          style={
            shouldFlip
              ? {
                  animationDelay: `${j * flipDelay}ms`,
                  transitionDelay: `${j * flipDelay + 300}ms`,
                }
              : {}
          }
          value={char || ""}
          readOnly
        />,
      );
    }
  }

  const gridGap =
    sizeMode === "boss-4"
      ? "gap-px"
      : sizeMode === "boss-2"
        ? "gap-1"
        : "gap-0.5";

  return (
    <div className={`grid grid-cols-5 ${gridGap} w-fit mx-auto`}>{items}</div>
  );
}
