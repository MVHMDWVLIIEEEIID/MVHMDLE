// hooks/useSecureState.js
import { useState, useEffect } from "react";
import { secureStorage } from "../utils/secureStorage";

export default function useSecureState(key, initialValue) {
  // Initialize state lazily from storage or fallback to initialValue
  const [state, setState] = useState(() => {
    const saved = secureStorage.getItem(key, null);
    if (saved !== null) return saved;
    return typeof initialValue === "function" ? initialValue() : initialValue;
  });

  // Auto-sync with secureStorage whenever state changes
  useEffect(() => {
    if (state === null || state === undefined) {
      secureStorage.removeItem(key);
    } else {
      secureStorage.setItem(key, state);
    }
  }, [key, state]);

  return [state, setState];
}