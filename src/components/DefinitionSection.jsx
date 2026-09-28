// components/DefinitionSection.jsx
import React, { useState, useEffect, useRef } from "react";

export default function DefinitionSection({ word, open = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [definition, setDefinition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Use refs to avoid unnecessary re-renders in effect dependencies
  const definitionRef = useRef(definition);
  const loadingRef = useRef(loading);
  const errorRef = useRef(error);

  // Reset state when the target word changes
  useEffect(() => {
    setIsExpanded(false); // Default to closed on new word
    setDefinition(null);
    setError(false);
  }, [word]);

  useEffect(() => {
    definitionRef.current = definition;
    loadingRef.current = loading;
    errorRef.current = error;
  }, [definition, loading, error]);

  // Handle external open state (used in Survival Game Modals)
  useEffect(() => {
    if (open) {
      setIsExpanded(true);
      fetchDefinitionIfNeeded();
    } else {
      setIsExpanded(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, word]);

  const fetchDefinitionIfNeeded = async () => {
    if (definitionRef.current || loadingRef.current || errorRef.current) return;
    setLoading(true);

    try {
      const targetWord = word.trim().toLowerCase();
      // Merriam-Webster Collegiate Dictionary API
      const API_KEY = "eace2fc3-0bb2-4258-87a3-717af272dfd5";
      const res = await fetch(
        `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(targetWord)}?key=${API_KEY}`,
      );

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();

      // MW API returns an array of strings if it only has spelling suggestions, not a direct match
      if (!data || data.length === 0 || typeof data[0] === "string") {
        setDefinition("No definition found for this word.");
        return;
      }

      // Grab the most common short definition
      const shortDefs = data[0].shortdef;
      if (!shortDefs || shortDefs.length === 0) {
        setDefinition("No definition found for this word.");
        return;
      }

      // Format response (Capitalize first letter, ensure it ends with a period)
      const cleanDef = shortDefs[0];
      const formattedDef =
        cleanDef.charAt(0).toUpperCase() +
        cleanDef.slice(1) +
        (cleanDef.endsWith(".") ? "" : ".");

      setDefinition(formattedDef);
    } catch (err) {
      console.error("Dictionary API Fetch Error:", err);
      setError(true);
      setDefinition("Definition unavailable for this word.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      fetchDefinitionIfNeeded();
    } else {
      setIsExpanded(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center mt-6 pt-4 border-t border-white/10">
      <button
        onClick={handleToggle}
        className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white/80 transition-all duration-300"
      >
        <span>
          {isExpanded
            ? "Hide Definition"
            : `Show definition${word ? ` of ${word}` : ""}`}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div
        className={`grid transition-all duration-500 ease-in-out w-full ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0 mt-0"}`}
      >
        <div className="overflow-hidden">
          <div className="bg-white/5 border border-white/5 rounded-xl p-4 w-full text-center relative">
            {loading ? (
              <div className="flex justify-center py-2">
                <span className="loading loading-dots loading-sm text-white/50"></span>
              </div>
            ) : (
              <div>
                <p className="text-xs font-serif italic text-gameLight/90 leading-relaxed">
                  "{definition}"
                </p>
                {error && (
                  <span className="text-[9px] text-red-400 uppercase font-bold mt-2 block">
                    API Error
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
