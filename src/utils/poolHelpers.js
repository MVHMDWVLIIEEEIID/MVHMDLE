// utils/poolHelpers.js
import data from "../data/words.json";
import shapeData from "../data/shapes.json";
import {
  DEV_SETTINGS,
  BOSS_REGISTRY,
  BOSS_TYPES,
  SOLUTION_WORD_COUNT,
  SHAPE_KEYS,
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

export const getGameTypeInfo = (count, played) => {
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

let cachedInitialSetup = null;

export const getInitialSetup = (forceNew = false) => {
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
