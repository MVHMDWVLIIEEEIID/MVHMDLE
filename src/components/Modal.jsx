import { useEffect, useState, useRef } from "react";
import DefinitionSection from "./DefinitionSection";

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

export default function Modal({
  isOpen,
  onClose,
  status = "success", // "success" | "error" | "warning"
  title,
  subtitle,
  highlight, // String or ReactNode
  highlightType = "normal", // "normal" | "boss"
  heartsData, // { active, broken, empty }
  statCards = [], // Array of objects: { value, label, valueColor, component, className }
  customBody, // Optional ReactNode for complex inner sections like Earnings
  wordsForDef = [], // Array of strings to look up
  buttons = [], // Array of objects: { label, onClick, variant }
}) {
  const defsRef = useRef([]);
  const [expandedDefs, setExpandedDefs] = useState([]);

  // Keyboard Shortcuts
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

  // Dynamic Theme Generator based on Status
  const styles = {
    success: {
      text: "text-gameGreen",
      border: "border-gameGreen/50",
      shadow: "shadow-[0_0_40px_rgba(0,255,100,0.1)]",
      drop: "drop-shadow-[0_0_15px_rgba(74,222,128,0.25)]",
    },
    error: {
      text: "text-gameRed",
      border: "border-gameRed/50",
      shadow: "shadow-[0_0_40px_rgba(255,50,50,0.1)]",
      drop: "drop-shadow-[0_0_25px_rgba(239,68,68,0.4)]",
    },
    warning: {
      text: "text-gameYellow",
      border: "border-gameYellow/50",
      shadow: "shadow-[0_0_40px_rgba(250,204,21,0.1)]",
      drop: "drop-shadow-[0_0_20px_rgba(250,204,21,0.3)]",
    },
  };
  const theme = styles[status] || styles.success;

  // Render highlighted text dynamically
  const renderHighlight = () => {
    if (!highlight) return null;
    if (typeof highlight !== "string") return highlight; // If it's custom JSX (like Victory text)
    if (highlightType === "boss") {
      return (
        <div
          className={`text-2xl font-black text-gameLight uppercase ${theme.drop} text-center mb-2`}
        >
          ( {highlight} )
        </div>
      );
    }
    return (
      <p
        className={`text-4xl font-black text-gameLight uppercase tracking-wider ${theme.drop} mb-2`}
      >
        "{highlight}"
      </p>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${visibilityClass}`}
    >
      <div className="fixed inset-0 bg-black/80" onClick={onClose} />
      <div
        className={`relative w-full max-w-md rounded-3xl bg-[#0a0a0a] border-2 p-8 transition-colors duration-500 flex flex-col items-center ${theme.border} ${theme.shadow} ${modalTransform}`}
      >
        {/* Title & Close Button */}
        <div className="relative flex items-center justify-center mb-8 h-10 w-full">
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

        {/* Dynamic Subtitle */}
        {subtitle && (
          <p
            className={`text-xs uppercase tracking-widest font-bold mb-2 ${status === "success" ? "text-gameGreen/50" : "text-white/40"}`}
          >
            {subtitle}
          </p>
        )}

        {/* Hearts (For Lost Heart mode) */}
        {heartsData && (
          <div className="flex gap-2 mb-4">
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

        {/* The Target Word or Custom Highlight */}
        {renderHighlight()}

        {/* Automatic Stat Cards Map */}
        {statCards.length > 0 && (
          <div
            className={`grid gap-3 w-full mt-2 ${statCards.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
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

        {/* Custom Central Body (For complex Earnings logic) */}
        {customBody && <div className="w-full mt-2">{customBody}</div>}

        {/* Automatic Dictionary Section */}
        {wordsForDef.length > 0 && (
          <div className="w-full mt-4">
            <div className="max-h-28 overflow-y-auto space-y-4 hide-scrollbar">
              {wordsForDef.map((word, idx) => (
                <div key={idx} ref={(el) => (defsRef.current[idx] = el)}>
                  <DefinitionSection
                    word={word}
                    open={expandedDefs.includes(idx)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reusable Buttons Map */}
        {buttons.length > 0 && (
          <div className="flex gap-4 w-full mt-8">
            {buttons.map((btn, idx) => {
              let btnClass =
                "w-full font-black py-4 rounded-2xl transition-all uppercase text-sm tracking-widest active:scale-95 ";
              if (btn.variant === "success")
                btnClass +=
                  "bg-gameGreen text-gameDark hover:scale-105 shadow-lg shadow-gameGreen/20";
              else if (btn.variant === "danger")
                btnClass +=
                  "bg-gameRed text-gameDark hover:scale-105 shadow-lg shadow-gameRed/20";
              else if (btn.variant === "warning")
                btnClass +=
                  "bg-gameYellow text-gameDark hover:scale-105 shadow-lg shadow-gameYellow/20";
              else if (btn.variant === "ghost")
                btnClass +=
                  "bg-transparent text-white/30 hover:text-white border border-transparent py-2";
              else
                btnClass +=
                  "bg-gameDark border-2 border-gameGreen text-gameGreen hover:scale-105 shadow-lg";

              return (
                <button key={idx} onClick={btn.onClick} className={btnClass}>
                  {btn.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
