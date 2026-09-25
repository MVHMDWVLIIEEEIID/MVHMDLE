import { useEffect } from "react";
import { secureStorage } from "../utils/secureStorage";
import useSecureState from "./useSecureState"; // [REFACTORED]

const DEFAULT_HINTS = {
  "Hide a Letter": { cost: 400, bought: 0, desc: "Discard 1 incorrect key." },
  "Vowel Letter": { cost: 700, bought: 0, desc: "Locate a hidden vowel." },
  "Yellow Letter": { cost: 1100, bought: 0, desc: "Find a misplaced key." },
  "Green Letter": { cost: 1750, bought: 0, desc: "Confirm a correct spot." },
  Row: { cost: 3200, bought: 0, desc: "Get a Seventh Row" },
  Heart: { cost: 45000, bought: 0, desc: "+1 Extra Life." },
  "Beat The Game": { cost: 1000000, bought: 0, desc: "Instant Extraction." },
};

const DEFAULT_RUN_STATS = {
  wins: 0,
  losses: 0,
  wordsGuessed: 0,
  wordsTyped: 0,
  highestStreak: 0,
  highestCash: 2500,
};

export default function useSurvivalProgress(mode) {
  const MAX_HEARTS = 5;

  const STREAK_KEY = `wordle-streak-${mode}`;
  const HEARTS_KEY = `wordle-hearts-${mode}`;
  const CURRENCY_KEY = `wordle-shop-currency`;
  const SHOP_DATA_KEY = `wordle-shop-data`;
  const HINTS_USED_KEY = `wordle-hints-used-${mode}`;
  const HINT_HISTORY_KEY = `wordle-hint-history-${mode}`;
  const LAST_REWARD_KEY = `wordle-last-reward-${mode}`;
  const GAMES_PLAYED_KEY = `wordle-games-played-${mode}`;
  const BOSS2_COUNT_KEY = `wordle-boss2-count-${mode}`;
  const BOSS4_COUNT_KEY = `wordle-boss4-count-${mode}`;
  const RUN_STATS_KEY = `wordle-run-stats-${mode}`;
  const RUN_COMPLETED_KEY = `wordle-run-completed-${mode}`;

  // [REFACTORED] All states now use useSecureState, completely eliminating the need for manual useEffects
  const [currency, setCurrency] = useSecureState(CURRENCY_KEY, 2500);

  const [hintsArray, setHintsArray] = useSecureState(SHOP_DATA_KEY, () => {
    const parsed = secureStorage.getItem(SHOP_DATA_KEY, null);
    if (parsed) {
      const merged = JSON.parse(JSON.stringify(DEFAULT_HINTS));
      Object.keys(merged).forEach((key) => {
        if (parsed[key]) merged[key].bought = parsed[key].bought;
      });
      return merged;
    }
    return JSON.parse(JSON.stringify(DEFAULT_HINTS));
  });

  const [hintsUsedInRound, setHintsUsedInRound] = useSecureState(
    HINTS_USED_KEY,
    {},
  );
  const [hintHistory, setHintHistory] = useSecureState(HINT_HISTORY_KEY, []);
  const [hearts, setHearts] = useSecureState(HEARTS_KEY, 3);
  const [streak, setStreak] = useSecureState(STREAK_KEY, 0);
  const [lastReward, setLastReward] = useSecureState(LAST_REWARD_KEY, null);
  const [boss2Count, setBoss2Count] = useSecureState(BOSS2_COUNT_KEY, 0);
  const [boss4Count, setBoss4Count] = useSecureState(BOSS4_COUNT_KEY, 0);
  const [gamesPlayed, setGamesPlayed] = useSecureState(GAMES_PLAYED_KEY, 1);
  const [runCompleted, setRunCompleted] = useSecureState(
    RUN_COMPLETED_KEY,
    false,
  );

  const [runStats, setRunStats] = useSecureState(RUN_STATS_KEY, () => {
    const saved = secureStorage.getItem(RUN_STATS_KEY, null);
    return { ...DEFAULT_RUN_STATS, ...(saved || {}) };
  });

  // Track Highest Stats
  useEffect(() => {
    setRunStats((prev) => {
      const current = { ...DEFAULT_RUN_STATS, ...(prev || {}) };
      if (streak <= current.highestStreak) return current;
      return { ...current, highestStreak: streak };
    });
  }, [streak, setRunStats]);

  useEffect(() => {
    setRunStats((prev) => {
      const current = { ...DEFAULT_RUN_STATS, ...(prev || {}) };
      if (currency <= current.highestCash) return current;
      return { ...current, highestCash: currency };
    });
  }, [currency, setRunStats]);

  const addWordsTyped = (count = 1) => {
    if (count <= 0) return;
    setRunStats((prev) => ({
      ...DEFAULT_RUN_STATS,
      ...(prev || {}),
      wordsTyped: (prev?.wordsTyped || 0) + count,
    }));
  };

  const addWin = (wordsGuessed = 1) => {
    setRunStats((prev) => ({
      ...DEFAULT_RUN_STATS,
      ...(prev || {}),
      wins: (prev?.wins || 0) + 1,
      wordsGuessed: (prev?.wordsGuessed || 0) + Math.max(1, wordsGuessed),
    }));
  };

  const addLoss = () => {
    setRunStats((prev) => ({
      ...DEFAULT_RUN_STATS,
      ...(prev || {}),
      losses: (prev?.losses || 0) + 1,
    }));
  };

  const resetRoundInfo = () => {
    setHintsUsedInRound({});
    setLastReward(null);
  };

  const resetAllProgress = () => {
    // Because of useSecureState, simply updating state wipes/resets localStorage dynamically
    setStreak(0);
    setHearts(3);
    setCurrency(2500);
    setGamesPlayed(1);
    setHintsArray(JSON.parse(JSON.stringify(DEFAULT_HINTS)));
    setHintHistory([]);
    setHintsUsedInRound({});
    setLastReward(null);
    setBoss2Count(0);
    setBoss4Count(0);
    setRunStats(DEFAULT_RUN_STATS);
    setRunCompleted(false);
  };

  return {
    currency,
    setCurrency,
    hintsArray,
    setHintsArray,
    hintsUsedInRound,
    setHintsUsedInRound,
    hintHistory,
    setHintHistory,
    hearts,
    setHearts,
    streak,
    setStreak,
    lastReward,
    setLastReward,
    gamesPlayed,
    setGamesPlayed,
    boss2Count,
    setBoss2Count,
    boss4Count,
    setBoss4Count,
    runStats,
    addWordsTyped,
    addWin,
    addLoss,
    runCompleted,
    setRunCompleted,
    resetRoundInfo,
    resetAllProgress,
  };
}
