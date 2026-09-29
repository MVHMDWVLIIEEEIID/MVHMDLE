// hooks/useKeyboardIndicators.js
import { useState, useEffect } from "react";

export default function useKeyboardIndicators(history) {
  const [indicators, setIndicators] = useState({});

  useEffect(() => {
    if (!history || !Array.isArray(history) || history.length === 0) {
      setIndicators({});
      return;
    }

    // Isolate only the hints purchased in the currently active round
    let currentHints = [];
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].type === "game-marker") break;
      currentHints.push(history[i]);
    }

    const newIndicators = {};

    currentHints.forEach((hint) => {
      const msg = hint.msg || "";

      if (hint.name === "Green Letter") {
        const match = msg.match(/Position (\d+) is '([A-Z])'/i);
        if (match) {
          const pos = match[1];
          const letter = match[2].toLowerCase();
          newIndicators[letter] = {
            className:
              "bg-gameGreen border-gameDark border-[2.5px] text-gameDark w-5 h-5 text-[11px]",
            label: pos,
          };
        }
      } else if (
        hint.name === "Yellow Letter" ||
        hint.name === "Vowel Letter"
      ) {
        const match =
          msg.match(/contains '([A-Z])'/i) || msg.match(/Contains:\s*([A-Z])/i);
        if (match) {
          const letter = match[1].toLowerCase();
          if (!newIndicators[letter]) {
            newIndicators[letter] = {
              className:
                "bg-gameYellow border-gameDark border-[2.5px] text-transparent w-3.5 h-3.5",
              label: "",
            };
          }
        }
      } else if (hint.name === "Hide a Letter") {
        const match = msg.match(/Removed:\s*([A-Z])/i);
        if (match) {
          const letter = match[1].toLowerCase();
          if (!newIndicators[letter]) {
            newIndicators[letter] = {
              className:
                "bg-gameGrey border-gameDark border-[2.5px] text-transparent w-3.5 h-3.5",
              label: "",
            };
          }
        }
      }
    });

    setIndicators(newIndicators);
  }, [history]);

  return indicators;
}
