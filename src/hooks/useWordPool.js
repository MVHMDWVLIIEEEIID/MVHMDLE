import { useCallback, useMemo } from "react";
import data from "../data/words.json";
import useSecureState from "./useSecureState";

export const DEV_SETTINGS = {
  FORCE_BOSS_ID: null,
  EVERY_ROUND_IS_BOSS: false,
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
};

const BOSS_TYPES = Object.values(BOSS_REGISTRY);
const SOLUTION_WORD_COUNT = 2315;

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
  ); // [NEW] التصنيف الجديد
  const [bossWordCount, setBossWordCount] = useSecureState(
    `wordle-boss-word-count-${mode}`,
    1,
  );
  const [maxTurns, setMaxTurns] = useSecureState(`wordle-max-turns-${mode}`, 6);

  const [random, setRandom] = useSecureState(
    `wordle-solution-index-${mode}`,
    null,
  );
  const [randomIndices, setRandomIndices] = useSecureState(
    `wordle-solution-indices-${mode}`,
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
    // 1. التحقق من إعدادات المطور أولاً
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
    // 2. إذا كنت تجبر اللعبة على بوس معين للتجربة
    if (
      DEV_SETTINGS.FORCE_BOSS_ID &&
      BOSS_REGISTRY[DEV_SETTINGS.FORCE_BOSS_ID]
    ) {
      boss = BOSS_REGISTRY[DEV_SETTINGS.FORCE_BOSS_ID];
    } else {
      // 3. اللعب الطبيعي العشوائي
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
    } else if (typeInfo.bossType === "wordle500") {
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
        typeInfo.bossType !== "wordle500"
      ) {
        typeInfo.isBoss = false;
        typeInfo.category = null;
      }
    }

    setGameCount(nextGameCount);
    setPlayedBossTypes(nextPlayedBossTypes);
    setIsBossGame(typeInfo.isBoss);
    setBossType(typeInfo.bossType);
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
    removeSolvedTargets,
    generateNextGame,
    resetPoolData,
  };
}
