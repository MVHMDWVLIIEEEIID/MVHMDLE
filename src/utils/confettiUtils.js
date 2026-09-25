// utils/confettiUtils.js
import confetti from "canvas-confetti";

// Trigger a standard side-by-side confetti blast
export const handleConfetti = () => {
  const end = Date.now() + 3000;
  const colors = ["#ed143d", "#3498db", "#ffd500", "#00e196"];

  const frame = () => {
    if (Date.now() > end) return;

    confetti({
      particleCount: 4,
      angle: 90,
      spread: 75,
      origin: { x: 0, y: 0.75 },
      colors,
    });

    confetti({
      particleCount: 4,
      angle: 90,
      spread: 75,
      origin: { x: 1, y: 0.75 },
      colors,
    });

    requestAnimationFrame(frame);
  };

  frame();
};

// Trigger an intensive confetti blast for beating the full game
export const launchBeatGameConfetti = () => {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 0,
    colors: ["#00e196", "#ffd500", "#3498db", "#ed143d"],
  };

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
};
