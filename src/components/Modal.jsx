// components/Modal.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import DictionaryPanel from "./DictionaryPanel";

const HeartIcon = ({ className = "w-8 h-8" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
);

const BrokenHeartIcon = ({
  className = "w-8 h-8 text-gameRed animate-pulse",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    <path
      d="M13.7 6.4l-2.7 3.6 2.1.8-1.6 2.7 2.3.9-2.1 4.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gameDark"
    />
    <path
      d="M10.8 10.1l-1.7 1.5m3.6 2.3l-1.8 1.7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gameDark"
    />
  </svg>
);

const TargetTooltip = ({ word, theme, children }) => {
  const [def, setDef] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  useEffect(() => {
    const fetchDef = async () => {
      if (!word) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const API_KEY = "eace2fc3-0bb2-4258-87a3-717af272dfd5";
        const targetWord = String(word).trim().toLowerCase();
        const res = await fetch(
          `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(targetWord)}?key=${API_KEY}`,
        );

        if (!res.ok) {
          setDef("Definition unavailable.");
          return;
        }

        const result = await res.json();

        if (
          result &&
          result.length > 0 &&
          typeof result[0] !== "string" &&
          result[0].shortdef?.length > 0
        ) {
          const cleanDef = result[0].shortdef[0];
          setDef(
            cleanDef.charAt(0).toUpperCase() +
              cleanDef.slice(1) +
              (cleanDef.endsWith(".") ? "" : "."),
          );
        } else {
          setDef("No definition found.");
        }
      } catch (e) {
        setDef("Definition unavailable.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDef();
  }, [word]);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left + rect.width / 2,
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsHovered(false);
    if (isHovered) {
      window.addEventListener("wheel", handleScroll, {
        passive: true,
        capture: true,
      });
      window.addEventListener("touchmove", handleScroll, {
        passive: true,
        capture: true,
      });
    }
    return () => {
      window.removeEventListener("wheel", handleScroll, { capture: true });
      window.removeEventListener("touchmove", handleScroll, { capture: true });
    };
  }, [isHovered]);

  return (
    <div
      ref={triggerRef}
      className="inline-flex flex-col items-center mt-2 cursor-help"
      onMouseEnter={() => {
        updateCoords();
        setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      {isHovered &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={`fixed px-5 py-3 pointer-events-none rounded-xl bg-[#0a0a0a] border-2 ${theme.border} ${theme.text} text-[11px] font-bold z-99999 w-max max-w-xs text-center leading-relaxed flex flex-col gap-1.5`}
            style={{
              top: coords.top - 8,
              left: coords.left,
              transform: "translate(-50%, -100%)",
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading loading-dots loading-xs"></span>
              </span>
            ) : (
              <span className="text-white/80">{def}</span>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default function Modal({
  isOpen,
  onClose,
  status = "success",
  title,
  subtitle,
  highlight,
  highlightType = "normal",
  heartsData,
  statCards = [],
  customBody,
  wordsForDef = [],
  guessesData = [],
  buttons = [],
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
        setHasOpenedOnce(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const allWordsToDefine = useMemo(() => {
    const safeWords = wordsForDef || [];
    const safeGuesses = guessesData || [];

    return Array.from(
      new Set([
        ...safeWords,
        ...safeGuesses.map((g) => (typeof g === "string" ? g : g?.word)),
      ]),
    ).filter((w) => typeof w === "string" && w.trim().length > 0);
  }, [wordsForDef, guessesData]);

  const handleToggleDict = () => {
    setIsExpanded(!isExpanded);
    setHasOpenedOnce(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        if (e.repeat) return;
        e.preventDefault();
        e.stopPropagation();
        const primaryBtn = buttons.find((b) =>
          ["success", "primary", "warning", "danger"].includes(b.variant),
        );
        if (primaryBtn?.onClick) primaryBtn.onClick();
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (onClose) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, buttons, onClose]);

  const visibilityClass = isOpen
    ? "opacity-100 pointer-events-auto backdrop-blur-xl"
    : "opacity-0 pointer-events-none backdrop-blur-none";
  const modalTransform = isOpen ? "animate-modalIn" : "animate-modalOut";

  const styles = {
    success: {
      text: "text-gameGreen",
      border: "border-gameGreen/50",
      scrollColor: "var(--color-gameGreen)",
    },
    error: {
      text: "text-gameRed",
      border: "border-gameRed/50",
      scrollColor: "var(--color-gameRed)",
    },
    warning: {
      text: "text-gameYellow",
      border: "border-gameYellow/50",
      scrollColor: "var(--color-gameYellow)",
    },
  };

  const theme = styles[status] || styles.success;

  const renderHighlight = () => {
    if (!highlight) return null;
    if (typeof highlight !== "string" && highlightType !== "boss")
      return highlight;

    if (highlightType === "boss") {
      const separator = highlight.includes(" , ")
        ? " , "
        : highlight.includes(" - ")
          ? " - "
          : ",";
      const words = highlight.split(separator);

      return (
        <div
          className={`text-2xl font-black text-gameLight uppercase text-center mb-2 mt-2 flex flex-wrap justify-center items-center gap-2`}
        >
          <span>(</span>
          {words.map((w, i) => (
            <React.Fragment key={i}>
              <TargetTooltip word={w.trim()} theme={theme}>
                <span className="cursor-help hover:text-white transition-colors border-b border-dashed border-white/30 pb-0.5">
                  {w.trim()}
                </span>
              </TargetTooltip>
              {i < words.length - 1 && <span>{separator.trim()}</span>}
            </React.Fragment>
          ))}
          <span>)</span>
        </div>
      );
    }

    return (
      <TargetTooltip word={highlight} theme={theme}>
        <p
          className={`text-4xl font-black text-gameLight uppercase tracking-wider mb-2 cursor-help border-b border-dashed border-transparent hover:border-white/30 transition-colors pb-1`}
        >
          "{highlight}"
        </p>
      </TargetTooltip>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${visibilityClass}`}
    >
      <style>{`
        .custom-modal-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-modal-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-modal-scroll::-webkit-scrollbar-thumb {
          background-color: ${theme.scrollColor};
          border-radius: 9999px;
        }
        .custom-modal-scroll::-webkit-scrollbar-button {
          display: none;
        }
      `}</style>

      <div className="fixed inset-0 bg-black/80" onClick={onClose} />

      <div
        className={`relative bg-[#0a0a0a] border-2 rounded-3xl transition-[width] duration-500 ease-[cubic-bezier(0.2,1,0.3,1)] ${theme.border} ${modalTransform} ${isExpanded ? "w-200" : "w-md"}`}
      >
        {/* LEFT COLUMN: Main Stats */}
        <div
          className={`w-md max-h-[85vh] p-8 flex flex-col items-center overflow-y-auto custom-modal-scroll relative z-10 transition-colors duration-500 ${isExpanded ? `border-r-2 ${theme.border}` : ""}`}
        >
          <div className="relative flex items-center justify-center mb-8 h-10 w-full shrink-0">
            <h2
              className={`text-3xl font-black tracking-tighter uppercase text-center ${theme.text}`}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="absolute right-0 bg-white/5 hover:bg-white/10 text-white rounded-full p-2.5 transition-all active:scale-90"
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

          {subtitle && (
            <p
              className={`text-xs uppercase tracking-widest font-bold mb-2 shrink-0 ${status === "success" ? "text-gameGreen/50" : "text-white/40"}`}
            >
              {subtitle}
            </p>
          )}

          {heartsData && (
            <div className="flex gap-2 mb-4 shrink-0">
              {[...Array(heartsData.active || 0)].map((_, i) => (
                <span key={`a-${i}`} className="text-3xl">
                  <HeartIcon className="w-8 h-8 text-gameRed" />
                </span>
              ))}
              {[...Array(heartsData.broken || 0)].map((_, i) => (
                <span key={`b-${i}`} className="text-3xl">
                  <BrokenHeartIcon />
                </span>
              ))}
              {[...Array(heartsData.empty || 0)].map((_, i) => (
                <span key={`e-${i}`} className="text-3xl grayscale opacity-30">
                  <HeartIcon className="w-8 h-8 text-gameLight/50" />
                </span>
              ))}
            </div>
          )}

          {renderHighlight()}

          {statCards.length > 0 && (
            <div
              className={`grid gap-3 w-full mt-4 shrink-0 ${statCards.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
            >
              {statCards.map((card, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl flex flex-col items-center justify-center p-4 min-h-25 ${card.className || "bg-white/5 border border-white/10"}`}
                >
                  {card.component ? (
                    card.component
                  ) : (
                    <>
                      <span
                        className={`text-4xl font-black leading-none ${card.valueColor || "text-white"}`}
                      >
                        {card.value}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${card.labelColor || "text-white/40"}`}
                      >
                        {card.label}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {customBody && (
            <div className="w-full mt-2 shrink-0">{customBody}</div>
          )}

          {buttons.length > 0 && (
            <div className="flex gap-4 w-full mt-8 shrink-0">
              {buttons.map((btn, idx) => {
                let btnClass =
                  "w-full font-black py-4 rounded-2xl transition-all uppercase text-sm tracking-widest active:scale-95 ";
                if (btn.variant === "success")
                  btnClass +=
                    "bg-gameGreen text-gameDark hover:scale-105";
                else if (btn.variant === "danger")
                  btnClass +=
                    "bg-gameRed text-gameDark hover:scale-105";
                else if (btn.variant === "warning")
                  btnClass +=
                    "bg-gameYellow text-gameDark hover:scale-105";
                else if (btn.variant === "ghost")
                  btnClass +=
                    "bg-transparent text-white/30 hover:text-white border border-transparent py-2";
                else
                  btnClass +=
                    "bg-gameDark border-2 border-gameGreen text-gameGreen hover:scale-105 ";
                return (
                  <button key={idx} onClick={btn.onClick} className={btnClass}>
                    {btn.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Dict Panel */}
        <div
          className={`absolute top-0 right-0 bottom-0 overflow-hidden transition-[width] duration-500 ease-[cubic-bezier(0.2,1,0.3,1)] z-0 ${isExpanded ? "w-88" : "w-0"}`}
        >
          <div className="w-88 h-full py-6 pl-6">
            {hasOpenedOnce && (
              <DictionaryPanel words={allWordsToDefine} theme={theme} />
            )}
          </div>
        </div>

        {/* EXTERNAL ARROW TAB */}
        {allWordsToDefine.length > 0 && (
          <button
            onClick={handleToggleDict}
            className={`absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center cursor-pointer transition-colors z-30 bg-[#0a0a0a] border-2 ${theme.border} rounded-r-xl hover:bg-white/5`}
            style={{ right: "-34px", width: "34px", height: "5rem" }}
            title="Toggle Dictionary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`w-5 h-5 ${theme.text} transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
            >
              <path
                fillRule="evenodd"
                d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
