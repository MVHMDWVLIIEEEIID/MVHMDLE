// components/ShopPopover.jsx
import React, { useEffect, useRef } from "react";
import Shop from "./Shop";

export default function ShopPopover({ isOpen, onClose, currency, ...shopProps }) {
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    
    // Slight delay to prevent the initial click that opens it from instantly closing it
    const clickTimer = setTimeout(() => {
      window.addEventListener("click", handleClickOutside);
    }, 10);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("click", handleClickOutside);
      clearTimeout(clickTimer);
    };
  }, [isOpen, onClose]);

  const visibilityClass = isOpen
    ? "opacity-100 pointer-events-auto translate-y-0 scale-100"
    : "opacity-0 pointer-events-none translate-y-4 scale-95";

  return (
    <div
      ref={popoverRef}
      // FIXED: Now anchors to left-0 and scales from origin-bottom-left
      className={`absolute bottom-full mb-3 left-0 w-72 max-h-[65vh] flex flex-col rounded-3xl bg-[#0a0a0a] border-2 border-gameLight/50 p-4 transition-all duration-300 ease-[cubic-bezier(0.2,1,0.3,1)] origin-bottom-left z-50 ${visibilityClass}`}
    >
      {/* FIXED HEADER */}
      <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-3 shrink-0">
        <h2 className="text-xl font-black uppercase text-gameLight tracking-widest leading-none">
          Shop
        </h2>
        
        {/* Balance & Close Button Container */}
        <div className="flex items-center gap-2">
          <div className="bg-gameGreen/15 px-2 py-1 rounded-md border border-gameGreen/30">
            <span className="text-[10px] font-mono font-bold text-gameGreen tracking-tighter">
              ${currency?.toLocaleString()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 text-white rounded-full p-1.5 transition-all active:scale-90 shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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
  );
}