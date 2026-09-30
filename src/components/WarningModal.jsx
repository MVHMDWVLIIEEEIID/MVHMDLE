// components/WarningModal.jsx
import React, { useEffect } from "react";

export default function WarningModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = "Roger That",
  theme = "warning", // "warning" | "danger"
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    // Switched to regular bubbling phase (`false`) instead of capture phase.
    // This allows Modals higher in the hierarchy (like the Guide Modals, which use `true`)
    // to intercept the Enter key and stop it before it reaches the Warning Modal.
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const visibilityClass = isOpen
    ? "opacity-100 pointer-events-auto backdrop-blur-xl"
    : "opacity-0 pointer-events-none backdrop-blur-none";
  const modalTransform = isOpen ? "animate-modalIn" : "animate-modalOut";

  const isDanger = theme === "danger";
  const colorText = isDanger ? "text-gameRed" : "text-gameYellow";
  const colorBorder = isDanger ? "border-gameRed/50" : "border-gameYellow/50";
  const buttonClass = isDanger ? "bg-gameRed" : "bg-gameYellow";

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${visibilityClass}`}
    >
      <div className="fixed inset-0 bg-black/80" />
      <div
        className={`relative w-full max-w-md rounded-3xl bg-[#0a0a0a] border-2 ${colorBorder} p-8 text-center transition-colors duration-500 ${modalTransform}`}
      >
        <div className={`flex justify-center mb-4 ${colorText}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-14 w-14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2
          className={`text-3xl font-black tracking-tighter uppercase mb-4 ${colorText}`}
        >
          {title}
        </h2>
        <p className="text-white/80 font-bold uppercase tracking-widest text-sm mb-8 leading-relaxed">
          {message}
        </p>
        <button
          onClick={onClose}
          className={`w-full text-gameDark font-black py-4 rounded-2xl uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all ${buttonClass}`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
