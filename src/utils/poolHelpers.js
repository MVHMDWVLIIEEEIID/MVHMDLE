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

export const pickValidBombPhrases = (
  easyBag,
  hardBag,
  easyCount,
  hardCount,
) => {
  let attempts = 0;
  let valid = false;
  let pickedEasy = [];
  let pickedHard = [];

  while (!valid && attempts < 100) {
    pickedEasy = easyBag.slice(0, easyCount);
    pickedHard = hardBag.slice(0, hardCount);

    // Fallback if the hard bag runs completely dry
    if (pickedHard.length < hardCount) {
      const fallback = easyBag.slice(
        easyCount,
        easyCount + (hardCount - pickedHard.length),
      );
      pickedHard.push(...fallback);
    }

    const combo = [...pickedEasy, ...pickedHard];

    // --- The Difficulty Constraints ---
    const threeLetterCount = combo.filter((p) => p.length === 3).length;
    const uCount = combo.filter((p) => p.includes("u")).length;

    // Rule: 1-2 three-letter phrases AND max 1 phrase containing 'u'
    if (threeLetterCount >= 1 && threeLetterCount <= 2 && uCount <= 1) {
      valid = true;
    } else {
      easyBag.sort(() => Math.random() - 0.5);
      hardBag.sort(() => Math.random() - 0.5);
      attempts++;
    }
  }

  // Remove the successfully picked phrases from the bags
  const newEasyBag = easyBag.filter((p) => !pickedEasy.includes(p));
  const newHardBag = hardBag.filter((p) => !pickedHard.includes(p));
  const finalPhrases = [...pickedEasy, ...pickedHard].sort(
    () => Math.random() - 0.5,
  );

  return { finalPhrases, newEasyBag, newHardBag };
};

export const getGameTypeInfo = (
  count,
  playedBosses = [],
  playedMiniBosses = [],
) => {
  // Strictly the 5-Game Cycle (1, 2 standard; 3 mini-boss; 4 hard; 5 boss)
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

  let typeInfo = getGameTypeInfo(0, [], []);

  // Ensure Rapidle handles the first game correctly if forced in DEV settings
  if (DEV_SETTINGS.FORCE_RAPIDLE) {
    typeInfo = {
      isBoss: true,
      isMiniBoss: false,
      isHardNormal: false,
      bossType: "rapidle",
      category: "rapidle",
      wordCount: 0,
      maxTurns: 999,
    };
  }

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
    if (typeInfo.category === "rapidle") {
      finalRandom = 0; // Dummy target
    } else if (typeInfo.category === "shape") {
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

      const { finalPhrases, newEasyBag, newHardBag } = pickValidBombPhrases(
        initialBombEasyBag,
        initialBombHardBag,
        easyCount,
        hardCount,
      );

      initialBombEasyBag = newEasyBag;
      initialBombHardBag = newHardBag;
      initialBombPhrases = finalPhrases;

      finalRandom = Math.floor(Math.random() * SOLUTION_WORD_COUNT); // Dummy Target
    } else if (finalBossType === "500dle") {
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
