// hooks/useWordPool.js
import { useCallback, useMemo } from "react";
import data from "../data/words.json";
import useSecureState from "./useSecureState";

export const DEV_SETTINGS = {
  FORCE_BOSS_ID: "shape-boss", // Forced to only spawn the Shape Boss for testing
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

  // Track the repeating shuffled shape bag
  const [shapeBag, setShapeBag] = useSecureState(
    `wordle-shape-bag-${mode}`,
    [],
  );

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

    // --- SHAPE LOOP LOGIC ---
    let finalBossType = typeInfo.bossType;
    if (typeInfo.isBoss && typeInfo.category === "shape") {
      if (advanceLevel) {
        let currentBag = [...shapeBag];
        // Create initial shuffle if the bag is empty
        if (currentBag.length === 0) {
          currentBag = [...SHAPE_KEYS].sort(() => Math.random() - 0.5);
        }
        // Pick the first shape in the shuffled array
        finalBossType = currentBag[0];
        // Move it to the back to repeat the EXACT same sequence continuously
        currentBag.push(currentBag.shift());
        setShapeBag(currentBag);
      } else {
        // Keep the exact same shape on a failed retry
        finalBossType = bossType;
      }
    }
    // ------------------------

    const eligible = getEligible(availableIndices);
    let nextRandom = random;
    let nextRandomIndices = randomIndices;

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
    setShapeBag([]); // Reset the shape sequence for a completely fresh run
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
