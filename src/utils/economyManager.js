// utils/economyManager.js
export const calculateWinRewards = ({
  game,
  progress,
  guessCount,
  MAX_HEARTS = 5,
}) => {
  const unusedRows = game.maxTurns - guessCount;
  let BASE_WIN = 3000;
  let bossBase = 0;
  let bossBonus = 0;
  let heartAdded = false;
  let heartCashBonus = 0;
  let newBoss2Count = progress.boss2Count || 0;
  let newBoss4Count = progress.boss4Count || 0;
  let newBoss500Count = progress.boss500Count || 0;
  let newHearts = progress.hearts;

  if (game.isBossGame) {
    // 1. Calculate Base Boss Rewards
    if (game.bossWordCount === 2) {
      bossBase = 18000;
      bossBonus = 3000 * (1 + newBoss2Count);
      newBoss2Count += 1;
    } else if (game.bossWordCount === 4) {
      bossBase = 20000;
      bossBonus = 5000 * (1 + newBoss4Count);
      newBoss4Count += 1;
    } else if (game.bossWordCount === 1) {
      bossBase = 15000;
      bossBonus = 3000 * (1 + newBoss500Count);
      newBoss500Count += 1;
    }

    // 2. Cycle Completion Check (Bulletproof)
    if (!game.isMiniBossGame) {
      const currentCycleLength = game.playedBossTypes?.length || 0;
      const totalInCycle = game.totalBossTypes || 3;
      if (currentCycleLength > 0 && currentCycleLength === totalInCycle) {
        heartAdded = progress.hearts < MAX_HEARTS;
        if (heartAdded) {
          newHearts = Math.min(MAX_HEARTS, progress.hearts + 1);
        } else {
          heartCashBonus = 50000;
        }
      }
    }
  }

  const SPEED_BONUS = unusedRows * 1200;
  const STREAK_BONUS = (progress.streak + 1) * 250;
  const totalEarned = bossBase + bossBonus || BASE_WIN;

  let grandTotal = 0;
  if (game.isBossGame) {
    const prevBoss2 = game.bossWordCount === 2 ? progress.boss2Count || 0 : 0;
    const prevBoss4 = game.bossWordCount === 4 ? progress.boss4Count || 0 : 0;
    const prevBoss500 =
      game.bossWordCount === 1 ? progress.boss500Count || 0 : 0;
    const prevStreakBonus = 2000 * (prevBoss2 + prevBoss4 + prevBoss500);

    grandTotal = totalEarned + prevStreakBonus + STREAK_BONUS + heartCashBonus;
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
      base: bossBase || BASE_WIN,
      bonus: bossBonus || 0,
      speed: SPEED_BONUS,
      streak: STREAK_BONUS,
      unusedCount: unusedRows,
      heartAdded,
      heartCashBonus,
    },
  };
};
