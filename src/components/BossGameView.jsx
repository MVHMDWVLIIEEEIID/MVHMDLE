import BossTiles from "./BossTiles";
import BossKeyboard from "./BossKeyboard";
import SurvivalWordle500Wrapper from "./SurvivalWordle500Wrapper"; // <-- Import the wrapper

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

  return (
    <>
      <div className="flex-10 flex justify-center items-center gap-6 px-10 overflow-y-auto clean-scroll">
        <div className="flex-1 flex justify-center">
          {isWordle500Boss ? (
            <SurvivalWordle500Wrapper
              key={gameResetKey}
              game={game}
              onGuessSubmit={(g, _wordIdx, triggerShake, onDuplicateWord) => {
                const accepted = game.submitGuess(
                  g,
                  0,
                  handleGameOver,
                  () => {
                    triggerShake?.();
                    addToast("This word is banned", "error");
                  },
                  onDuplicateWord,
                );
                if (accepted) progress.addWordsTyped(1);
                return accepted;
              }}
              addToast={addToast}
            />
          ) : (
            <BossTiles
              key={gameResetKey}
              guesses={game.guesses}
              turn={game.turn}
              targetWords={game.targetWords}
              gameState={game.gameState}
              onGuessSubmit={(g, wordIdx, triggerShake, onDuplicateWord) => {
                const accepted = game.submitGuess(
                  g,
                  wordIdx,
                  handleGameOver,
                  () => {
                    triggerShake?.();
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
          )}
        </div>
      </div>
      <div className="flex-5 center shrink-0 mb-4">
        <BossKeyboard
          letters={game.letters}
          lastChanged={game.lastChanged}
          lineColorsByLetter={bossKeyboardLineColors}
          bossWordCount={isWordle500Boss ? 0 : game.bossWordCount}
          selectedView={bossKeyboardView}
          onSelectedViewChange={setBossKeyboardView}
        />
      </div>
    </>
  );
}
