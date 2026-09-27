// hooks/useWordPool.js
import { useCallback, useEffect, useMemo } from "react";
import data from "../data/words.json";
import shapeData from "../data/shapes.json";
import useSecureState from "./useSecureState";

export const DEV_SETTINGS = {
  FORCE_BOSS_ID: "shape-boss",
  EVERY_ROUND_IS_BOSS: true,
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

// --- GLOBAL HELPERS (Hoisted so the Bootstrapper can use them) ---

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

const getGameTypeInfo = (count, played) => {
  const isBossRound = DEV_SETTINGS.EVERY_ROUND_IS_BOSS || (count + 1) % 5 === 0;

  if (!isBossRound)
    return {
      isBoss: false,
      bossType: null,
      category: null,
      wordCount: 1,
      maxTurns: 6,
    };

  let boss;
  if (DEV_SETTINGS.FORCE_BOSS_ID && BOSS_REGISTRY[DEV_SETTINGS.FORCE_BOSS_ID]) {
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

// --- BOOTSTRAPPER: Secures the first load if LocalStorage is empty ---
let cachedInitialSetup = null;

const getInitialSetup = (forceNew = false) => {
  if (cachedInitialSetup && !forceNew) return cachedInitialSetup;

  const typeInfo = getGameTypeInfo(0, []);

  let finalBossType = typeInfo.bossType;
  let finalRandom = null;
  let finalRandomIndices = [];
  let initialBag = [];
  let initialBanned = [];

  if (typeInfo.isBoss) {
    if (typeInfo.category === "shape") {
      initialBag = [...SHAPE_KEYS].sort(() => Math.random() - 0.5);
      finalBossType = initialBag.shift();

      const validIndices = shapeData[finalBossType] || [];
      finalRandom = pickRandom(validIndices);

      if (finalRandom !== null) {
        initialBanned = [data[finalRandom]];
      }
    } else if (typeInfo.category === "multi") {
      const freshPool = Array.from(
        { length: SOLUTION_WORD_COUNT },
        (_, idx) => idx,
      );
      finalRandomIndices = pickDistinct(typeInfo.wordCount, freshPool);
    } else if (finalBossType === "wordle500") {
      const eligible500 = Array.from({ length: 500 }, (_, idx) => idx);
      finalRandom = pickRandom(eligible500);
    } else {
      finalRandom = Math.floor(Math.random() * SOLUTION_WORD_COUNT);
    }
  } else {
    finalRandom = Math.floor(Math.random() * SOLUTION_WORD_COUNT);
  }

  cachedInitialSetup = {
    isBoss: typeInfo.isBoss,
    bossType: finalBossType,
    category: typeInfo.category,
    wordCount: typeInfo.wordCount,
    maxTurns: typeInfo.maxTurns,
    random: finalRandom,
    randomIndices: finalRandomIndices,
    shapeBag: initialBag,
    shapeBannedWords: initialBanned,
  };

  return cachedInitialSetup;
};

// On-the-fly validator to generate the cheat sheet for the console log
function getCheatSheetForWord(targetWord, shapeArrays, allWords) {
  const validGuessesPerRow = [];

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
        if (!validForThisRow.includes(guess)) {
          validForThisRow.push(guess);
        }
        if (validForThisRow.length >= 3) break;
      }
    }
    validGuessesPerRow.push(validForThisRow);
  }
  return validGuessesPerRow;
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

  // ALL fallbacks now pull safely from the same synchronized bootstrapper
  const [isBossGame, setIsBossGame] = useSecureState(
    `wordle-is-boss-${mode}`,
    () => getInitialSetup().isBoss,
  );
  const [bossType, setBossType] = useSecureState(
    `wordle-boss-type-${mode}`,
    () => getInitialSetup().bossType,
  );
  const [bossCategory, setBossCategory] = useSecureState(
    `wordle-boss-category-${mode}`,
    () => getInitialSetup().category,
  );
  const [bossWordCount, setBossWordCount] = useSecureState(
    `wordle-boss-word-count-${mode}`,
    () => getInitialSetup().wordCount,
  );
  const [maxTurns, setMaxTurns] = useSecureState(
    `wordle-max-turns-${mode}`,
    () => getInitialSetup().maxTurns,
  );

  const [random, setRandom] = useSecureState(
    `wordle-solution-index-${mode}`,
    () => getInitialSetup().random,
  );
  const [randomIndices, setRandomIndices] = useSecureState(
    `wordle-solution-indices-${mode}`,
    () => getInitialSetup().randomIndices,
  );

  const [shapeBag, setShapeBag] = useSecureState(
    `wordle-shape-bag-${mode}`,
    () => getInitialSetup().shapeBag,
  );
  const [shapeBannedWords, setShapeBannedWords] = useSecureState(
    `wordle-shape-banned-${mode}`,
    () => getInitialSetup().shapeBannedWords,
  );

  // === EFFECT: Logs on refresh AND on new cycle ===
  useEffect(() => {
    if (isBossGame && bossCategory === "shape" && random !== null && bossType) {
      const chosenWord = solutionWords[random];

      // Safety check: Prevent crash if bossType happens to be an invalid/generic key
      if (!chosenWord || !SHAPES[bossType]) return;

      const shapeArrays = SHAPES[bossType].map((row) =>
        row.map((c) => (c === "G" ? 2 : c === "Y" ? 1 : 0)),
      );

      const rowProofs = getCheatSheetForWord(chosenWord, shapeArrays, data);

      console.log({
        shape: bossType,
        targetWord: chosenWord,
        cheatSheet: rowProofs.map((guesses, i) => ({
          row: i + 1,
          shapeConstraint: SHAPES[bossType][i],
          answers: guesses,
        })),
      });
    }
  }, [isBossGame, bossCategory, bossType, random, solutionWords]);

  const getEligible = useCallback(
    (pool) =>
      pool.filter((idx) => !bannedOpeningWords.includes(solutionWords[idx])),
    [bannedOpeningWords, solutionWords],
  );

  const removeSolvedTargets = useCallback(
    (indicesToRemove) => {
      if (!indicesToRemove?.length) return;
      const toRemove = new Set(indicesToRemove);
      setAvailableIndices((prev) => prev.filter((idx) => !toRemove.has(idx)));
    },
    [setAvailableIndices],
  );

  const targetWords = useMemo(() => {
    if (isBossGame && bossCategory === "multi")
      return randomIndices.map((idx) => solutionWords[idx]);
    if (random === null || random === undefined) return [];
    return [solutionWords[random]];
  }, [isBossGame, bossCategory, randomIndices, random, solutionWords]);

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
          maxTurns,
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
      let currentBag = [...shapeBag];
      if (advanceLevel) {
        if (currentBag.length === 0) {
          currentBag = [...SHAPE_KEYS].sort(() => Math.random() - 0.5);
        }
        finalBossType = currentBag.shift();
        setShapeBag(currentBag);
      } else {
        finalBossType = bossType;
      }

      const validIndices = shapeData[finalBossType] || [];
      const eligible = validIndices.filter(
        (idx) => !shapeBannedWords.includes(solutionWords[idx]),
      );

      let chosenIndex;
      if (eligible.length === 0) {
        chosenIndex = pickRandom(validIndices);
      } else {
        chosenIndex = pickRandom(eligible);
      }

      nextRandom = chosenIndex;
      const chosenWord = solutionWords[chosenIndex];
      setShapeBannedWords((prev) => [...prev, chosenWord]);
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
    // Force a fresh synchronized bootstrapper state
    const setup = getInitialSetup(true);

    setGameCount(0);
    setPlayedBossTypes([]);
    setBannedOpeningWords([]);
    setAvailableIndices(getAllSolutionIndices());

    setShapeBag(setup.shapeBag);
    setShapeBannedWords(setup.shapeBannedWords);
    setIsBossGame(setup.isBoss);
    setBossType(setup.bossType);
    setBossCategory(setup.category);
    setBossWordCount(setup.wordCount);
    setRandom(setup.random);
    setRandomIndices(setup.randomIndices);
    setMaxTurns(setup.maxTurns);
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
