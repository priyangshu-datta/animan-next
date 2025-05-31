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

      let duration = null;

      if (days > 0) {
        duration = {
          days,
          hours,
        };
      } else if (hours > 0) {
        duration = {
          hours,
          minutes,
        };
      } else if (minutes > 0) {
        duration = {
          minutes,
          seconds,
        };
      } else {
        duration = {
          seconds,
        };
      }
      setTimeLeft(
        new Intl.DurationFormat(
          localStorage.getItem('animan-locale') ?? undefined,
          {
            style: 'long',
          }
        ).format(duration)
      );
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextEpisodeAiringAt]);

  return timeLeft;
}
