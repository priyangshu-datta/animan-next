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
        // setTimeLeft(
        //   `${days} day${days > 1 ? 's' : ''} ${
        //     hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : ''
        //   }`
        // );
      } else if (hours > 0) {
        duration = {
          hours,
          minutes,
        };
        // setTimeLeft(
        //   `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${
        //     minutes > 1 ? 's' : ''
        //   }`
        // );
      } else if (minutes > 0) {
        duration = {
          minutes,
          seconds,
        };
        // setTimeLeft(
        //   `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${
        //     seconds !== 1 ? 's' : ''
        //   }`
        // );
      } else {
        duration = {
          seconds,
        };
        // setTimeLeft(`${seconds} second${seconds !== 1 ? 's' : ''}`);
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
