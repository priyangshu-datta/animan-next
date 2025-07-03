export function setDefaultFormValues(mediaEntry, userCustomLists) {
  const dateArray = [];
  const mediaListEntryData = mediaEntry?.data?.data;

  const startedAt = mediaListEntryData?.startedAt;
  const completedAt = mediaListEntryData?.completedAt;

  if (startedAt?.year && startedAt?.month && startedAt?.day) {
    dateArray.push(
      new Date(startedAt?.year, startedAt?.month - 1, startedAt?.day)
    );
  }

  if (completedAt?.year && completedAt?.month && completedAt?.day) {
    dateArray.push(
      new Date(completedAt?.year, completedAt?.month - 1, completedAt?.day)
    );
  }

  return {
    status: mediaListEntryData?.status ?? 'PLANNING',
    progress: mediaListEntryData?.progress ?? 0,
    favourite: !!mediaListEntryData?.isFavourite,
    score: mediaListEntryData?.score ?? 0,
    startEndDate: dateArray,
    repeat: mediaListEntryData?.repeat ?? 0,
    notes: mediaListEntryData?.notes ?? '',
    vlProgress: mediaListEntryData?.progressVolumes ?? 0,
    customLists: userCustomLists?.data?.data?.customLists
      .filter((key) => mediaListEntryData?.customLists?.[key])
      .sort(),
    options: [
      ...(mediaListEntryData?.hiddenFromStatusLists
        ? ['hiddenFromStatusLists']
        : []),
      ...(mediaListEntryData?.private ? ['private'] : []),
    ].sort(),
  };
}
