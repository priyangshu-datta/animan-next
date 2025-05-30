export function getSkyGradient(startTimestamp, endTimestamp) {
  const gradientStops = [
    { time: 0, color: '#0d0b1d' }, // Midnight (deep violet/navy)
    { time: 4.5, color: '#1b1464' }, // 4:30 AM (early dawn)
    { time: 5.5, color: '#f9a825' }, // 5:30 AM (golden-orange sunrise)
    { time: 7, color: '#ffcc80' }, // 7 AM (light warm orange)
    { time: 9, color: '#b3e5fc' }, // 9 AM (soft morning blue)
    { time: 12, color: '#81d4fa' }, // Noon (bright blue with slight haze)
    { time: 15, color: '#4fc3f7' }, // 3 PM (midday blue)
    { time: 17.5, color: '#ffb74d' }, // 5:30 PM (early sunset, warm orange)
    { time: 18.5, color: '#ff7043' }, // 6:30 PM (sunset pink/orange)
    { time: 19.5, color: '#4e342e' }, // 7:30 PM (dusk brownish-red)
    { time: 21, color: '#1a237e' }, // 9 PM (dark blue night)
    { time: 24, color: '#0d0b1d' }, // Midnight again
  ];

  function timeFraction(date) {
    const d = new Date(date);
    return d.getHours() + d.getMinutes() / 60;
  }

  const startTime = timeFraction(startTimestamp);
  const endTime = timeFraction(endTimestamp);

  // Normalize end if it's before start (e.g. 10 PM to 2 AM)
  const adjustedEnd = endTime < startTime ? endTime + 24 : endTime;

  // Filter relevant gradient stops
  const relevantStops = gradientStops
    .filter((stop) => stop.time >= startTime && stop.time <= adjustedEnd)
    .map((stop) => ({
      ...stop,
      pos: ((stop.time - startTime) / (adjustedEnd - startTime)) * 100,
    }));

  // Add start and end interpolated colors if not exactly on stop
  relevantStops.unshift({
    time: startTime,
    color: interpolateColorAt(startTime, gradientStops),
    pos: 0,
  });
  relevantStops.push({
    time: adjustedEnd,
    color: interpolateColorAt(adjustedEnd % 24, gradientStops),
    pos: 100,
  });

  // Create gradient string
  const gradientString = relevantStops
    .map((stop) => `${stop.color} ${stop.pos.toFixed(2)}%`)
    .join(', ');

  return `linear-gradient(to right, ${gradientString})`;
}

function interpolateColorAt(hour, stops) {
  let i = 0;
  while (i < stops.length - 1 && stops[i + 1].time < hour) i++;

  const prev = stops[i];
  const next = stops[i + 1];

  const t = (hour - prev.time) / (next.time - prev.time);

  return interpolateHex(prev.color, next.color, t);
}

function interpolateHex(color1, color2, t) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);

  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex) {
  const parsed = hex.replace('#', '');
  const bigint = parseInt(parsed, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

export function getBaseTimestamp(argDate) {
  const date = argDate ?? new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return Date.parse(date);
}

export function getAdjustedMinTimestamp(minTimestamp, delay = 30 * 60 * 1000) {
  const minDate = new Date(minTimestamp);
  if (minDate.getHours() === 0 && minDate.getMinutes() < 30) {
    minDate.setHours(0);
    minDate.setMinutes(0);
    minDate.setSeconds(0);
    return Date.parse(minDate);
  } else {
    const thirtyMinutesEarly = minTimestamp - delay;
    return thirtyMinutesEarly;
  }
}

export function getAdjustedMaxTimestamp(maxTimestamp, delay = 30 * 60 * 1000) {
  const maxDate = new Date(maxTimestamp);
  if (maxDate.getHours() === 23 && maxDate.getMinutes() > 30) {
    maxDate.setHours(23);
    maxDate.setMinutes(59);
    maxDate.setSeconds(59);
    return Date.parse(maxDate);
  } else {
    const thirtyMinutesDelay = maxTimestamp + delay;
    return thirtyMinutesDelay;
  }
}

export function getTimeProgress({
  currentTimestamp,
  lowerTimestamp,
  upperTimestamp,
}) {
  return (
    ((currentTimestamp ?? Date.now()) -
      (lowerTimestamp ?? getBaseTimestamp())) /
    (upperTimestamp - lowerTimestamp ?? 24 * 60 * 60 * 1000)
  );
}

export function groupEpisodesByProximity(episodes, threshold = 60) {
  if (episodes.length < 1) {
    return [];
  }
  // Sort episodes by airingAt value
  episodes.sort((a, b) => a.airingAt - b.airingAt);
  const groupedEpisodes = [];
  let currentGroup = [episodes[0]];
  for (let i = 1; i < episodes.length; i++) {
    const currentEpisode = episodes[i];
    const lastEpisodeInGroup = currentGroup[currentGroup.length - 1];
    // Check if the current episode's airingAt value is within the threshold
    if (currentEpisode.airingAt - lastEpisodeInGroup.airingAt <= threshold) {
      currentGroup.push(currentEpisode);
    } else {
      groupedEpisodes.push({
        id: crypto.randomUUID(),
        timestamp: getAverageTimestamp(currentGroup),
        episodes: currentGroup,
      });
      currentGroup = [currentEpisode];
    }
  }
  // Add the last group
  if (currentGroup.length > 0) {
    groupedEpisodes.push({
      id: crypto.randomUUID(),
      timestamp: getAverageTimestamp(currentGroup),
      episodes: currentGroup,
    });
  }
  return groupedEpisodes;
}

function getAverageTimestamp(episodes) {
  const sum = episodes.reduce((acc, episode) => acc + episode.airingAt, 0);
  return Math.floor(sum / episodes.length);
}
