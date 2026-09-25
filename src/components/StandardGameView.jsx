import Shop from "./Shop";
import Tiles from "./Tiles";
import HistoryPanel from "./HistoryPanel";
import Keyboard from "./Keyboard";

export default function StandardGameView({
  game,
  progress,
  gameResetKey,
  isModalOpen,
  handleBuyHint,
  handleGameOver,
  addToast,
}) {
  return (
    <>
      <div className="flex-10 flex justify-center items-center gap-6 px-10 overflow-y-auto clean-scroll">
        <div className="w-72">
          <Shop
            currency={progress.currency}
            hearts={progress.hearts}
            hintsArray={progress.hintsArray}
            onBuyHint={handleBuyHint}
            hintsUsedInRound={progress.hintsUsedInRound}
            hasGuesses={game.guesses.length > 0}
            gameState={game.gameState}
            isModalOpen={isModalOpen}
          />
        </div>
        <div className="w-96">
          <Tiles
            key={gameResetKey}
            guesses={game.guesses}
            turn={game.turn}
            targetWord={game.targetWord}
            gameState={game.gameState}
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
            onGameOver={handleGameOver}
            addToast={addToast}
            rowCount={game.maxTurns}
          />
        </div>
        <div className="w-72">
          <HistoryPanel history={progress.hintHistory} />
        </div>
      </div>
      <div className="flex-5 center shrink-0 mb-4">
        <Keyboard letters={game.letters} lastChanged={game.lastChanged} />
      </div>
    </>
  );
}
