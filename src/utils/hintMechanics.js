// utils/hintMechanics.js

export const executeHintMechanic = (
  name,
  game,
  progress,
  addToast,
  launchBeatGameConfetti,
  MAX_HEARTS = 5,
) => {
  let success = false;
  let logMsg = "";

  if (name === "Heart") {
    if (progress.hearts >= MAX_HEARTS) {
      addToast("Hearts are already full!", "info");
      return { success: false };
    }
    progress.setHearts((h) => Math.min(MAX_HEARTS, h + 1));
    success = true;
    addToast("Extra Life Purchased 💖", "success");
    return { success, logMsg };
  }

  if (name === "Row") {
    game.addExtraRow();
    success = true;
    logMsg = "Added Extra Row!";
    addToast("Row Added!", "success");
    return { success, logMsg };
  }

  if (name === "Beat The Game") {
    success = true;
    logMsg = "GAME BEATEN!";
    launchBeatGameConfetti();
    return { success, logMsg };
  }

  // --- Logic For Letter Reveal Hints ---
  const solutionArr = game.targetWord.toLowerCase().split("");

  if (name === "Green Letter") {
    let unknownIndices = [];
    solutionArr.forEach((_, i) => {
      let known = false;
      game.guesses.forEach((g) => {
        if (g[i] === solutionArr[i]) known = true;
      });
      if (!known) unknownIndices.push(i);
    });

    if (unknownIndices.length > 0) {
      const revealIdx =
        unknownIndices[Math.floor(Math.random() * unknownIndices.length)];
      const char = solutionArr[revealIdx];
      logMsg = `Position ${revealIdx + 1} is '${char.toUpperCase()}'`;
      game.changeColor("bg-gameGreen", char);
      success = true;
      addToast(`Revealed: ${char.toUpperCase()}`, "success");
    } else {
      addToast("All letters known!", "info");
    }
  } else if (name === "Yellow Letter") {
    const candidates = solutionArr.filter(
      (c) =>
        !game.letters[c].color.includes("bg-gameGreen") &&
        !game.letters[c].color.includes("bg-gameYellow"),
    );

    if (candidates.length > 0) {
      const char = candidates[Math.floor(Math.random() * candidates.length)];
      logMsg = `Word contains '${char.toUpperCase()}'`;
      game.changeColor("bg-gameYellow", char);
      success = true;
      addToast(`Word has: ${char.toUpperCase()}`, "success");
    } else {
      addToast("No hidden yellow letters!", "info");
    }
  } else if (name === "Hide a Letter") {
    const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    const candidates = alphabet.filter(
      (c) =>
        !solutionArr.includes(c) &&
        !game.letters[c].color.includes("bg-gameGrey"),
    );

    if (candidates.length > 0) {
      const char = candidates[Math.floor(Math.random() * candidates.length)];
      game.changeColor("bg-gameGrey", char);
      logMsg = `Removed: ${char.toUpperCase()}`;
      success = true;
      addToast(`Removed ${char.toUpperCase()}`, "success");
    } else {
      addToast("No more to hide!", "info");
    }
  } else if (name === "Vowel Letter") {
    const vowels = ["a", "e", "i", "o", "u"];
    const present = vowels.filter((v) => game.targetWord.includes(v));
    logMsg =
      present.length > 0
        ? `Contains: ${present[0].toUpperCase()}`
        : "No vowels in word!";
    addToast(
      present.length > 0
        ? `Vowel: ${present[0].toUpperCase()}`
        : "No vowels found!",
      "info",
    );
    success = true;
  }

  return { success, logMsg };
};
