import Shop from "./Shop";
import Tiles from "./Tiles";
import HistoryPanel from "./HistoryPanel";
import Keyboard from "./Keyboard";
import GameBoardLayout from "./GameBoardLayout"; // [REFACTORED]

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
    <GameBoardLayout
      boardContainerClass="w-96"
      leftPanel={
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
      }
      board={
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
      }
      rightPanel={<HistoryPanel history={progress.hintHistory} />}
      keyboard={
        <Keyboard letters={game.letters} lastChanged={game.lastChanged} />
      }
    />
  );
}
