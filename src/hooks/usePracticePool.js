// hooks/usePracticePool.js
import { useCallback, useEffect } from "react";
import data from "../data/words.json";
import shapeData from "../data/shapes.json";
import {
  BOSS_REGISTRY,
  MINI_BOSS_REGISTRY,
  SOLUTION_WORD_COUNT,
  HARD_SOLUTION_WORD_COUNT,
  SHAPE_KEYS,
  BOMB_PHRASES,
} from "../utils/bossConfig";
import {
  pickRandom,
  pickDistinct,
  pickValidBombPhrases,
} from "../utils/poolHelpers";
import useSecureState from "./useSecureState";

export default function usePracticePool(bossId, subId) {
  const bossInfo = BOSS_REGISTRY[bossId] || MINI_BOSS_REGISTRY[bossId];
  const STATE_KEY = `practice-pool-${bossId}-${subId || "rand"}`;

  const [targetWord, setTargetWord] = useSecureState(
    `${STATE_KEY}-targetWord`,
    null,
  );
  const [targetWords, setTargetWords] = useSecureState(
    `${STATE_KEY}-targetWords`,
    [],
  );
  const [bombPhrases, setBombPhrases] = useSecureState(
    `${STATE_KEY}-bombPhrases`,
    [],
  );
  const [finalBossType, setFinalBossType] = useSecureState(
    `${STATE_KEY}-bossType`,
    bossId,
  );
  const [randomIndices, setRandomIndices] = useSecureState(
    `${STATE_KEY}-randomIndices`,
    [],
  );

  const generateNextGame = useCallback(() => {
    if (!bossInfo) return;

    let nextTargetWord = null;
    let nextTargetWords = [];
    let nextBombPhrases = [];
    let nextBossType = bossId;
    let nextRandomIndices = [];

    if (bossInfo.category === "shape") {
      nextBossType =
        subId && subId !== "random" ? subId : pickRandom(SHAPE_KEYS);
      const validIndices = shapeData[nextBossType] || [];
      const chosenIndex = pickRandom(validIndices);
      nextTargetWord = data[chosenIndex];
    } else if (bossInfo.category === "multi") {
      const hardPool = Array.from(
        { length: HARD_SOLUTION_WORD_COUNT },
        (_, i) => i,
      );
      const easyPool = Array.from(
        { length: SOLUTION_WORD_COUNT - HARD_SOLUTION_WORD_COUNT },
        (_, i) => i + HARD_SOLUTION_WORD_COUNT,
      );

      const hardPicks = pickDistinct(1, hardPool);
      const easyPicks = pickDistinct(bossInfo.wordCount - 1, easyPool);
      nextRandomIndices = [...hardPicks, ...easyPicks].sort(
        () => Math.random() - 0.5,
      );
      nextTargetWords = nextRandomIndices.map((idx) => data[idx]);
    } else if (bossInfo.category === "bomb") {
      const easyCount = Math.max(0, bossInfo.maxTurns - 1);
      const hardCount = 1;

      const easyPool = [...new Set(BOMB_PHRASES.easy || [])].sort(
        () => Math.random() - 0.5,
      );
      const hardPool = [...new Set(BOMB_PHRASES.hard || [])].sort(
        () => Math.random() - 0.5,
      );

      const { finalPhrases } = pickValidBombPhrases(
        easyPool,
        hardPool,
        easyCount,
        hardCount,
      );

      nextBombPhrases = finalPhrases;
      nextTargetWord = data[0]; // dummy
    } else if (bossId === "500dle") {
      const eligible500 = Array.from({ length: 500 }, (_, i) => i);
      nextTargetWord = data[pickRandom(eligible500)];
    } else {
      const easyPool = Array.from(
        { length: SOLUTION_WORD_COUNT - HARD_SOLUTION_WORD_COUNT },
        (_, i) => i + HARD_SOLUTION_WORD_COUNT,
      );
      nextTargetWord = data[pickRandom(easyPool)];
    }

    setTargetWord(nextTargetWord);
    setTargetWords(nextTargetWords);
    setBombPhrases(nextBombPhrases);
    setFinalBossType(nextBossType);
    setRandomIndices(nextRandomIndices);
  }, [
    bossId,
    subId,
    bossInfo,
    setTargetWord,
    setTargetWords,
    setBombPhrases,
    setFinalBossType,
    setRandomIndices,
  ]);

  useEffect(() => {
    if (!bossInfo) return;

    const needsGeneration =
      (bossInfo.category === "multi" &&
        (!targetWords || targetWords.length === 0)) ||
      (bossInfo.category === "bomb" &&
        (!bombPhrases || bombPhrases.length === 0)) ||
      (bossInfo.category !== "multi" &&
        bossInfo.category !== "bomb" &&
        !targetWord);

    if (needsGeneration) {
      generateNextGame();
    }
  }, [bossInfo, targetWord, targetWords, bombPhrases, generateNextGame]);

  return {
    targetWord,
    targetWords,
    bombPhrases,
    bossType: finalBossType,
    randomIndices,
    isBossGame: true,
    isMiniBossGame: MINI_BOSS_REGISTRY[bossId] !== undefined,
    bossCategory: bossInfo?.category,
    bossWordCount: bossInfo?.wordCount || 1,
    maxTurns: bossInfo?.maxTurns || 6,
    generateNextGame,
  };
}
