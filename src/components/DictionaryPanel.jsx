// components/DictionaryPanel.jsx
import React, { useState, useEffect, useRef } from "react";

function DictionaryEntry({ word, theme }) {
  const [dict, setDict] = useState({
    loading: true,
    phonetic: "",
    meaning: "",
    audio: "",
    error: false,
  });
  const [arabic, setArabic] = useState({
    loading: true,
    text: "",
    error: false,
  });

  // Create a persistent reference to the audio object
  const audioRef = useRef(null);

  useEffect(() => {
    const targetWord = String(word).trim().toLowerCase();
    if (!targetWord) return;

    const MW_API_KEY = "eace2fc3-0bb2-4258-87a3-717af272dfd5";

    // Fetch Dictionary
    const fetchDictionary = async () => {
      try {
        const res = await fetch(
          `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(targetWord)}?key=${MW_API_KEY}`,
        );
        if (!res.ok) throw new Error();

        const result = await res.json();
        if (!result || result.length === 0 || typeof result[0] === "string") {
          setDict({
            loading: false,
            phonetic: "",
            meaning: "No definition found.",
            audio: "",
            error: true,
          });
          return;
        }

        const prs = result[0].hwi?.prs?.[0];
        const phonetic = prs?.mw || "";
        const audioFile = prs?.sound?.audio || "";

        const shortDefs = result[0].shortdef;
        if (!shortDefs || shortDefs.length === 0) {
          setDict({
            loading: false,
            phonetic,
            meaning: "No definition found.",
            audio: audioFile,
            error: true,
          });
          return;
        }

        const cleanDef = shortDefs[0];
        const formattedDef =
          cleanDef.charAt(0).toUpperCase() +
          cleanDef.slice(1) +
          (cleanDef.endsWith(".") ? "" : ".");

        setDict({
          loading: false,
          phonetic,
          meaning: formattedDef,
          audio: audioFile,
          error: false,
        });
      } catch (err) {
        setDict({
          loading: false,
          phonetic: "",
          meaning: "API Error. Could not load.",
          audio: "",
          error: true,
        });
      }
    };

    // Fetch Translation via Google Translate
    const fetchTranslation = async () => {
      try {
        const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(targetWord)}`;
        const gRes = await fetch(googleUrl);
        if (!gRes.ok) throw new Error();

        const gData = await gRes.json();
        const rawArabic = gData?.[0]?.[0]?.[0];

        if (rawArabic) {
          const cleanArabic = rawArabic.split(/[,،，‚;؛]|\s+أو\s+/)[0].trim();
          setArabic({ loading: false, text: cleanArabic, error: false });
        } else {
          throw new Error();
        }
      } catch (err) {
        setArabic({ loading: false, text: "", error: true });
      }
    };

    fetchDictionary();
    fetchTranslation();
  }, [word]);

  // Preload the MP3 the exact second the dictionary API returns the audio file name
  useEffect(() => {
    if (dict.audio) {
      let subdir = dict.audio.charAt(0);
      if (dict.audio.startsWith("bix")) subdir = "bix";
      else if (dict.audio.startsWith("gg")) subdir = "gg";
      else if (/^[^a-zA-Z]/.test(dict.audio)) subdir = "number";

      const url = `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdir}/${dict.audio}.mp3`;
      audioRef.current = new Audio(url);
      audioRef.current.preload = "auto";
    }
  }, [dict.audio]);

  const playAudio = () => {
    if (audioRef.current) {
      // Pause and reset time in case the user spams the button
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((e) => console.error("Audio playback error:", e));
    }
  };

  return (
    <div className="mb-6 border-b border-white/10 pb-6 last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={playAudio}
            disabled={!dict.audio}
            title={dict.audio ? "Play Pronunciation" : "No Audio Available"}
            className={`rounded-full w-7 h-7 flex items-center justify-center shrink-0 bg-white/5 border ${theme.border} transition-transform active:scale-90 ${dict.audio ? "cursor-pointer hover:bg-white/10" : "opacity-30 cursor-not-allowed"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`w-3.5 h-3.5 ${theme.text}`}
            >
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
              <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
            </svg>
          </button>
          <h3 className="text-xl font-black text-white uppercase tracking-wider">
            {word}
          </h3>
        </div>

        {arabic.loading ? (
          <div className="h-4 w-12 bg-white/10 rounded animate-pulse"></div>
        ) : arabic.text ? (
          <h3
            className="text-xl font-bold text-gameLight/90 font-sans"
            dir="rtl"
            style={{ letterSpacing: "normal", wordSpacing: "normal" }}
          >
            {arabic.text}
          </h3>
        ) : null}
      </div>

      <div className="pl-10">
        {dict.loading ? (
          <div className="animate-pulse flex flex-col gap-2">
            <div className="h-3 w-16 bg-white/10 rounded"></div>
            <div className="h-3 w-full bg-white/10 rounded"></div>
            <div className="h-3 w-3/4 bg-white/10 rounded"></div>
          </div>
        ) : (
          <>
            {dict.phonetic && (
              <p className="text-white/40 font-mono text-sm mb-2">
                /{dict.phonetic}/
              </p>
            )}
            <p className="text-white/80 text-sm leading-relaxed font-medium">
              {dict.meaning}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function DictionaryPanel({ words, theme }) {
  if (!words || words.length === 0) return null;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto custom-modal-scroll pr-6">
        {words.map((w, i) => (
          <DictionaryEntry key={`${w}-${i}`} word={w} theme={theme} />
        ))}
      </div>
    </div>
  );
}
