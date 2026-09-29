// components/BossGameView.jsx
import { useEffect, useState } from "react";
import BossTiles from "./BossTiles";
import Keyboard from "./Keyboard";
import SurvivalWordle500Wrapper from "./SurvivalWordle500Wrapper";
import GameBoardLayout from "./GameBoardLayout";
import Tiles from "./Tiles";
import { ShapeLeftPanel, ShapeRightPanel } from "./ShapeBossPanels";
import { BombLeftPanel, BombRightPanel } from "./BombBossPanels";
import { RapidleLeftPanel, RapidleRightPanel } from "./RapidlePanels";

export default function BossGameView({
  game,
  progress,
  gameResetKey,
  bossKeyboardView,
  setBossKeyboardView,
  bossKeyboardLineColors,
  handleGameOver,
  addToast,
  isBombTimerPaused,
  isRapidleTimerPaused,
}) {
  const isWordle500Boss = game.bossType === "500dle";
  const isShapeBoss = game.bossCategory === "shape";
  const isBombBoss = game.bossCategory === "bomb";
  const isRapidleBoss = game.bossCategory === "rapidle";

  const multiWordCount = game.bossWordCount || game.targetWords?.length || 0;

  const [wordle500State, setWordle500State] = useState(() => {
    try {
      const savedColors =
        JSON.parse(localStorage.getItem("survival-wordle500-manual-colors")) ||
        [];
      const hasColors = savedColors.some((row) =>
        row.some((color) => color !== "gray" && color !== "locked-red"),
      );
      return { hasColors, manualColors: savedColors };
    } catch {
      return { hasColors: false, manualColors: [] };
    }
  });

  useEffect(() => {
    if (
      !isWordle500Boss &&
      !isShapeBoss &&
      !isBombBoss &&
      !isRapidleBoss &&
      multiWordCount > 1
    ) {
      setBossKeyboardView("all");
    }
  }, [
    gameResetKey,
    multiWordCount,
    isWordle500Boss,
    isShapeBoss,
    isBombBoss,
    isRapidleBoss,
    setBossKeyboardView,
  ]);

  useEffect(() => {
    const handleStatus = (e) => setWordle500State(e.detail);
    window.addEventListener("wordle500-colors-status", handleStatus);
    return () =>
      window.removeEventListener("wordle500-colors-status", handleStatus);
  }, []);

  const showClearButton = wordle500State.hasColors;

  let wordle500LetterColors = {};
  if (isWordle500Boss && game.guesses && wordle500State.manualColors) {
    game.guesses.forEach((guessObj, rIdx) => {
      const guessStr =
        typeof guessObj === "string" ? guessObj : guessObj?.word || "";
      const isWinningGuess =
        game.gameState === "won" && guessStr === game.targetWord;

      for (let cIdx = 0; cIdx < 5; cIdx++) {
        const char = guessStr[cIdx];
        if (!char) continue;

        let color = wordle500State.manualColors[rIdx]?.[cIdx];
        if (isWinningGuess) {
          color = "green";
        }

        const currentHighest = wordle500LetterColors[char];
        if (color === "green") {
          wordle500LetterColors[char] = "green";
        } else if (color === "yellow" && currentHighest !== "green") {
          wordle500LetterColors[char] = "yellow";
        } else if (!currentHighest) {
          wordle500LetterColors[char] = "gray";
        }
      }
    });
  }

  const isUncoloredKeyboard = isShapeBoss || isBombBoss || isRapidleBoss;

  const displayLetters = isUncoloredKeyboard
    ? Object.fromEntries(
        Object.keys(game.letters).map((key) => [
          key,
          {
            ...game.letters[key],
            color: "bg-gameLight border-gameLight text-gameDark",
          },
        ]),
      )
    : isWordle500Boss && game.letters
      ? Object.fromEntries(
          Object.entries(game.letters).map(([key, val]) => {
            const isDefault = !val.color || val.color.includes("bg-gameLight");
            let finalColorClass = "bg-gameLight border-gameLight text-gameDark";

            if (!isDefault) {
              const highest = wordle500LetterColors[key];
              if (highest === "green") {
                finalColorClass = "bg-gameGreen border-gameGreen text-gameDark";
              } else if (highest === "yellow") {
                finalColorClass =
                  "bg-gameYellow border-gameYellow text-gameDark";
              } else {
                finalColorClass = "bg-gameGrey border-gameGrey text-gameDark";
              }
            }

            return [
              key,
              {
                ...val,
                color: finalColorClass,
              },
            ];
          }),
        )
      : game.letters;

  return (
    <GameBoardLayout
      boardContainerClass={isUncoloredKeyboard ? "w-96" : "flex-1"}
      leftPanel={
        isShapeBoss ? (
          <ShapeLeftPanel key={`sl-${gameResetKey}`} bossType={game.bossType} />
        ) : isBombBoss ? (
          <BombLeftPanel
            key={`bl-${gameResetKey}`}
            currentPhrase={game.bombPhrases?.[game.turn]}
          />
        ) : isRapidleBoss ? (
          <RapidleLeftPanel
            key={`ral-${gameResetKey}`}
            guessesCount={game.guesses?.length || 0}
          />
        ) : null
      }
      rightPanel={
        isShapeBoss ? (
          <ShapeRightPanel
            key={`sr-${gameResetKey}`}
            targetWord={game.targetWord}
            mistakes={game.shapeMistakes}
          />
        ) : isBombBoss ? (
          <BombRightPanel
            key={`br-${gameResetKey}`}
            gameState={game.gameState}
            bombTimeLeft={game.bombTimeLeft}
            setBombTimeLeft={game.setBombTimeLeft}
            onTimeUp={() => game.triggerBombTimeUp(handleGameOver)}
            isPaused={isBombTimerPaused}
          />
        ) : isRapidleBoss ? (
          <RapidleRightPanel
            key={`rar-${gameResetKey}`}
            gameState={game.gameState}
            rapidleTimeLeft={game.rapidleTimeLeft}
            setRapidleTimeLeft={game.setRapidleTimeLeft}
            onTimeUp={() => game.triggerRapidleTimeUp(handleGameOver)}
            isPaused={isRapidleTimerPaused}
          />
        ) : null
      }
      board={
        isWordle500Boss ? (
          <SurvivalWordle500Wrapper
            key={gameResetKey}
            game={game}
            onGuessSubmit={(
              g,
              _wordIdx,
              triggerShake,
              triggerBannedFlash,
              onDuplicateWord,
            ) => {
              const accepted = game.submitGuess(
                g,
                0,
                handleGameOver,
                () => {
                  triggerShake?.();
                  triggerBannedFlash?.();
                  addToast("This word is banned", "error");
                },
                onDuplicateWord,
              );
              if (accepted) progress.addWordsTyped(1);
              return accepted;
            }}
            onGameOver={handleGameOver}
            addToast={addToast}
          />
        ) : isShapeBoss || isBombBoss || isRapidleBoss ? (
          <Tiles
            key={gameResetKey}
            guesses={game.guesses}
            turn={game.turn}
            targetWord={game.targetWord}
            gameState={game.gameState}
            bannedRows={game.bannedRows}
            isShapeMode={isShapeBoss}
            isBombMode={isBombBoss}
            isRapidleMode={isRapidleBoss}
            onGuessSubmit={(
              g,
              _wordIdx,
              triggerShake,
              triggerBannedFlash,
              onDuplicateWord,
            ) => {
              const accepted = game.submitGuess(
                g,
                0,
                handleGameOver,
                () => {
                  triggerShake?.();
                  triggerBannedFlash?.();
                  addToast("This word is banned", "error");
                },
                onDuplicateWord,
                () => {
                  triggerShake?.();
                  addToast(
                    isBombBoss
                      ? "Phrase missing!"
                      : `Shape mismatch! Mistakes left: ${game.shapeMistakes - 1}`,
                    "error",
                  );
                },
              );
              if (accepted) progress.addWordsTyped(1);
              return accepted;
            }}
            onGameOver={handleGameOver}
            addToast={addToast}
            rowCount={game.maxTurns}
          />
        ) : (
          <BossTiles
            key={gameResetKey}
            guesses={game.guesses}
            turn={game.turn}
            targetWords={game.targetWords}
            gameState={game.gameState}
            bannedRows={game.bannedRows}
            onGuessSubmit={(
              g,
              wordIdx,
              triggerShake,
              triggerBannedFlash,
              onDuplicateWord,
            ) => {
              const accepted = game.submitGuess(
                g,
                wordIdx,
                handleGameOver,
                () => {
                  triggerShake?.();
                  triggerBannedFlash?.();
                  addToast("This word is banned", "error");
                },
                onDuplicateWord,
              );
              if (accepted) progress.addWordsTyped(1);
              return accepted;
            }}
            onGameOver={handleGameOver}
            addToast={addToast}
            rowCount={game.maxTurns}
            selectedView={bossKeyboardView}
            onWordClick={setBossKeyboardView}
            onWordDoubleClick={(wordIdx) =>
              setBossKeyboardView((currentView) =>
                currentView === wordIdx ? "all" : wordIdx,
              )
            }
          />
        )
      }
      keyboard={
        <div className="flex flex-col items-center gap-3 w-full">
          {isWordle500Boss && (
            <div
              className={`w-full flex justify-center px-4 max-w-2xl mx-auto transition-opacity duration-300 ease-in-out ${showClearButton ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            >
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("clear-wordle500"))
                }
                className="flex items-center gap-2 bg-gameRed/10 hover:bg-gameRed/20 border border-gameRed/50 text-gameRed px-4 py-1.5 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 font-bold text-xs uppercase tracking-widest"
                title="Clear All Board Colors (Ctrl + Right Click)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear Colors
              </button>
            </div>
          )}

          <Keyboard
            letters={displayLetters}
            lastChanged={game.lastChanged}
            lineColorsByLetter={
              isUncoloredKeyboard ? {} : bossKeyboardLineColors
            }
            bossWordCount={isUncoloredKeyboard ? 0 : multiWordCount}
            selectedView={bossKeyboardView}
            onSelectedViewChange={setBossKeyboardView}
          />
        </div>
      }
    />
  );
}
