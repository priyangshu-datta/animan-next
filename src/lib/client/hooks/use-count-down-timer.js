import {
  DAY_IN_MS,
  HOUR_IN_MS,
  MINUTE_IN_MS,
  SECOND_IN_MS,
} from '@/lib/constants';
import AppStorage from '@/utils/local-storage';
import { useState, useEffect } from 'react';

export function useCountDownTimer(nextEpisodeAiringAt) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!nextEpisodeAiringAt) return;

    function updateCountdown() {
      const now = Date.now(); // current time in seconds
      const diff = Math.max(0, nextEpisodeAiringAt - now);

      if (diff < 5) return 'Airing now!';

      const seconds = Math.floor((diff / SECOND_IN_MS) % 60)
        .toString()
        .padStart(2, '0');
      const minutes = Math.floor((diff / MINUTE_IN_MS) % 60)
        .toString()
        .padStart(2, '0');
      const hours = Math.floor((diff / HOUR_IN_MS) % 24);

      const days = Math.floor(diff / DAY_IN_MS);

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
        new Intl.DurationFormat(AppStorage.get('locale'), {
          style: 'long',
        }).format(duration)
      );
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextEpisodeAiringAt]);

  return timeLeft;
}
