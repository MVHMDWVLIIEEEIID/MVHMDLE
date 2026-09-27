// components/ParticleOverlay.jsx
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

export default function ParticleOverlay() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const handleTrigger = () => {
      // Reduced length to exactly 19
      const HEARTS = Array.from({ length: 19 }, (_, i) => {
        const isLeft = i % 2 === 0;
        return {
          id: Date.now() + i,
          left: isLeft
            ? `${Math.random() * 30 + 5}%`
            : `${Math.random() * 30 + 65}%`,
          delay: Math.random() * 1.5,
          duration: Math.random() * 2 + 2,
          scale: Math.random() * 0.8 + 0.8,
          // Forced all hearts to be red
          color: "#EF4444",
        };
      });

      setParticles(HEARTS);

      setTimeout(() => {
        setParticles([]);
      }, 6000);
    };

    window.addEventListener("sys-particles", handleTrigger);
    return () => window.removeEventListener("sys-particles", handleTrigger);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-9999 overflow-hidden">
      <AnimatePresence>
        {particles.map((heart) => (
          <motion.div
            key={heart.id}
            className="absolute -bottom-20 z-0 pointer-events-none"
            style={{ left: heart.left }}
            initial={{ y: 0, opacity: 0, scale: heart.scale }}
            animate={{
              y: "-120vh",
              opacity: [0, 1, 1, 0],
              x: ["-20px", "20px", "-20px"],
            }}
            transition={{
              y: {
                duration: heart.duration,
                ease: "linear",
                delay: heart.delay,
              },
              opacity: {
                duration: heart.duration,
                ease: "linear",
                delay: heart.delay,
              },
              x: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: heart.delay,
              },
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={heart.color}
              xmlns="http://www.w3.org/2000/svg"
              // Adjusted the glow to match the red color
              style={{ filter: "drop-shadow(0 0 10px rgba(239, 68, 68, 0.6))" }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
