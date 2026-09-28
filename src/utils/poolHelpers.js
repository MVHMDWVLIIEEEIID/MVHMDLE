// utils/poolHelpers.js
import data from "../data/words.json";
import shapeData from "../data/shapes.json";
import {
  DEV_SETTINGS,
  BOSS_REGISTRY,
  BOSS_TYPES,
  MINI_BOSS_REGISTRY,
  MINI_BOSS_TYPES,
  SOLUTION_WORD_COUNT,
  HARD_SOLUTION_WORD_COUNT,
  SHAPE_KEYS,
  BOMB_PHRASES,
} from "./bossConfig";

export const pickRandom = (pool) =>
  pool?.length ? pool[Math.floor(Math.random() * pool.length)] : null;

export const pickDistinct = (count, pool = []) => {
  const picked = [];
  const primary = [...pool];
  while (picked.length < count && primary.length > 0) {
    picked.push(
      primary.splice(Math.floor(Math.random() * primary.length), 1)[0],
    );
  }
  return picked;
};

export const getGameTypeInfo = (
  count,
  playedBosses = [],
  playedMiniBosses = [],
) => {
  const cyclePos = (count + 1) % 5;
  const isBossRound = DEV_SETTINGS.EVERY_ROUND_IS_BOSS || cyclePos === 0;
  const isMiniBossRound = cyclePos === 3 && !DEV_SETTINGS.EVERY_ROUND_IS_BOSS;
  const isHardNormalRound = cyclePos === 4 && !DEV_SETTINGS.EVERY_ROUND_IS_BOSS;

  if (!isBossRound && !isMiniBossRound) {
    return {
      isBoss: false,
      isMiniBoss: false,
      isHardNormal: isHardNormalRound,
      bossType: null,
      category: null,
      wordCount: 1,
      maxTurns: 6,
    };
  }

  let boss;
  let isMini = false;

  if (DEV_SETTINGS.FORCE_BOSS_ID && BOSS_REGISTRY[DEV_SETTINGS.FORCE_BOSS_ID]) {
    boss = BOSS_REGISTRY[DEV_SETTINGS.FORCE_BOSS_ID];
  } else if (
    DEV_SETTINGS.FORCE_BOSS_ID &&
    MINI_BOSS_REGISTRY[DEV_SETTINGS.FORCE_BOSS_ID]
  ) {
    boss = MINI_BOSS_REGISTRY[DEV_SETTINGS.FORCE_BOSS_ID];
    isMini = true;
  } else if (isBossRound) {
    const validPlayed = playedBosses.filter((id) => BOSS_REGISTRY[id]);
    const available = BOSS_TYPES.filter((b) => !validPlayed.includes(b.id));
    const pool = available.length > 0 ? available : BOSS_TYPES;
    boss = pickRandom(pool);
  } else if (isMiniBossRound) {
    const validPlayed = playedMiniBosses.filter((id) => MINI_BOSS_REGISTRY[id]);
    const available = MINI_BOSS_TYPES.filter(
      (b) => !validPlayed.includes(b.id),
    );
    const pool = available.length > 0 ? available : MINI_BOSS_TYPES;
    boss = pickRandom(pool);
    isMini = true;
  }

  return {
    isBoss: true,
    isMiniBoss: isMini,
    isHardNormal: false,
    bossType: boss.id,
    category: boss.category,
    wordCount: boss.wordCount,
    maxTurns: boss.maxTurns,
  };
};

let cachedInitialSetup = null;

export const getInitialSetup = (forceNew = false) => {
  if (cachedInitialSetup && !forceNew) return cachedInitialSetup;
  const typeInfo = getGameTypeInfo(0, [], []);

  let finalBossType = typeInfo.bossType;
  let finalRandom = null;
  let finalRandomIndices = [];
  let initialBag = [];
  let initialBanned = [];

  let initialBombEasyBag = [...new Set(BOMB_PHRASES.easy || [])].sort(
    () => Math.random() - 0.5,
  );
  let initialBombHardBag = [...new Set(BOMB_PHRASES.hard || [])].sort(
    () => Math.random() - 0.5,
  );
  let initialBombPhrases = [];

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
      const hardPool = Array.from(
        { length: HARD_SOLUTION_WORD_COUNT },
        (_, idx) => idx,
      );
      const easyPool = Array.from(
        { length: SOLUTION_WORD_COUNT - HARD_SOLUTION_WORD_COUNT },
        (_, idx) => idx + HARD_SOLUTION_WORD_COUNT,
      );
      const hardPicks = pickDistinct(1, hardPool);
      const easyPicks = pickDistinct(typeInfo.wordCount - 1, easyPool);
      finalRandomIndices = [...hardPicks, ...easyPicks].sort(
        () => Math.random() - 0.5,
      );
    } else if (typeInfo.category === "bomb") {
      const easyCount = Math.max(0, typeInfo.maxTurns - 1);
      const hardCount = 1;
      const pickedEasy = initialBombEasyBag.splice(0, easyCount);
      const pickedHard = initialBombHardBag.splice(0, hardCount);
      initialBombPhrases = [...pickedEasy, ...pickedHard].sort(
        () => Math.random() - 0.5,
      );
      finalRandom = Math.floor(Math.random() * SOLUTION_WORD_COUNT); // Dummy Target
    } else if (finalBossType === "wordle500") {
      const eligible500 = Array.from({ length: 500 }, (_, idx) => idx);
      finalRandom = pickRandom(eligible500);
    } else {
      finalRandom = typeInfo.isHardNormal
        ? Math.floor(Math.random() * HARD_SOLUTION_WORD_COUNT)
        : HARD_SOLUTION_WORD_COUNT +
          Math.floor(
            Math.random() * (SOLUTION_WORD_COUNT - HARD_SOLUTION_WORD_COUNT),
          );
    }
  } else {
    finalRandom = typeInfo.isHardNormal
      ? Math.floor(Math.random() * HARD_SOLUTION_WORD_COUNT)
      : HARD_SOLUTION_WORD_COUNT +
        Math.floor(
          Math.random() * (SOLUTION_WORD_COUNT - HARD_SOLUTION_WORD_COUNT),
        );
  }

  cachedInitialSetup = {
    isBoss: typeInfo.isBoss,
    isMiniBoss: typeInfo.isMiniBoss,
    isHardNormal: typeInfo.isHardNormal,
    bossType: finalBossType,
    category: typeInfo.category,
    wordCount: typeInfo.wordCount,
    maxTurns: typeInfo.maxTurns,
    random: finalRandom,
    randomIndices: finalRandomIndices,
    shapeBag: initialBag,
    shapeBannedWords: initialBanned,
    bombEasyBag: initialBombEasyBag,
    bombHardBag: initialBombHardBag,
    bombPhrases: initialBombPhrases,
  };

  return cachedInitialSetup;
};
