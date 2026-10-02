// components/SurvivalVictoryStats.jsx
import React from "react";
import { motion } from "motion/react";

export default function SurvivalVictoryStats({
  stats,
  onNewRun,
  onBackToMenu,
}) {
  const totalGames = (stats?.wins || 0) + (stats?.losses || 0);
  const winRate =
    totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;

  const accuracy =
    stats?.wordsTyped > 0
      ? Math.round((stats.wordsGuessed / stats.wordsTyped) * 100)
      : 0;
  const uniqueWords = Object.keys(stats?.wordFrequencies || {}).length;

  const freqs = stats?.wordFrequencies || {};
  const mostUsedWord =
    Object.keys(freqs).length > 0
      ? Object.keys(freqs)
          .reduce((a, b) => (freqs[a] > freqs[b] ? a : b))
          .toUpperCase()
      : "N/A";

  const hardestWordStr =
    stats?.hardestWord?.word && stats?.hardestWord?.word !== "N/A"
      ? stats.hardestWord.word.toUpperCase()
      : "N/A";

  const getRank = () => {
    if (winRate >= 85 && stats?.highestStreak >= 10)
      return { letter: "S+", color: "text-gameYellow", title: "Wordle God" };
    if (winRate >= 75)
      return { letter: "S", color: "text-gameGreen", title: "Mastermind" };
    if (winRate >= 60)
      return { letter: "A", color: "text-gameBlue", title: "Elite Survivor" };
    if (winRate >= 40)
      return { letter: "B", color: "text-white", title: "Veteran" };
    return { letter: "C", color: "text-gameRed", title: "Survivor" };
  };

  const rank = getRank();

  const getWinRateColor = (val) => {
    if (val >= 85) return "text-gameYellow";
    if (val >= 75) return "text-gameGreen";
    if (val >= 60) return "text-gameBlue";
    if (val >= 40) return "text-white";
    return "text-gameRed";
  };

  const getAccuracyColor = (val) => {
    if (val >= 40) return "text-gameYellow";
    if (val >= 25) return "text-gameGreen";
    return "text-gameRed";
  };

  const getStreakColor = (val) => {
    if (val >= 15) return "text-gameYellow";
    if (val >= 12) return "text-gameGreen";
    if (val >= 8) return "text-gameBlue";
    if (val >= 5) return "text-white";
    return "text-gameRed";
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.15 },
    },
  };

  const itemVars = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="h-screen w-full bg-gameDark text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-5xl flex flex-col gap-5 md:gap-6 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex justify-between items-end px-2 mb-1"
        >
          <div>
            <h1
              className={`text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none drop-shadow-md ${rank.color}`}
            >
              Run Complete
            </h1>
            <p className="text-white/50 font-mono uppercase tracking-[0.2em] text-[9px] md:text-xs mt-2 md:mt-3">
              Extraction Successful • $1,000,000 Secured
            </p>
          </div>
          <div className="flex flex-col items-end text-right">
            <span
              className={`text-5xl md:text-7xl font-black ${rank.color} leading-none drop-shadow-md`}
            >
              {rank.letter}
            </span>
            <span
              className={`text-[9px] md:text-[11px] font-black uppercase tracking-widest ${rank.color} mt-1 md:mt-2`}
            >
              {rank.title}
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 w-full"
        >
          <StatCard
            label="Win Rate"
            value={`${winRate}%`}
            color={getWinRateColor(winRate)}
            variants={itemVars}
          />
          <StatCard
            label="Accuracy"
            value={`${accuracy}%`}
            color={getAccuracyColor(accuracy)}
            variants={itemVars}
          />
          <StatCard
            label="High Streak"
            value={stats?.highestStreak || 0}
            color={getStreakColor(stats?.highestStreak || 0)}
            variants={itemVars}
          />
          <motion.div
            variants={itemVars}
            className="rounded-xl border border-gameGreen/30 bg-gameGreen/5 p-3 flex flex-col items-center justify-center min-h-[80px] md:min-h-[95px]"
          >
            <p className="text-2xl md:text-4xl font-black text-gameGreen leading-none drop-shadow-sm">
              ${(stats?.highestCash || 0).toLocaleString()}
            </p>
            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.15em] text-gameGreen/60 mt-2 text-center leading-tight">
              Peak Wealth
            </p>
          </motion.div>

          <StatCard
            label="Total Games"
            value={totalGames}
            variants={itemVars}
          />
          <StatCard
            label="Total Guesses"
            value={stats?.totalGuesses || 0}
            variants={itemVars}
          />
          <StatCard
            label="Unique Words"
            value={uniqueWords}
            variants={itemVars}
          />
          <StatCard
            label="Most Used"
            value={mostUsedWord}
            isText
            variants={itemVars}
          />

          <StatCard
            label="Bosses Beaten"
            value={stats?.bossesBeaten || 0}
            variants={itemVars}
          />
          <StatCard
            label="Minis Beaten"
            value={stats?.miniBossesBeaten || 0}
            variants={itemVars}
          />
          <StatCard
            label="Best Rapidle"
            value={stats?.mostRapidleWords || 0}
            variants={itemVars}
          />
          <StatCard
            label="Fastest Bomb"
            value={
              !stats?.fastestBombedle || stats?.fastestBombedle === 9999
                ? "N/A"
                : `${stats.fastestBombedle}s`
            }
            variants={itemVars}
          />

          <StatCard
            label="Hardest Word"
            value={hardestWordStr}
            isText
            variants={itemVars}
          />
          <StatCard
            label="Longest Shape"
            value={
              !stats?.longestShapedle || stats?.longestShapedle === 0
                ? "N/A"
                : `${stats.longestShapedle}s`
            }
            variants={itemVars}
          />
          <StatCard
            label="Banned Words"
            value={stats?.bannedWordsCount || 0}
            variants={itemVars}
          />
          <StatCard
            label="Hints Bought"
            value={stats?.hintsPurchased || 0}
            variants={itemVars}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
          className="flex gap-3 md:gap-4 mt-2"
        >
          <button
            onClick={onNewRun}
            className={`flex-2 ${rank.color.replace("text-", "bg-")} text-gameDark font-black py-3.5 md:py-4 rounded-xl uppercase tracking-widest text-xs md:text-sm active:scale-95 transition-all hover:opacity-90`}
          >
            Start New Run
          </button>
          <button
            onClick={onBackToMenu}
            className="flex-1 bg-[#050505] text-white/50 font-black py-3.5 md:py-4 rounded-xl uppercase tracking-widest text-xs md:text-sm border-2 border-white/10 hover:text-white active:scale-95 transition-colors"
          >
            Menu
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "text-white",
  isText = false,
  variants,
}) {
  return (
    <motion.div
      variants={variants}
      className="rounded-xl border border-white/10 bg-[#050505] p-3 flex flex-col items-center justify-center min-h-[80px] md:min-h-[95px]"
    >
      <p
        className={`${isText ? "text-base md:text-xl tracking-widest" : "text-2xl md:text-4xl"} font-black ${color} leading-none drop-shadow-sm`}
      >
        {value}
      </p>
      <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mt-1.5 md:mt-2 text-center leading-tight">
        {label}
      </p>
    </motion.div>
  );
}
