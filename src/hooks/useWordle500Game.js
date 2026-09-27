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

export const getUpdatedSubmitColors = (
  guessToSubmit,
  targetWord,
  currentColors,
  guesses,
) => {
  const counts = getStatusCounts(guessToSubmit, targetWord);
  let newColors = currentColors.map((row) => [...row]);
  let currentRowColors = Array(5).fill("gray");

  if (counts.green === 0 && counts.yellow === 0) {
    currentRowColors = Array(5).fill("locked-red");
    const badLetters = guessToSubmit.split("");

    newColors = newColors.map((rowColors, rIdx) => {
      const oldGuessObj = guesses[rIdx];
      const oldGuessStr =
        typeof oldGuessObj === "string" ? oldGuessObj : oldGuessObj?.word || "";

      if (!oldGuessStr) return rowColors;

      return rowColors.map((col, cIdx) => {
        if (badLetters.includes(oldGuessStr[cIdx])) {
          return "locked-red";
        }
        return col;
      });
    });
  }

  return [...newColors, currentRowColors];
};

export const getUpdatedManualColors = (
  rowIndex,
  letterIndex,
  applyToAll,
  forceReset,
  currentColors,
  guesses,
  clearAllBoard = false,
) => {
  const newColors = currentColors.map((row) => [...row]);

  if (clearAllBoard) {
    for (let r = 0; r < newColors.length; r++) {
      if (newColors[r]) {
        for (let c = 0; c < 5; c++) {
          if (newColors[r][c] !== "locked-red") {
            newColors[r][c] = "gray";
          }
        }
      }
    }
    return newColors;
  }

  const current = newColors[rowIndex]?.[letterIndex];
  if (!current || current === "locked-red") return currentColors;

  const nextColor = forceReset
    ? "gray"
    : MANUAL_COLORS[
        (MANUAL_COLORS.indexOf(current) + 1) % MANUAL_COLORS.length
      ];

  if (applyToAll && guesses) {
    const targetGuessObj = guesses[rowIndex];
    const targetGuessStr =
      typeof targetGuessObj === "string"
        ? targetGuessObj
        : targetGuessObj?.word || "";
    const targetLetter = targetGuessStr[letterIndex];

    guesses.forEach((guessObj, r) => {
      const guessStr =
        typeof guessObj === "string" ? guessObj : guessObj?.word || "";
      if (guessStr && newColors[r]) {
        for (let c = 0; c < 5; c++) {
          if (
            guessStr[c] === targetLetter &&
            newColors[r][c] !== "locked-red"
          ) {
            newColors[r][c] = nextColor;
          }
        }
      }
    });
  } else {
    newColors[rowIndex][letterIndex] = nextColor;
  }

  return newColors;
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

    const newManualColors = getUpdatedSubmitColors(
      guess,
      targetWord,
      state.manualColors,
      state.guesses,
    );

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
    clearAllBoard = false,
  ) => {
    if (state.gameState !== "playing") return;
    setState((previous) => ({
      ...previous,
      manualColors: getUpdatedManualColors(
        rowIndex,
        letterIndex,
        applyToAll,
        forceReset,
        previous.manualColors,
        previous.guesses,
        clearAllBoard,
      ),
    }));
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
