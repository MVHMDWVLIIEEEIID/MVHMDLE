// utils/economyManager.js

export const calculateWinRewards = ({
  game,
  progress,
  guessCount,
  MAX_HEARTS = 5,
}) => {
  const isRapidle = game.bossCategory === "rapidle";
  const unusedRows = isRapidle ? 0 : Math.max(0, game.maxTurns - guessCount);

  let BASE_WIN = 4000;
  let bossBase = 0;
  let bossBonus = 0;
  let shapeBonus = 0;
  let heartAdded = false;
  let heartCashBonus = 0;

  let newBoss2Count = progress.boss2Count || 0;
  let newBoss4Count = progress.boss4Count || 0;
  let newBoss500Count = progress.boss500Count || 0;
  let newHearts = progress.hearts;

  // Base Streak Bonus - Increased to make losing a streak physically hurt
  const STREAK_BONUS = isRapidle ? 0 : (progress.streak + 1) * 500;

  if (game.isBossGame || game.isMiniBossGame) {
    // 1. Calculate Base Boss Rewards & Modifiers
    if (isRapidle) {
      bossBase = guessCount * 3500; // $3,500 per word typed
      bossBonus = 0;
    } else if (game.bossCategory === "shape") {
      bossBase = 25000;
      bossBonus = 5000 * (1 + newBoss500Count);
      shapeBonus = Math.max(0, game.shapeMistakes || 0) * 5000; // Flawless bonus
      newBoss500Count += 1;
    } else if (game.bossCategory === "bomb") {
      bossBase = 12000;
      bossBonus = 2500 * (1 + newBoss2Count);
      newBoss2Count += 1;
    } else if (game.bossWordCount === 2) {
      bossBase = 12000;
      bossBonus = 2500 * (1 + newBoss2Count);
      newBoss2Count += 1;
    } else if (game.bossWordCount === 4) {
      bossBase = 25000;
      bossBonus = 5000 * (1 + newBoss4Count);
      newBoss4Count += 1;
    } else if (game.bossWordCount === 1) {
      // 500dle
      bossBase = 25000;
      bossBonus = 5000 * (1 + newBoss500Count);
      newBoss500Count += 1;
    }

    // 2. Cycle Completion Check
    if (!game.isMiniBossGame && !isRapidle) {
      const currentCycleLength = game.playedBossTypes?.length || 0;
      const totalInCycle = game.totalBossTypes || 3;
      if (currentCycleLength > 0 && currentCycleLength === totalInCycle) {
        heartAdded = progress.hearts < MAX_HEARTS;
        if (heartAdded) {
          newHearts = Math.min(MAX_HEARTS, progress.hearts + 1);
        } else {
          heartCashBonus = 75000; // Massive windfall if you manage to stay at 5 hearts
        }
      }
    }
  }

  // 3. Dynamic Speed Bonus
  let SPEED_BONUS = 0;
  if (!isRapidle) {
    if (game.isBossGame && !game.isMiniBossGame) {
      SPEED_BONUS = unusedRows * 2500;
    } else if (game.isMiniBossGame) {
      SPEED_BONUS = unusedRows * 2000;
    } else {
      SPEED_BONUS = unusedRows * 1500;
    }
  }

  const totalEarned = isRapidle ? bossBase : bossBase + bossBonus || BASE_WIN;
  let grandTotal = 0;
  let bossStreakBonus = 0;

  if (game.isBossGame || game.isMiniBossGame) {
    if (isRapidle) {
      grandTotal = totalEarned; // Strictly word count calculation only
    } else {
      const bossStreakMultiplier =
        (progress.boss2Count || 0) +
        (progress.boss4Count || 0) +
        (progress.boss500Count || 0);
      bossStreakBonus = 2500 * bossStreakMultiplier;
      grandTotal =
        totalEarned +
        bossStreakBonus +
        STREAK_BONUS +
        SPEED_BONUS +
        shapeBonus +
        heartCashBonus;
    }
  } else {
    grandTotal = totalEarned + SPEED_BONUS + STREAK_BONUS;
  }

  return {
    grandTotal,
    newHearts,
    newBoss2Count,
    newBoss4Count,
    newBoss500Count,
    breakdown: {
      base: isRapidle ? bossBase : bossBase || BASE_WIN,
      bonus: bossBonus || 0,
      speed: SPEED_BONUS,
      streak: STREAK_BONUS,
      bossStreakBonus: bossStreakBonus,
      unusedCount: unusedRows,
      shapeBonus,
      heartAdded,
      heartCashBonus,
    },
  };
};
