// components/PracticeGameModals.jsx
import React from "react";
import Modal from "./Modal";

export default function PracticeGameModals({
  isOpen,
  onClose,
  onNext,
  onQuit,
  stats,
}) {
  const [showModal, modalType] = isOpen;
  const isWon = modalType === "won";
  const isBomb = stats.bossCategory === "bomb";

  const renderBossWordsInline = (words = []) => words.join(" , ");

  const config = {
    isOpen: showModal,
    onClose: onClose,
    title: isWon ? "Training Complete" : "Training Failed",
    status: isWon ? "success" : "error",
    subtitle: isBomb ? "Bomb Target" : "The word was",
    highlight: isBomb
      ? stats.bombPhrases.join(" - ")
      : renderBossWordsInline(stats.targetWords),
    highlightType: stats.targetWords?.length > 1 ? "boss" : "normal",
    wordsForDef: isBomb ? [] : stats.targetWords,
    guessesData: stats.guesses,
    statCards: [
      {
        value: stats.streak,
        label: isWon ? "Current Streak" : "Streak Lost",
        valueColor: isWon ? "text-gameGreen" : "text-gameRed",
        className: `bg-white/5 border ${isWon ? "border-gameGreen/20" : "border-gameRed/20"}`,
      },
    ],
    buttons: [
      { label: "Back to Menu", variant: "ghost", onClick: onQuit },
      { label: "Practice Again", variant: "success", onClick: onNext },
    ],
  };

  return <Modal {...config} />;
}
