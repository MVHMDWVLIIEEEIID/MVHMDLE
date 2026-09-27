// hooks/useWordPool.js
import { useCallback, useEffect, useMemo } from "react";
import data from "../data/words.json";
import useSecureState from "./useSecureState";

export const DEV_SETTINGS = {
  FORCE_BOSS_ID: "shape-boss", // Forced to only spawn the Shape Boss
  EVERY_ROUND_IS_BOSS: true, // Forces boss rounds immediately
};

export const BOSS_REGISTRY = {
  wordle500: {
    id: "wordle500",
    category: "special",
    wordCount: 1,
    maxTurns: 8,
  },
  "two-word": { id: "two-word", category: "multi", wordCount: 2, maxTurns: 7 },
  "four-word": {
    id: "four-word",
    category: "multi",
    wordCount: 4,
    maxTurns: 10,
  },
  "shape-boss": {
    id: "shape-boss",
    category: "shape",
    wordCount: 1,
    maxTurns: 6,
  },
};

const BOSS_TYPES = Object.values(BOSS_REGISTRY);
const SOLUTION_WORD_COUNT = 2315;

export const SHAPE_KEYS = [
  "shape-t",
  "shape-u",
  "shape-x",
  "shape-square",
  "shape-diamond",
];

export const SHAPES = {
  "shape-t": [
    ["G", "G", "G", "G", "G"],
    ["x", "x", "Y", "x", "x"],
    ["x", "x", "G", "x", "x"],
    ["x", "x", "Y", "Y", "x"],
    ["x", "x", "G", "x", "x"],
    ["x", "Y", "G", "x", "x"],
  ],
  "shape-u": [
    ["G", "x", "x", "x", "G"],
    ["G", "x", "x", "x", "G"],
    ["Y", "x", "x", "x", "Y"],
    ["Y", "x", "x", "x", "Y"],
    ["G", "G", "x", "G", "G"],
    ["G", "G", "G", "G", "G"],
  ],
  "shape-x": [
    ["G", "x", "x", "x", "G"],
    ["x", "G", "x", "G", "x"],
    ["x", "x", "G", "x", "x"],
    ["x", "Y", "x", "Y", "x"],
    ["Y", "x", "x", "x", "Y"],
    ["G", "x", "x", "x", "G"],
  ],
  "shape-square": [
    ["G", "G", "G", "G", "G"],
    ["G", "x", "x", "x", "G"],
    ["Y", "x", "x", "x", "Y"],
    ["Y", "x", "x", "x", "Y"],
    ["G", "x", "x", "x", "G"],
    ["G", "G", "G", "G", "G"],
  ],
  "shape-diamond": [
    ["x", "x", "G", "x", "x"],
    ["x", "G", "x", "G", "x"],
    ["G", "x", "x", "x", "G"],
    ["Y", "x", "x", "x", "Y"],
    ["x", "Y", "x", "Y", "x"],
    ["x", "x", "G", "x", "x"],
  ],
};

// Extremely fast verification for finding valid target words checking the entire database.
// Now returns { isValid: boolean, validGuessesPerRow: string[][] }
function isWordValidForShapeFast(targetWord, shapeArrays, allWords) {
  if (!targetWord || targetWord.length !== 5) return { isValid: false };

  const validGuessesPerRow = [];

  for (let r = 0; r < shapeArrays.length; r++) {
    const expected = shapeArrays[r];

    // Skip checking database if the row requires 5 greens
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

      // Short circuit optimization
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
        if (validForThisRow.length >= 3) break;
      }
    }

    if (validForThisRow.length < 3) return { isValid: false };
    validGuessesPerRow.push(validForThisRow);
  }

  return { isValid: true, validGuessesPerRow };
}

export default function useWordPool(mode) {
  const solutionWords = useMemo(() => data.slice(0, SOLUTION_WORD_COUNT), []);

  const [gameCount, setGameCount] = useSecureState(
    `wordle-game-count-${mode}`,
    0,
  );
  const [playedBossTypes, setPlayedBossTypes] = useSecureState(
    `wordle-played-boss-types-${mode}`,
    [],
  );
  const [bannedOpeningWords, setBannedOpeningWords] = useSecureState(
    `${mode}-banned-opening-words`,
    [],
  );

  const getAllSolutionIndices = useCallback(
    () => Array.from({ length: SOLUTION_WORD_COUNT }, (_, idx) => idx),
    [],
  );
  const [availableIndices, setAvailableIndices] = useSecureState(
    `wordle-available-solution-indices-${mode}`,
    getAllSolutionIndices(),
  );

  const [isBossGame, setIsBossGame] = useSecureState(
    `wordle-is-boss-${mode}`,
    false,
  );
  const [bossType, setBossType] = useSecureState(
    `wordle-boss-type-${mode}`,
    null,
  );
  const [bossCategory, setBossCategory] = useSecureState(
    `wordle-boss-category-${mode}`,
    null,
  );
  const [bossWordCount, setBossWordCount] = useSecureState(
    `wordle-boss-word-count-${mode}`,
    1,
  );
  const [maxTurns, setMaxTurns] = useSecureState(`wordle-max-turns-${mode}`, 6);

  const [random, setRandom] = useSecureState(
    `wordle-solution-index-${mode}`,
    () => Math.floor(Math.random() * SOLUTION_WORD_COUNT),
  );
  const [randomIndices, setRandomIndices] = useSecureState(
    `wordle-solution-indices-${mode}`,
    [],
  );

  // Encrypted Cycle Storage for Shape Boss
  const [shapeCycle, setShapeCycle] = useSecureState(
    `wordle-shape-cycle-${mode}`,
    null,
  );
  const [shapeBannedWords, setShapeBannedWords] = useSecureState(
    `wordle-shape-banned-${mode}`,
    [],
  );

  // ALWAYS LOG THE ACTIVE CYCLE DATA ON MOUNT OR UPDATE
  useEffect(() => {
    if (shapeCycle && shapeCycle.debugLog) {
      console.log(
        `%c[SHAPE CYCLE PROOFS]`,
        "color: #00e196; font-weight: bold; font-size: 14px;",
      );
      console.log(shapeCycle.debugLog);
    }
  }, [shapeCycle?.debugLog]);

  const pickRandom = (pool) =>
    pool?.length ? pool[Math.floor(Math.random() * pool.length)] : null;

  const pickDistinct = (count, pool = []) => {
    const picked = [];
    const primary = [...pool];
    while (picked.length < count && primary.length > 0) {
      picked.push(
        primary.splice(Math.floor(Math.random() * primary.length), 1)[0],
      );
    }
    return picked;
  };

  const getEligible = useCallback(
    (pool) => {
      return pool.filter(
        (idx) => !bannedOpeningWords.includes(solutionWords[idx]),
      );
    },
    [bannedOpeningWords, solutionWords],
  );

  const getGameTypeInfo = (count, played) => {
    const isBossRound =
      DEV_SETTINGS.EVERY_ROUND_IS_BOSS || (count + 1) % 5 === 0;

    if (!isBossRound)
      return {
        isBoss: false,
        bossType: null,
        category: null,
        wordCount: 1,
        maxTurns: 6,
      };

    let boss;
    if (
      DEV_SETTINGS.FORCE_BOSS_ID &&
      BOSS_REGISTRY[DEV_SETTINGS.FORCE_BOSS_ID]
    ) {
      boss = BOSS_REGISTRY[DEV_SETTINGS.FORCE_BOSS_ID];
    } else {
      const validPlayed = played.filter((id) => BOSS_REGISTRY[id]);
      const available = BOSS_TYPES.filter((b) => !validPlayed.includes(b.id));
      const pool = available.length > 0 ? available : BOSS_TYPES;
      boss = pickRandom(pool);
    }

    return {
      isBoss: true,
      bossType: boss.id,
      category: boss.category,
      wordCount: boss.wordCount,
      maxTurns: boss.maxTurns,
    };
  };

  const targetWords = useMemo(() => {
    if (isBossGame && bossCategory === "multi")
      return randomIndices.map((idx) => solutionWords[idx]);
    if (random === null || random === undefined) return [];
    return [solutionWords[random]];
  }, [isBossGame, bossCategory, randomIndices, random, solutionWords]);

  const removeSolvedTargets = useCallback(
    (indicesToRemove) => {
      if (!indicesToRemove?.length) return;
      const toRemove = new Set(indicesToRemove);
      setAvailableIndices((prev) => prev.filter((idx) => !toRemove.has(idx)));
    },
    [setAvailableIndices],
  );

  const generateNextGame = (advanceLevel = true) => {
    if (availableIndices.length === 0) return false;

    const nextGameCount = advanceLevel ? gameCount + 1 : gameCount;
    const typeInfo = advanceLevel
      ? getGameTypeInfo(nextGameCount, playedBossTypes)
      : {
          isBoss: isBossGame,
          bossType,
          category: bossCategory,
          wordCount: bossWordCount,
          maxTurns: maxTurns,
        };

    let nextPlayedBossTypes = playedBossTypes;

    if (advanceLevel && typeInfo.isBoss && !DEV_SETTINGS.FORCE_BOSS_ID) {
      nextPlayedBossTypes = BOSS_TYPES.some(
        (b) => !playedBossTypes.includes(b.id),
      )
        ? [...playedBossTypes, typeInfo.bossType]
        : [typeInfo.bossType];
    }

    let finalBossType = typeInfo.bossType;
    let nextRandom = random;
    let nextRandomIndices = randomIndices;

    if (typeInfo.isBoss && typeInfo.category === "shape") {
      let currentCycle = shapeCycle;
      let currentBanned = [...shapeBannedWords];

      if (advanceLevel) {
        if (
          !currentCycle ||
          currentCycle.currentIndex >= currentCycle.shapes.length
        ) {
          const newShapes = [...SHAPE_KEYS].sort(() => Math.random() - 0.5);
          const newWords = [];

          // Debug Object for Console Storage
          const cycleDebugLog = {};

          for (const shapeKey of newShapes) {
            const shapeArrays = SHAPES[shapeKey].map((row) =>
              row.map((c) => (c === "G" ? 2 : c === "Y" ? 1 : 0)),
            );
            let foundIndex = -1;

            const shuffledIndices = [...availableIndices].sort(
              () => Math.random() - 0.5,
            );

            for (const idx of shuffledIndices) {
              const candidateWord = solutionWords[idx];
              if (currentBanned.includes(candidateWord)) continue;

              const validation = isWordValidForShapeFast(
                candidateWord,
                shapeArrays,
                data,
              );

              if (validation.isValid) {
                foundIndex = idx;
                currentBanned.push(candidateWord);

                // Add to our debug object for this shape
                cycleDebugLog[shapeKey] = {
                  targetWord: candidateWord,
                  rowProofs: validation.validGuessesPerRow.map(
                    (guesses, i) => ({
                      row: i + 1,
                      shapeConstraint: SHAPES[shapeKey][i],
                      confirmedGuesses: guesses,
                    }),
                  ),
                };

                break;
              }
            }

            if (foundIndex === -1) {
              foundIndex =
                shuffledIndices.length > 0
                  ? shuffledIndices[0]
                  : Math.floor(Math.random() * SOLUTION_WORD_COUNT);
            }
            newWords.push(foundIndex);
          }

          currentCycle = {
            shapes: newShapes,
            words: newWords,
            currentIndex: 0,
            debugLog: cycleDebugLog, // Storing in state so it persists
          };
          setShapeBannedWords(currentBanned);
        }

        finalBossType = currentCycle.shapes[currentCycle.currentIndex];
        nextRandom = currentCycle.words[currentCycle.currentIndex];

        currentCycle = {
          ...currentCycle,
          currentIndex: currentCycle.currentIndex + 1,
        };
        setShapeCycle(currentCycle);
      } else {
        if (currentCycle && currentCycle.currentIndex > 0) {
          const idx = currentCycle.currentIndex - 1;
          finalBossType = currentCycle.shapes[idx];
          nextRandom = currentCycle.words[idx];
        } else {
          finalBossType = bossType;
        }
      }
    } else {
      const eligible = getEligible(availableIndices);

      if (
        typeInfo.isBoss &&
        typeInfo.category === "multi" &&
        eligible.length >= typeInfo.wordCount
      ) {
        nextRandomIndices = pickDistinct(typeInfo.wordCount, eligible);
        nextRandom = null;
      } else if (finalBossType === "wordle500") {
        const eligible500 = getEligible(
          availableIndices.filter((idx) => idx < 500),
        );
        nextRandom = pickRandom(eligible500);
        nextRandomIndices = [];
      } else {
        nextRandom = pickRandom(eligible);
        nextRandomIndices = [];

        if (
          !advanceLevel &&
          typeInfo.isBoss &&
          typeInfo.wordCount === 1 &&
          finalBossType !== "wordle500" &&
          typeInfo.category !== "shape"
        ) {
          typeInfo.isBoss = false;
          typeInfo.category = null;
        }
      }
    }

    setGameCount(nextGameCount);
    setPlayedBossTypes(nextPlayedBossTypes);
    setIsBossGame(typeInfo.isBoss);
    setBossType(finalBossType);
    setBossCategory(typeInfo.category);
    setBossWordCount(typeInfo.wordCount);
    setRandom(nextRandom);
    setRandomIndices(nextRandomIndices);
    setMaxTurns(advanceLevel ? typeInfo.maxTurns : maxTurns);

    return true;
  };

  const resetPoolData = () => {
    const freshPool = getAllSolutionIndices();
    const typeInfo = getGameTypeInfo(0, []);
    const firstIndex = pickRandom(freshPool);
    setGameCount(0);
    setPlayedBossTypes([]);
    setBannedOpeningWords([]);
    setAvailableIndices(freshPool);
    setShapeCycle(null);
    setShapeBannedWords([]);
    setIsBossGame(typeInfo.isBoss);
    setBossType(typeInfo.bossType);
    setBossCategory(typeInfo.category);
    setBossWordCount(typeInfo.wordCount);
    setRandom(firstIndex);
    setRandomIndices([]);
    setMaxTurns(typeInfo.maxTurns);
  };

  return {
    gameCount,
    isBossGame,
    bossType,
    bossCategory,
    bossWordCount,
    maxTurns,
    setMaxTurns,
    targetWord: targetWords[0],
    targetWords,
    random,
    randomIndices,
    availableSolutionCount: availableIndices.length,
    bannedOpeningWords,
    setBannedOpeningWords,
    playedBossTypes,
    totalBossTypes: BOSS_TYPES.length,
    removeSolvedTargets,
    generateNextGame,
    resetPoolData,
  };
}
