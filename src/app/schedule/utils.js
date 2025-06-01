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

// Helper function to calculate the average of an array of numbers
function calculateAverage(arr) {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((a, b) => a + b, 0);
  return sum / arr.length;
}

// Helper function to get the average timestamp for a group of shows
// (Assuming shows have an 'airingAt' property)
function getAverageTimestamp(shows) {
  if (shows.length === 0) return 0;
  const sum = shows.reduce((acc, show) => acc + show.airingAt, 0);
  return sum / shows.length;
}

// Polyfill for crypto.randomUUID if not available in the environment
// (e.g., older Node.js versions or non-browser environments without polyfills)
if (typeof crypto === 'undefined' || !crypto.randomUUID) {
  globalThis.crypto = {
    randomUUID: () =>
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15),
  };
}

/**
 * Groups shows based on proximity of airing times, maximum group duration,
 * and near-equidistant timestamps.
 *
 * @param {Array<Object>} shows - An array of show objects, each with an 'airingAt' property (timestamp).
 * @param {number} [threshold=60] - Max time difference between consecutive shows within a group.
 * @param {number} [maxGroupDuration=2 * 60 * 60] - Max total time span (first to last show) for a group.
 * @param {number} [equidistanceTolerance=0] - Max allowed deviation for a new consecutive show's time difference
 * from the average of previous consecutive differences within the same group.
 * A value of 0 means strict equidistance.
 * @returns {Array<Object>} An array of grouped shows, each group containing an id, timestampMark, shows array, and timeRange.
 */
export function groupShowsByProximity(
  shows,
  threshold = 60, // Renamed from proximityThreshold to 'threshold' as per your provided code
  maxGroupDuration = 2 * 60 * 60, // Default as per your provided code (2 hours)
  equidistanceTolerance = 20 * 60 // New parameter for equidistant check
) {
  if (shows.length < 1) {
    return [];
  }

  // 1. Sort shows by airingAt value to ensure chronological processing
  shows.sort((a, b) => a.airingAt - b.airingAt);

  const groupedShows = [];
  let currentGroup = [shows[0]];
  // To track differences between consecutive shows *within* the current group
  let currentGroupIntervals = [];

  // 2. Iterate through shows starting from the second one
  for (let i = 1; i < shows.length; i++) {
    const currentShow = shows[i];
    const lastShowInGroup = currentGroup[currentGroup.length - 1];
    const firstShowInGroup = currentGroup[0];

    // Calculate time differences relative to the current potential group
    const diffFromLastInCurrentGroup =
      currentShow.airingAt - lastShowInGroup.airingAt;
    const potentialTotalGroupDuration =
      currentShow.airingAt - firstShowInGroup.airingAt;

    let shouldSplit = false; // Flag to determine if a new group should be started

    // --- Check for split conditions in order of priority ---

    // Condition 1: Proximity Threshold Violation
    // If the gap between the current show and the last in the group is too large
    if (diffFromLastInCurrentGroup > threshold) {
      shouldSplit = true;
    }

    // Condition 2: Maximum Group Duration Violation
    // If adding the current show would make the group's total duration too long
    if (!shouldSplit && potentialTotalGroupDuration > maxGroupDuration) {
      shouldSplit = true;
    }

    // Condition 3: Equidistance Violation
    // Only check if there's more than one show already in the current group
    // to establish an average interval.
    if (!shouldSplit && currentGroup.length > 1) {
      // Calculate the average interval of existing shows in the current group
      const averageExistingInterval = calculateAverage(currentGroupIntervals);

      // Check if the new difference significantly deviates from the established average
      if (
        Math.abs(diffFromLastInCurrentGroup - averageExistingInterval) >
        equidistanceTolerance
      ) {
        shouldSplit = true;
      }
    }

    // --- Act based on whether a split is needed ---
    if (shouldSplit) {
      // Finalize the current group with the new structure
      groupedShows.push({
        id: crypto.randomUUID(),
        timestampMark: getAverageTimestamp(currentGroup),
        shows: currentGroup, // Renamed from 'episodes' to 'shows'
        timeRange: Array.from(
          new Set([
            Math.min(...currentGroup.map((show) => show.airingAt)),
            Math.max(...currentGroup.map((show) => show.airingAt)),
          ])
        ),
      });

      // Start a new group with the current show
      currentGroup = [currentShow];
      currentGroupIntervals = []; // Reset intervals for the new group
    } else {
      // Add the current show to the current group
      currentGroup.push(currentShow);
      // Record the interval for future equidistance checks
      currentGroupIntervals.push(diffFromLastInCurrentGroup);
    }
  }

  // 3. Add the last remaining group if it's not empty
  if (currentGroup.length > 0) {
    groupedShows.push({
      id: crypto.randomUUID(),
      timestampMark: getAverageTimestamp(currentGroup),
      shows: currentGroup, // Renamed from 'episodes' to 'shows'
      timeRange: Array.from(
        new Set([
          Math.min(...currentGroup.map((show) => show.airingAt)),
          Math.max(...currentGroup.map((show) => show.airingAt)),
        ])
      ),
    });
  }

  return groupedShows;
}
