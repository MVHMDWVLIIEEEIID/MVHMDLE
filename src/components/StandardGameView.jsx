// components/StandardGameView.jsx
import { useState } from "react";
import Tiles from "./Tiles";
import Keyboard from "./Keyboard";
import GameBoardLayout from "./GameBoardLayout";
import ShopPopover from "./ShopPopover";
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

      {/* Shop Wrapper: Positions both the button and the popover above it */}
      <div className="absolute bottom-4 left-4 z-40 flex flex-col items-start">
        <ShopPopover
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
        
        {/* NEW: Bigger, Green, 90% Opacity Shop Button with Cart Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsShopOpen((prev) => !prev);
            document.activeElement.blur();
            window.focus();
          }}
          className="flex flex-col items-center justify-center w-16 h-16 bg-gameGreen/90 hover:bg-gameGreen text-gameDark border-2 border-gameGreen rounded-2xl shadow-[0_0_15px_rgba(0,225,150,0.3)] hover:shadow-[0_0_20px_rgba(0,225,150,0.5)] transition-all active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 mb-0.5"
          >
            <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">
            Shop
          </span>
        </button>
      </div>
    </>
  );
}