import { useState, useCallback } from "react";

export default function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((msg, type = "info") => {
    const id = Date.now() + Math.random();
    
    setToasts((prev) => {
      // إبقاء 3 توستات كحد أقصى على الشاشة
      const updated = [...prev, { id, msg, type }];
      return updated.length > 3 ? updated.slice(updated.length - 3) : updated;
    });

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  return { toasts, addToast };
}