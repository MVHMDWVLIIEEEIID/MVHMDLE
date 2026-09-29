import { useState } from "react";
import Tiles from "./Tiles";
import Keyboard from "./Keyboard";
import GameBoardLayout from "./GameBoardLayout";
import ShopModal from "./ShopModal";
import useKeyboardIndicators from "../hooks/useKeyboardIndicators";

export default function StandardGameView({
  game,
  progress,
  gameResetKey,
  isModalOpen,
  handleBuyHint,
  handleGameOver,
  addToast,
}) {
  const [isShopOpen, setIsShopOpen] = useState(false);

  // Extract parsed hint indicators strictly from the active game session
  const indicators = useKeyboardIndicators(progress.hintHistory);

  return (
    <>
      <GameBoardLayout
        boardContainerClass="w-96"
        // Note: leftPanel and rightPanel are intentionally excluded for a clean UI
        board={
          <Tiles
            key={gameResetKey}
            guesses={game.guesses}
            turn={game.turn}
            targetWord={game.targetWord}
            gameState={game.gameState}
            bannedRows={game.bannedRows}
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
            rowCount={game.maxTurns}
          />
        }
        keyboard={
          <Keyboard
            letters={game.letters}
            lastChanged={game.lastChanged}
            indicators={indicators}
          />
        }
      />

      {/* Floating Shop Button matches the Guide Button placement on the left */}
      <button
        onClick={() => {
          setIsShopOpen(true);
          document.activeElement.blur();
          window.focus();
        }}
        className="absolute bottom-4 right-4 bg-gameLight/20 hover:bg-gameLight text-white/50 hover:text-gameDark text-[10px] font-bold py-2 px-3 rounded-lg border border-gameLight/30 transition-all z-40 uppercase tracking-widest"
      >
        Hints Shop
      </button>

      {/* Shop Overlay */}
      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        currency={progress.currency}
        hearts={progress.hearts}
        hintsArray={progress.hintsArray}
        onBuyHint={handleBuyHint}
        hintsUsedInRound={progress.hintsUsedInRound}
        gameState={game.gameState}
        isModalOpen={isModalOpen}
      />
    </>
  );
}
