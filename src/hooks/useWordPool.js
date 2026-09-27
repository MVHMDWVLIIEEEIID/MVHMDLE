// hooks/useWordPool.js
import { useCallback, useEffect, useMemo } from "react";
import data from "../data/words.json";
import shapeData from "../data/shapes.json";
import useSecureState from "./useSecureState";
import {
  BOSS_TYPES,
  SOLUTION_WORD_COUNT,
  SHAPE_KEYS,
  SHAPES,
  DEV_SETTINGS,
} from "../utils/bossConfig";
import { getCheatSheetForWord } from "../utils/shapeValidator";
import {
  pickRandom,
  pickDistinct,
  getGameTypeInfo,
  getInitialSetup,
} from "../utils/poolHelpers";

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

  useEffect(() => {
    if (isBossGame && bossCategory === "shape" && random !== null && bossType) {
      const chosenWord = solutionWords[random];

      if (!chosenWord || !SHAPES[bossType]) return;

      const shapeArrays = SHAPES[bossType].map((row) =>
        row.map((c) => (c === "G" ? 2 : c === "Y" ? 1 : 0)),
      );

      const rowProofs = getCheatSheetForWord(chosenWord, shapeArrays, data);

      console.log(
        `%c[SHAPE BOSS ACTIVE] Shape: ${bossType} | Target: ${chosenWord}`,
        "color: #00e196; font-weight: bold; font-size: 14px;",
      );
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
