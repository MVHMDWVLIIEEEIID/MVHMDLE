// hooks/useGameInput.js
import { useState, useEffect, useRef } from "react";
import data from "../data/words.json";

export default function useGameInput({
  turn,
  rowCount,
  gameState,
  guessesLength,
  onValidSubmit,
  onGameOver,
  triggerShake,
  addToast,
}) {
  const [currentGuess, setCurrentGuess] = useState("");
  const isSubmittingRef = useRef(false);

  // إعادة ضبط حالة الإرسال عند تغير الدور أو حالة اللعبة
  useEffect(() => {
    isSubmittingRef.current = false;
  }, [turn, gameState, guessesLength]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        return;
      }
      
      if (e.repeat) return;
      const key = e.key;

      // عند الضغط على Enter (محاولة الإرسال)
      if (key === "Enter") {
        e.preventDefault();
        if (isSubmittingRef.current) return;

        if (gameState !== "playing" || turn >= rowCount) {
          if (gameState === "won") onGameOver?.("won-already");
          else onGameOver?.("lost-already");
          return;
        }

        const guessToSubmit = currentGuess?.toLowerCase();
        
        // التحقق من طول الكلمة
        if (guessToSubmit.length !== 5) {
          triggerShake?.();
          addToast?.("Not enough letters!", "error");
          return;
        }

        // التحقق من وجود الكلمة في القاموس
        if (!data.includes(guessToSubmit)) {
          triggerShake?.();
          addToast?.("Incorrect word", "error");
          return;
        }

        // الكلمة صحيحة! نرسلها للمكون المسؤول وإذا قبلها نقوم بتفريغ الإدخال
        const accepted = onValidSubmit(guessToSubmit);
        if (accepted) {
          isSubmittingRef.current = true;
          setCurrentGuess("");
        }
        return;
      }

      // منع الإدخال إذا انتهت اللعبة
      if (gameState !== "playing" || turn >= rowCount) return;

      // مسح حرف
      if (key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }

      // كتابة حرف إنجليزي فقط
      if (/^[a-zA-Z]$/.test(key)) {
        if (currentGuess.length < 5) {
          setCurrentGuess((prev) => (prev + key)?.toLowerCase());
        }
      } else if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        addToast?.("Game only accepts English letters", "error");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentGuess,
    turn,
    rowCount,
    gameState,
    onValidSubmit,
    onGameOver,
    triggerShake,
    addToast,
  ]);

  return { currentGuess, setCurrentGuess };
}