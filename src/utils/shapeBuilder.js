// utils/shapeBuilder.js
import { SHAPES, SHAPE_KEYS } from "./bossConfig";
import data from "../data/words.json";

function isWordValidForShapeFast(targetWord, shapeArrays, allWords) {
  if (!targetWord || targetWord.length !== 5) return { isValid: false };

  const validGuessesPerRow = [];
  const globallyUsedGuesses = new Set();

  globallyUsedGuesses.add(targetWord);

  for (let r = 0; r < shapeArrays.length; r++) {
    const expected = shapeArrays[r];

    const isAllGreens =
      expected[0] === 2 &&
      expected[1] === 2 &&
      expected[2] === 2 &&
      expected[3] === 2 &&
      expected[4] === 2;

    if (isAllGreens) {
      validGuessesPerRow.push([targetWord]);
      continue;
    }

    const validForThisRow = [];

    for (let i = 0; i < allWords.length; i++) {
      const guess = allWords[i];
      if (!guess || guess.length !== 5) continue;

      if (globallyUsedGuesses.has(guess)) continue;

      let statuses = [0, 0, 0, 0, 0];
      let t0 = targetWord[0],
        t1 = targetWord[1],
        t2 = targetWord[2],
        t3 = targetWord[3],
        t4 = targetWord[4];
      let g0 = guess[0],
        g1 = guess[1],
        g2 = guess[2],
        g3 = guess[3],
        g4 = guess[4];

      if (g0 === t0) {
        statuses[0] = 2;
        t0 = null;
      }
      if (g1 === t1) {
        statuses[1] = 2;
        t1 = null;
      }
      if (g2 === t2) {
        statuses[2] = 2;
        t2 = null;
      }
      if (g3 === t3) {
        statuses[3] = 2;
        t3 = null;
      }
      if (g4 === t4) {
        statuses[4] = 2;
        t4 = null;
      }

      if (expected[0] === 2 && statuses[0] !== 2) continue;
      if (expected[1] === 2 && statuses[1] !== 2) continue;
      if (expected[2] === 2 && statuses[2] !== 2) continue;
      if (expected[3] === 2 && statuses[3] !== 2) continue;
      if (expected[4] === 2 && statuses[4] !== 2) continue;

      if (statuses[0] !== 2) {
        if (g0 === t1) {
          statuses[0] = 1;
          t1 = null;
        } else if (g0 === t2) {
          statuses[0] = 1;
          t2 = null;
        } else if (g0 === t3) {
          statuses[0] = 1;
          t3 = null;
        } else if (g0 === t4) {
          statuses[0] = 1;
          t4 = null;
        }
      }
      if (statuses[1] !== 2) {
        if (g1 === t0) {
          statuses[1] = 1;
          t0 = null;
        } else if (g1 === t2) {
          statuses[1] = 1;
          t2 = null;
        } else if (g1 === t3) {
          statuses[1] = 1;
          t3 = null;
        } else if (g1 === t4) {
          statuses[1] = 1;
          t4 = null;
        }
      }
      if (statuses[2] !== 2) {
        if (g2 === t0) {
          statuses[2] = 1;
          t0 = null;
        } else if (g2 === t1) {
          statuses[2] = 1;
          t1 = null;
        } else if (g2 === t3) {
          statuses[2] = 1;
          t3 = null;
        } else if (g2 === t4) {
          statuses[2] = 1;
          t4 = null;
        }
      }
      if (statuses[3] !== 2) {
        if (g3 === t0) {
          statuses[3] = 1;
          t0 = null;
        } else if (g3 === t1) {
          statuses[3] = 1;
          t1 = null;
        } else if (g3 === t2) {
          statuses[3] = 1;
          t2 = null;
        } else if (g3 === t4) {
          statuses[3] = 1;
          t4 = null;
        }
      }
      if (statuses[4] !== 2) {
        if (g4 === t0) {
          statuses[4] = 1;
          t0 = null;
        } else if (g4 === t1) {
          statuses[4] = 1;
          t1 = null;
        } else if (g4 === t2) {
          statuses[4] = 1;
          t2 = null;
        } else if (g4 === t3) {
          statuses[4] = 1;
          t3 = null;
        }
      }

      if (
        statuses[0] === expected[0] &&
        statuses[1] === expected[1] &&
        statuses[2] === expected[2] &&
        statuses[3] === expected[3] &&
        statuses[4] === expected[4]
      ) {
        validForThisRow.push(guess);
        globallyUsedGuesses.add(guess);
        if (validForThisRow.length >= 3) break;
      }
    }

    if (validForThisRow.length < 3) return { isValid: false };
    validGuessesPerRow.push(validForThisRow);
  }

  return { isValid: true, validGuessesPerRow };
}

export const generateAndLogShapeData = () => {
  console.log(
    "%c[SHAPE DICTIONARY] Building mapping... (This may take a moment)",
    "color: #ffd500; font-weight: bold;",
  );

  const solutionWords = data.slice(0, 2315);
  const dict = {};

  for (const shapeKey of SHAPE_KEYS) {
    dict[shapeKey] = [];
    const shapeArrays = SHAPES[shapeKey].map((row) =>
      row.map((c) => (c === "G" ? 2 : c === "Y" ? 1 : 0)),
    );

    for (let i = 0; i < solutionWords.length; i++) {
      const candidate = solutionWords[i];
      const validation = isWordValidForShapeFast(candidate, shapeArrays, data);
      if (validation.isValid) {
        dict[shapeKey].push(i);
      }
    }
  }

  console.log(
    "%c[SHAPE DICTIONARY] Build complete! Right-click the object below and select 'Copy object':",
    "color: #00e196; font-weight: bold;",
  );
  console.log(dict);
};

export const generateAndLogUniqueWords = () => {
  console.log(
    "%c[WORDS DICTIONARY] Formatting words and removing duplicates... (This may take a moment)",
    "color: #ffd500; font-weight: bold;",
  );

  const uniqueWords = [];
  const seen = new Set();
  let removedCount = 0;

  for (let i = 0; i < data.length; i++) {
    const word = data[i];
    // If the word hasn't been seen yet, add it to our clean array.
    if (!seen.has(word)) {
      seen.add(word);
      uniqueWords.push(word);
    } else {
      removedCount++;
    }
  }

  console.log(
    `%c[WORDS DICTIONARY] Format complete! Removed ${removedCount} duplicates. Right-click the array below and select 'Copy object':`,
    "color: #00e196; font-weight: bold;",
  );
  console.log(uniqueWords);
};
