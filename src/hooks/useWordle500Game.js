import { useEffect, useMemo, useState } from "react";
import data from "../data/words.json";

export const WORDLE500_TURNS = 8;
export const MANUAL_COLORS = ["gray", "red", "yellow", "green"];

const STORAGE_KEY = "mvhmdle-wordle500-state";
export const WORDLE500_TEST_BOSS = "about";

const getInitialState = () => ({
  guesses: [],
  manualColors: [],
  gameState: "playing",
  lastSubmittedId: 0,
});

const getTarget = () => {
  const words = data.slice(0, 500);
  const dayNumber = Math.floor(Date.now() / 86400000);
  return words[(dayNumber * 9301 + 49297) % words.length];
};

export const getLetterStatuses = (guess, target) => {
  const remaining = target.split("");
  const statuses = Array(5).fill("red");

  guess.split("").forEach((letter, index) => {
    if (letter === remaining[index]) {
      statuses[index] = "green";
      remaining[index] = null;
    }
  });

  guess.split("").forEach((letter, index) => {
    if (statuses[index] === "green") return;
    const matchIndex = remaining.indexOf(letter);
    if (matchIndex !== -1) {
      statuses[index] = "yellow";
      remaining[matchIndex] = null;
    }
  });

  return statuses;
};

export const getStatusCounts = (guess, target) => {
  const statuses = getLetterStatuses(guess, target);
  return {
    green: statuses.filter((status) => status === "green").length,
    yellow: statuses.filter((status) => status === "yellow").length,
    red: statuses.filter((status) => status === "red").length,
  };
};

export default function useWordle500Game() {
  const dailyTarget = useMemo(() => getTarget(), []);
  const [targetWord, setTargetWord] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved?.target || getTarget();
    } catch {
      return getTarget();
    }
  });
  const [state, setState] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved?.target ? saved.state : getInitialState();
    } catch {
      return getInitialState();
    }
  });
  const [currentGuess, setCurrentGuess] = useState("");

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ target: targetWord, state }),
    );
  }, [state, targetWord]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(`[DEBUG][wordle500] target word: ${targetWord}`);
    }
  }, [targetWord]);

  const startNewGame = (nextTarget = dailyTarget) => {
    setTargetWord(nextTarget);
    setState(getInitialState());
    setCurrentGuess("");
  };

  const submitGuess = () => {
    if (state.gameState !== "playing" || currentGuess.length !== 5)
      return false;
    const guess = currentGuess.toLowerCase();
    if (state.guesses.includes(guess)) return false;
    if (!data.includes(guess)) return false;

    const guesses = [...state.guesses, guess];
    const won = guess === targetWord;
    const gameState =
      won || guesses.length >= WORDLE500_TURNS
        ? won
          ? "won"
          : "lost"
        : "playing";

    // 1. Calculate the exact statuses for the submitted guess
    const counts = getStatusCounts(guess, targetWord);

    let newManualColors = [...state.manualColors];
    let currentRowColors = Array(5).fill("gray");

    // 2. If all 5 letters are completely incorrect
    if (counts.green === 0 && counts.yellow === 0) {
      currentRowColors = Array(5).fill("locked-red");
      const badLetters = guess.split("");

      // 3. Retroactively turn these specific letters red in older guesses
      newManualColors = newManualColors.map((rowColors, rIdx) => {
        const oldGuess = state.guesses[rIdx];
        return rowColors.map((col, cIdx) => {
          if (badLetters.includes(oldGuess[cIdx])) {
            return "locked-red";
          }
          return col;
        });
      });
    }

    newManualColors.push(currentRowColors);

    setState({
      guesses,
      manualColors: newManualColors,
      gameState,
      lastSubmittedId: state.lastSubmittedId + 1,
    });
    setCurrentGuess("");
    return true;
  };

  const changeManualColor = (
    rowIndex,
    letterIndex,
    applyToAll = false,
    forceReset = false,
  ) => {
    if (state.gameState !== "playing") return;

    setState((previous) => {
      const manualColors = previous.manualColors.map((row) => [...row]);
      const current = manualColors[rowIndex]?.[letterIndex];

      // Exit immediately if the tile is locked or invalid
      if (!current || current === "locked-red") return previous;

      const nextColor = forceReset
        ? "gray"
        : MANUAL_COLORS[
            (MANUAL_COLORS.indexOf(current) + 1) % MANUAL_COLORS.length
          ];

      if (applyToAll) {
        const targetLetter = previous.guesses[rowIndex][letterIndex];
        previous.guesses.forEach((guess, r) => {
          for (let c = 0; c < 5; c++) {
            // Prevent overwriting locked red tiles globally
            if (
              guess[c] === targetLetter &&
              manualColors[r] &&
              manualColors[r][c] !== "locked-red"
            ) {
              manualColors[r][c] = nextColor;
            }
          }
        });
      } else {
        manualColors[rowIndex][letterIndex] = nextColor;
      }

      return { ...previous, manualColors };
    });
  };

  const typeLetter = (letter) => {
    if (state.gameState === "playing" && currentGuess.length < 5) {
      setCurrentGuess((guess) => `${guess}${letter}`);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Backspace")
      setCurrentGuess((guess) => guess.slice(0, -1));
    else if (event.key === "Enter") submitGuess();
    else if (/^[a-z]$/i.test(event.key)) typeLetter(event.key.toLowerCase());
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return {
    ...state,
    targetWord,
    currentGuess,
    submitGuess,
    typeLetter,
    handleKeyDown,
    changeManualColor,
    reset: () => startNewGame(),
    startTestGame: () => startNewGame(WORDLE500_TEST_BOSS),
    isTyped: (letter) => state.guesses.some((guess) => guess.includes(letter)),
  };
}
