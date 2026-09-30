// components/ShopModal.jsx
import React, { useEffect } from "react";
import Shop from "./Shop";

export default function ShopModal({ isOpen, onClose, currency, ...shopProps }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, onClose]);

  const visibilityClass = isOpen
    ? "opacity-100 pointer-events-auto backdrop-blur-xl"
    : "opacity-0 pointer-events-none backdrop-blur-none";
  const modalTransform = isOpen ? "animate-modalIn" : "animate-modalOut";

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${visibilityClass}`}
    >
      <div className="fixed inset-0 bg-black/80" onClick={onClose} />

      {/* ADDED h-[36rem] to firmly cap the height, maintaining max-h-[85vh] for mobile screens */}
      <div
        className={`relative w-full max-w-md h-[30rem] max-h-[85vh] flex flex-col rounded-3xl bg-[#0a0a0a] border-2 border-gameLight/50 p-6 transition-colors duration-500 ${modalTransform}`}
      >
        {/* FIXED HEADER */}
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4 shrink-0">
          <h2 className="text-2xl font-black uppercase text-gameLight tracking-widest leading-none">
            Shop
          </h2>

          {/* Balance & Close Button Container */}
          <div className="flex items-center gap-3">
            <div className="bg-gameGreen/15 px-3 py-1.5 rounded-md border border-gameGreen/30">
              <span className="text-xs font-mono font-bold text-gameGreen tracking-tighter">
                ${currency?.toLocaleString()}
              </span>
            </div>
            <button
              onClick={onClose}
              className="bg-white/5 hover:bg-white/10 text-white rounded-full p-2 transition-all active:scale-90 shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* SCROLLABLE LIST WRAPPER */}
        <Shop currency={currency} {...shopProps} />
      </div>
    </div>
  );
}
