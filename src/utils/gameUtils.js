// utils/gameUtils.js

/**
 * Compares a guess with a solution and returns an array of color status classes.
 * @param {string} guessStr - The player's guess.
 * @param {string} solutionStr - The actual target word.
 * @returns {string[]} Array of Tailwind color classes (e.g. "bg-gameGreen").
 */
export const getGuessStatuses = (guessStr, solutionStr) => {
  if (!solutionStr) return Array(5).fill("bg-gameGrey");

  const splitSolution = solutionStr.toLowerCase().split("");
  const splitGuess = guessStr.toLowerCase().split("");
  const statuses = Array(5).fill("bg-gameGrey");

  // 1. Green Pass (Correct letter in correct spot)
  splitGuess.forEach((char, i) => {
    if (char === splitSolution[i]) {
      statuses[i] = "bg-gameGreen";
      splitSolution[i] = null; // Consume the letter
    }
  });

  // 2. Yellow Pass (Correct letter in wrong spot)
  splitGuess.forEach((char, i) => {
    if (statuses[i] !== "bg-gameGreen") {
      const idx = splitSolution.indexOf(char);
      if (idx !== -1) {
        statuses[i] = "bg-gameYellow";
        splitSolution[idx] = null; // Consume the letter
      }
    }
  });

  return statuses;
};
