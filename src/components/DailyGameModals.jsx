import React, { useState, useEffect } from "react";
import Modal from "./Modal";

// --- DaisyUI Countdown Component ---
function ModalCountdown({ status }) {
  const getNextMidnight = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  };

  const [targetDate, setTargetDate] = useState(getNextMidnight());
  const [timeLeft, setTimeLeft] = useState(targetDate - window.Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = targetDate - now;
      if (remaining <= 0) {
        const nextTarget = getNextMidnight();
        setTargetDate(nextTarget);
        setTimeLeft(nextTarget - now);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const h = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const m = Math.floor((timeLeft / (1000 * 60)) % 60);
  const s = Math.floor((timeLeft / 1000) % 60);
  const colorClass = status === "lost" ? "text-gameRed" : "text-gameGreen";

  return (
    <div className="grid grid-flow-col gap-1 text-center auto-cols-max text-white items-center justify-center">
      <div className="flex flex-col">
        <span className="countdown font-mono text-2xl">
          <span style={{ "--value": h, "--digits": 2 }}></span>
        </span>
      </div>
      <span className={`${colorClass} text-xl pb-1`}>:</span>
      <div className="flex flex-col">
        <span className="countdown font-mono text-2xl">
          <span style={{ "--value": m, "--digits": 2 }}></span>
        </span>
      </div>
      <span className={`${colorClass} text-xl pb-1`}>:</span>
      <div className="flex flex-col">
        <span className="countdown font-mono text-2xl">
          <span style={{ "--value": s, "--digits": 2 }}></span>
        </span>
      </div>
    </div>
  );
}

export default function DailyGameModals({ isOpen, onClose, onShare, stats }) {
  const [showModal, modalType] = isOpen;
  const isWon = modalType === "won";

  return (
    <Modal
      isOpen={showModal}
      onClose={onClose}
      status={isWon ? "success" : "error"}
      title={isWon ? "You Won" : "Game Over"}
      subtitle="The word was"
      highlight={stats.targetWord}
      wordsForDef={[stats.targetWord]}
      statCards={[
        {
          value: isWon ? stats.streak : "0",
          label: isWon ? "Streak" : "Streak Lost",
          valueColor: isWon ? "text-gameGreen" : "text-gameRed",
          className: `bg-white/5 border ${isWon ? "border-gameGreen/20" : "border-gameRed/20"}`,
        },
        {
          component: (
            <>
              <ModalCountdown status={modalType} />
              <span className="text-[10px] font-bold uppercase text-white/30 tracking-widest mt-2">
                Next Word
              </span>
            </>
          ),
          className: `bg-white/5 border ${isWon ? "border-gameGreen/20" : "border-gameRed/20"}`,
        },
      ]}
      buttons={[
        { label: "Share Result", variant: "default", onClick: onShare },
      ]}
    />
  );
}
