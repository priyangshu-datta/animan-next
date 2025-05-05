import { useState, useEffect } from 'react';

export function useCountDownTimer(nextEpisodeAiringAt) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!nextEpisodeAiringAt) return;

    function updateCountdown() {
      const now = Date.now() / 1000; // current time in seconds
      const diff = Math.max(0, nextEpisodeAiringAt - now);

      if (diff < 5) return 'Airing now!';

      const seconds = Math.floor(diff % 60)
        .toString()
        .padStart(2, '0');
      const minutes = Math.floor((diff / 60) % 60)
        .toString()
        .padStart(2, '0');
      const hours = Math.floor((diff / 3600) % 24);

      const days = Math.floor(diff / 86400);

      if (days > 0) {
        setTimeLeft(
          `${days} day${days > 1 ? 's' : ''} ${
            hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : ''
          }`
        );
      } else if (hours > 0) {
        setTimeLeft(
          `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${
            minutes > 1 ? 's' : ''
          }`
        );
      } else if (minutes > 0) {
        setTimeLeft(
          `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${
            seconds !== 1 ? 's' : ''
          }`
        );
      } else {
        setTimeLeft(`${seconds} second${seconds !== 1 ? 's' : ''}`);
      }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextEpisodeAiringAt]);

  return timeLeft;
}
