// components/SurvivalGameModals.jsx
import React from "react";
import Modal from "./Modal";

export default function SurvivalGameModals({
  isOpen,
  onClose,
  onNext,
  onShare,
  onFullReset,
  stats,
}) {
  const [showModal, modalType] = isOpen;

  const renderBossWordsInline = (words = []) => words.join(", ");

  const isBomb = stats.bossCategory === "bomb";
  const isRapidle = stats.bossCategory === "rapidle";
  const typedZero = isRapidle && stats.guesses.length === 0;

  let config = { isOpen: showModal, onClose: onClose };

  if (modalType === "victory") {
    config = {
      ...config,
      title: "YOU ARE A LEGEND",
      status: "success",
      subtitle: "Survival Run Completed",
      highlight: (
        <span className="text-lg text-white/80 leading-relaxed mb-4 text-center block">
          You have accumulated enough wealth to extract successfully.
          <br />
          <span className="text-gameYellow font-black mt-2 block text-2xl">
            $1,000,000 COLLECTED
          </span>
        </span>
      ),
      highlightType: "victory",
      statCards: [
        {
          value: stats.gamesPlayed,
          label: "Games Played",
          valueColor: "text-white",
        },
        {
          value: stats.hearts,
          label: "Hearts Left",
          valueColor: "text-gameYellow",
        },
      ],
      buttons: [
        { label: "Start New Run", variant: "success", onClick: onFullReset },
        { label: "Stay Here (Endless)", variant: "ghost", onClick: onClose },
      ],
    };
  } else if (modalType === "won") {
    let wonButtons = [];

    if (!isRapidle) {
      wonButtons.push({ label: "Share", variant: "default", onClick: onShare });
    }
    wonButtons.push({
      label: "Next",
      variant: typedZero ? "warning" : "success",
      onClick: onNext,
    });

    const rapidleDropShadow = typedZero
      ? "drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]"
      : "drop-shadow-[0_0_15px_rgba(74,222,128,0.25)]";

    const textColor = typedZero ? "text-gameYellow" : "text-gameGreen";
    const borderColor = typedZero
      ? "border-gameYellow/20"
      : "border-gameGreen/20";

    config = {
      ...config,
      title: isRapidle
        ? typedZero
          ? "Time's Up!"
          : "Rapidle Complete"
        : stats.isBossGame
          ? "BOSS DEFEATED"
          : "You Won",
      status: typedZero ? "warning" : "success",
      subtitle: stats.isBossGame
        ? isRapidle
          ? "Mini Game: Rapidle"
          : stats.bossType === "500dle"
            ? "Boss: 500dle"
            : stats.bossType?.startsWith("shape-")
              ? "Boss: Shapedle"
              : isBomb
                ? "Boss: Bombedle Defused"
                : stats.bossWordCount === 4
                  ? "Boss: Fourdle"
                  : "Boss: Duodle"
        : "The word was",
      highlight: stats.isBossGame ? (
        isRapidle ? (
          <div
            className={`text-4xl font-black text-gameLight uppercase tracking-wider ${rapidleDropShadow} mb-2 text-center`}
          >
            {stats.guesses.length} WORDS TYPED
          </div>
        ) : isBomb ? (
          stats.bombPhrases.join(" - ")
        ) : (
          renderBossWordsInline(stats.targetWords)
        )
      ) : (
        stats.targetWord
      ),
      highlightType: stats.isBossGame
        ? isRapidle
          ? "custom"
          : "boss"
        : "normal",
      wordsForDef: stats.isBossGame
        ? isBomb || isRapidle
          ? []
          : stats.targetWords
        : [stats.targetWord],
      guessesData: stats.guesses,
      customBody: stats.lastReward && (
        <>
          <div className="flex gap-4 w-full">
            <div
              className={`bg-white/5 border ${borderColor} rounded-2xl w-1/3 flex flex-col items-center justify-center p-4`}
            >
              <span className={`text-5xl font-black ${textColor}`}>
                {stats.streak}
              </span>
              <span className="text-[10px] font-bold uppercase text-white/30 tracking-widest mt-2">
                Streak
              </span>
            </div>
            <div
              className={`bg-white/5 border ${borderColor} rounded-2xl flex-1 p-4`}
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3">
                <span className="text-xs font-bold text-white/40 uppercase">
                  Earnings
                </span>
                <span className={`text-2xl font-black ${textColor}`}>
                  +${stats.lastReward.total.toLocaleString()}
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-white/60">
                  <span>{isRapidle ? "Words Typed Bonus" : "Win Bonus"}</span>
                  <span>+{stats.lastReward.breakdown.base}</span>
                </div>

                {stats.isBossGame ? (
                  !isRapidle && (
                    <div className="flex justify-between text-[10px] font-mono text-white/60">
                      <span>Boss Defeat Streak</span>
                      <span>
                        +
                        {stats.bossWordCount === 2
                          ? 2000 * stats.boss2Count || 0
                          : stats.bossWordCount === 4
                            ? 4000 * stats.boss4Count || 0
                            : stats.bossWordCount === 1
                              ? 2000 * stats.boss500Count || 0
                              : 0}
                      </span>
                    </div>
                  )
                ) : (
                  <div className="flex justify-between text-[10px] font-mono text-white/60">
                    <span>
                      Guesses Not Used ({stats.lastReward.breakdown.unusedCount}
                      )
                    </span>
                    <span>+{stats.lastReward.breakdown.speed}</span>
                  </div>
                )}

                {!isRapidle && (
                  <div className="flex justify-between text-[10px] font-mono text-white/60">
                    <span>Streak Bonus</span>
                    <span>+{stats.lastReward.breakdown.streak}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {stats.isBossGame && !isRapidle && stats.isCycleComplete && (
            <div className="w-full flex justify-center mt-3">
              <p className="text-gameRed text-[11px] font-black uppercase tracking-wider">
                {stats.lastReward.breakdown.heartAdded
                  ? "+1 Heart Added For Beating Entire Bosses Cycle"
                  : "+$50,000 Hearts Full Bonus"}
              </p>
            </div>
          )}
        </>
      ),
      buttons: wonButtons,
    };
  } else if (modalType === "lost-heart") {
    config = {
      ...config,
      title: "Lost a Heart",
      status: "warning",
      subtitle: stats.isBossGame
        ? isRapidle
          ? "Mini Game Failed:"
          : "Boss Attempt Failed:"
        : "Attempt Failed:",
      highlight: stats.isBossGame ? (
        isRapidle ? (
          <div className="text-4xl font-black text-gameLight uppercase tracking-wider drop-shadow-[0_0_15px_rgba(250,204,21,0.4)] mb-2 text-center">
            {stats.guesses.length} WORDS TYPED
          </div>
        ) : isBomb ? (
          stats.bombPhrases.join(" - ")
        ) : (
          renderBossWordsInline(stats.targetWords)
        )
      ) : (
        stats.targetWord
      ),
      highlightType: stats.isBossGame
        ? isRapidle
          ? "custom"
          : "boss"
        : "normal",
      heartsData: {
        active: stats.hearts,
        broken: 1,
        empty: Math.max(0, 5 - (stats?.hearts || 0) - 1),
      },
      wordsForDef: stats.isBossGame
        ? isBomb || isRapidle
          ? []
          : stats.targetWords
        : [stats.targetWord],
      guessesData: stats.guesses,
      statCards: [
        {
          value: stats.streakBeforeLastLoss ?? stats.streak,
          label: "Streak Was",
          valueColor: "text-gameYellow",
          labelColor: "text-gameYellow/60",
          className: "bg-gameYellow/6 border border-gameYellow/35",
        },
      ],
      buttons: [
        { label: "Give Up", variant: "danger", onClick: onFullReset },
        { label: "Continue", variant: "warning", onClick: onNext },
      ],
    };
  } else if (modalType === "game-over") {
    config = {
      ...config,
      title: "Game Over",
      status: "error",
      subtitle: stats.isBossGame
        ? isRapidle
          ? "Mini Game: Rapidle"
          : `${stats.bossType === "500dle" ? "500dle" : stats.bossType?.startsWith("shape-") ? "Shapedle" : isBomb ? "Bombedle Exploded" : stats.bossWordCount === 4 ? "Fourdle" : "Duodle"} Was :`
        : "The word was",
      highlight: stats.isBossGame ? (
        isRapidle ? (
          <div className="text-4xl font-black text-gameLight uppercase tracking-wider drop-shadow-[0_0_15px_rgba(239,68,68,0.4)] mb-2 text-center">
            {stats.guesses.length} WORDS TYPED
          </div>
        ) : isBomb ? (
          stats.bombPhrases.join(" - ")
        ) : (
          renderBossWordsInline(stats.targetWords)
        )
      ) : (
        stats.targetWord
      ),
      highlightType: stats.isBossGame
        ? isRapidle
          ? "custom"
          : "boss"
        : "normal",
      wordsForDef: stats.isBossGame
        ? isBomb || isRapidle
          ? []
          : stats.targetWords
        : [stats.targetWord],
      guessesData: stats.guesses,
      statCards: [
        {
          value: stats.gamesPlayed,
          label: "Games",
          valueColor: "text-gameRed",
        },
        {
          value: `$${stats.currency.toLocaleString()}`,
          label: "Cash",
          valueColor: "text-gameYellow",
        },
      ],
      buttons: [
        { label: "Start Over", variant: "danger", onClick: onFullReset },
      ],
    };
  }

  return <Modal {...config} />;
}
