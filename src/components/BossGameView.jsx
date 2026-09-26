import { useEffect } from "react";
import BossTiles from "./BossTiles";
import Keyboard from "./Keyboard";
import SurvivalWordle500Wrapper from "./SurvivalWordle500Wrapper";
import GameBoardLayout from "./GameBoardLayout"; // [REFACTORED]

export default function BossGameView({
  game,
  progress,
  gameResetKey,
  bossKeyboardView,
  setBossKeyboardView,
  bossKeyboardLineColors,
  handleGameOver,
  addToast,
}) {
  const isWordle500Boss = game.bossType === "wordle500";
  const multiWordCount = game.bossWordCount || game.targetWords?.length || 0;

  useEffect(() => {
    if (!isWordle500Boss && multiWordCount > 1) {
      setBossKeyboardView("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameResetKey, multiWordCount]);

  const displayLetters =
    isWordle500Boss && game.letters
      ? Object.fromEntries(
          Object.entries(game.letters).map(([key, val]) => {
            const isDefault = !val.color || val.color.includes("bg-gameLight");
            return [
              key,
              {
                ...val,
                color: isDefault
                  ? "bg-gameLight border-gameLight text-gameDark"
                  : "bg-gameGrey border-gameGrey text-gameDark",
              },
            ];
          }),
        )
      : game.letters;

  return (
    <GameBoardLayout
      boardContainerClass="flex-1"
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
        ) : (
          <BossTiles
            key={gameResetKey}
            guesses={game.guesses}
            turn={game.turn}
            targetWords={game.targetWords}
            gameState={game.gameState}
            bannedRows={game.bannedRows}
            onGuessSubmit={(g, wordIdx, triggerShake, triggerBannedFlash, onDuplicateWord) => {
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
        <Keyboard
          letters={displayLetters}
          lastChanged={game.lastChanged}
          lineColorsByLetter={isWordle500Boss ? {} : bossKeyboardLineColors}
          bossWordCount={isWordle500Boss ? 0 : multiWordCount}
          selectedView={bossKeyboardView}
          onSelectedViewChange={setBossKeyboardView}
        />
      }
    />
  );
}
