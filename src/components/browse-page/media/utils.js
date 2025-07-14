import {
  COUNTRY_OF_ORIGIN,
  MEDIA_FORMAT,
  MEDIA_SEASONS,
  MEDIA_SORT,
  MEDIA_SOURCE,
  MEDIA_STATUS,
  MEDIA_TYPES,
} from '@/lib/constants';

export function setSearchOptionOnSubmit(data) {
  const {
    mediaFormat,
    mediaFormatInclusion,

    mediaTagCategory,
    mediaTagCategoryInclusion,

    mediaTag,
    mediaTagInclusion,

    mediaStatus,
    mediaStatusInclusion,

    genres,
    genresInclusion,

    startDateComparator,
    startDate,

    endDateComparator,
    endDate,

    seasonYear,

    checkboxes,

    onList,

    countryOfOrigin,

    ...restData
  } = data;

  const searchOptions = Object.fromEntries([
    ...Object.entries({
      ...restData,
      ...(countryOfOrigin !== 'all' && { countryOfOrigin }),
      ...{ seasonYear: seasonYear?.getFullYear() },
      ...(mediaFormatInclusion
        ? { mediaFormatIn: mediaFormat }
        : { mediaFormatNotIn: mediaFormat }),
      ...(mediaTagCategoryInclusion
        ? { mediaTagCategoryIn: mediaTagCategory }
        : { mediaTagCategoryNotIn: mediaTagCategory }),
      ...(mediaTagInclusion
        ? { mediaTagIn: mediaTag }
        : { mediaTagNotIn: mediaTag }),
      ...(mediaStatusInclusion
        ? { mediaStatusIn: mediaStatus }
        : { mediaStatusNotIn: mediaStatus }),
      ...(genresInclusion ? { genresIn: genres } : { genresNotIn: genres }),
      ...(startDateComparator === 'is'
        ? { startDate: getFuzzyDate(startDate) }
        : {
            ...(startDateComparator === 'before' && {
              startDateLesser: getFuzzyDate(startDate),
            }),
            ...(startDateComparator === 'after' && {
              startDateGreater: getFuzzyDate(startDate),
            }),
          }),
      ...(endDateComparator === 'is'
        ? { endDate: getFuzzyDate(endDate) }
        : {
            ...(endDateComparator === 'before' && {
              endDateLesser: getFuzzyDate(endDate),
            }),
            ...(endDateComparator === 'after' && {
              endDateGreater: getFuzzyDate(endDate),
            }),
          }),
      ...(onList === 'inList'
        ? { onList: true }
        : onList === 'notInList'
        ? { onList: false }
        : {}),
    }).filter(
      ([_, value]) =>
        value !== '' &&
        value !== 0 &&
        value !== null &&
        value !== undefined &&
        !Number.isNaN(value) &&
        (Array.isArray(value) ? value.length > 0 : true)
    ),
    ...checkboxes.map((b) => [b, true]),
  ]);

  return searchOptions;
}

export function getFuzzyDate(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    // console.error('Invalid input: Please provide a valid Date object.');
    return null;
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return {
    year,
    month,
    day,
  };
}

export function formControlValuesToSearchParams(formValues) {
  const {
    mediaFormat,
    mediaFormatInclusion,
    mediaTagCategory,
    mediaTagCategoryInclusion,
    mediaTag,
    mediaTagInclusion,
    mediaStatus,
    mediaStatusInclusion,
    genres,
    genresInclusion,
    startDateComparator,
    startDate,
    endDateComparator,
    endDate,
    checkboxes,
    onList,
    seasonYear,
    countryOfOrigin,
    ...restData
  } = formValues;
  const searchOptions = Object.fromEntries([
    ...Object.entries({
      ...restData,
      ...(countryOfOrigin !== 'all' && { countryOfOrigin }),
      ...{ seasonYear: seasonYear?.getFullYear() },
      ...(mediaFormatInclusion
        ? { mediaFormatIn: mediaFormat }
        : { mediaFormatNotIn: mediaFormat }),
      ...(mediaTagCategoryInclusion
        ? { mediaTagCategoryIn: mediaTagCategory }
        : { mediaTagCategoryNotIn: mediaTagCategory }),
      ...(mediaTagInclusion
        ? { mediaTagIn: mediaTag }
        : { mediaTagNotIn: mediaTag }),
      ...(mediaStatusInclusion
        ? { mediaStatusIn: mediaStatus }
        : { mediaStatusNotIn: mediaStatus }),
      ...(genresInclusion ? { genresIn: genres } : { genresNotIn: genres }),
      ...(startDate
        ? startDateComparator === 'is'
          ? { startDate: Object.values(getFuzzyDate(startDate))?.join('-') }
          : {
              ...(startDateComparator === 'before' && {
                startDateLesser: Object.values(getFuzzyDate(startDate))?.join(
                  '-'
                ),
              }),
              ...(startDateComparator === 'after' && {
                startDateGreater: Object.values(getFuzzyDate(startDate))?.join(
                  '-'
                ),
              }),
            }
        : {}),
      ...(endDate
        ? endDateComparator === 'is'
          ? { endDate: Object.values(getFuzzyDate(endDate))?.join('-') }
          : {
              ...(endDateComparator === 'before' && {
                endDateLesser: Object.values(getFuzzyDate(endDate))?.join('-'),
              }),
              ...(endDateComparator === 'after' && {
                endDateGreater: Object.values(getFuzzyDate(endDate))?.join('-'),
              }),
            }
        : {}),
    }).filter(
      ([_, value]) =>
        value !== '' &&
        value !== 0 &&
        value !== null &&
        value !== undefined &&
        !Number.isNaN(value) &&
        (Array.isArray(value) ? value.length > 0 : true)
    ),
    ...checkboxes.map((b) => [b, '']),
    ...(onList === 'inList'
      ? [['inList', '']]
      : onList === 'notInList'
      ? [['notInList', '']]
      : [[]]
    ).filter(([_, v]) => v !== undefined),
  ]);
  return searchOptions;
}

export function searchParamsToFormControlValues(
  searchParams,
  tags,
  tagCategories,
  genres
) {
  const {
    mediaType,
    query,
    countryOfOrigin,
    mediaSource,
    mediaSort,
    popularityLesser,
    popularityGreater,
    scoreLesser,
    scoreGreater,
    mediaTagIn,
    mediaTagNotIn,
    mediaTagCategoryIn,
    mediaTagCategoryNotIn,
    genresIn,
    genresNotIn,
    season,
    seasonYear,
    mediaFormatIn,
    mediaFormatNotIn,
    mediaStatusIn,
    mediaStatusNotIn,
    episodesLesser,
    episodesGreater,
    durationLesser,
    durationGreater,
    chaptersLesser,
    chaptersGreater,
    volumesLesser,
    volumesGreater,
    startDate,
    startDateLesser,
    startDateGreater,
    endDate,
    endDateLesser,
    endDateGreater,
    isAdult,
    isLicensed,
    inList,
    notInList,
  } = Object.fromEntries(searchParams.entries());

  const formValues = {};

  if (mediaType && MEDIA_TYPES.includes(mediaType.toUpperCase())) {
    formValues['mediaType'] = mediaType.toUpperCase();
  }

  if (query) {
    formValues['query'] = query;
  }

  if (
    countryOfOrigin &&
    COUNTRY_OF_ORIGIN.map((coo) => coo.value).includes(
      countryOfOrigin.toUpperCase()
    )
  ) {
    formValues['countryOfOrigin'] = countryOfOrigin.toUpperCase();
  }

  if (
    mediaSource &&
    mediaSource
      .split(',')
      .every((msUrl) => MEDIA_SOURCE.includes(msUrl.trim().toUpperCase()))
  ) {
    formValues['mediaSource'] = mediaSource
      .split(',')
      .map((msUrl) => msUrl.trim().toUpperCase());
  }

  if (
    mediaSort &&
    mediaSort
      .split(',')
      .every((msUrl) =>
        MEDIA_SORT.map((ms) => ms.value).includes(msUrl.trim().toUpperCase())
      )
  ) {
    formValues['mediaSort'] = mediaSort
      .split(',')
      .map((msUrl) => msUrl.trim().toUpperCase());
  }

  if (
    mediaFormatIn &&
    mediaFormatIn
      .split(',')
      .every((mfUrl) =>
        MEDIA_FORMAT[formValues['mediaType'].toLowerCase() ?? 'anime']
          .map((mf) => mf.value)
          .includes(mfUrl.trim().toUpperCase())
      )
  ) {
    formValues['mediaFormatInclusion'] = true;
    formValues['mediaFormat'] = mediaFormatIn
      .split(',')
      .map((mfUrl) => mfUrl.trim().toUpperCase());
  }

  if (
    mediaFormatNotIn &&
    mediaFormatNotIn
      .split(',')
      .every((mfUrl) =>
        MEDIA_FORMAT[formValues['mediaType'].toLowerCase() ?? 'anime']
          .map((mf) => mf.value)
          .includes(mfUrl.trim().toUpperCase())
      )
  ) {
    formValues['mediaFormatInclusion'] = false;
    formValues['mediaFormat'] = mediaFormatNotIn
      .split(',')
      .map((mfUrl) => mfUrl.trim().toUpperCase());
  }

  if (
    mediaStatusIn &&
    mediaStatusIn
      .split(',')
      .every((mstUrl) =>
        MEDIA_STATUS[formValues['mediaType'].toLowerCase() ?? 'anime']
          .map((mst) => mst.value)
          .includes(mstUrl.trim().toUpperCase())
      )
  ) {
    formValues['mediaStatusInclusion'] = true;
    formValues['mediaStatus'] = mediaStatusIn
      .split(',')
      .map((mstUrl) => mstUrl.trim().toUpperCase());
  }

  if (
    mediaStatusNotIn &&
    mediaStatusNotIn
      .split(',')
      .every((mstUrl) =>
        MEDIA_STATUS[formValues['mediaType'].toLowerCase() ?? 'anime']
          .map((mst) => mst.value)
          .includes(mstUrl.trim().toUpperCase())
      )
  ) {
    formValues['mediaStatusInclusion'] = false;
    formValues['mediaStatus'] = mediaStatusNotIn
      .split(',')
      .map((mstUrl) => mstUrl.trim().toUpperCase());
  }

  if (popularityLesser) {
    formValues['popularityLesser'] = popularityLesser;
  }

  if (popularityGreater) {
    formValues['popularityGreater'] = popularityGreater;
  }

  if (scoreLesser) {
    formValues['scoreLesser'] = scoreLesser;
  }

  if (scoreGreater) {
    formValues['scoreGreater'] = scoreGreater;
  }

  if (episodesLesser) {
    formValues['episodesLesser'] = episodesLesser;
  }

  if (episodesGreater) {
    formValues['episodesGreater'] = episodesGreater;
  }

  if (durationLesser) {
    formValues['durationLesser'] = durationLesser;
  }

  if (durationGreater) {
    formValues['durationGreater'] = durationGreater;
  }

  if (chaptersLesser) {
    formValues['chaptersLesser'] = chaptersLesser;
  }

  if (chaptersGreater) {
    formValues['chaptersGreater'] = chaptersGreater;
  }

  if (volumesLesser) {
    formValues['volumesLesser'] = volumesLesser;
  }

  if (volumesGreater) {
    formValues['volumesGreater'] = volumesGreater;
  }

  if (season && MEDIA_SEASONS.includes(season.toUpperCase())) {
    formValues['season'] = season.toUpperCase();
  }

  if (seasonYear && !!seasonYear.match(/\d{4}/)) {
    formValues['seasonYear'] = new Date(Date.parse(seasonYear));
  }

  if (
    tags &&
    mediaTagIn &&
    mediaTagIn
      .split(',')
      .map((tagUrl) =>
        tags
          .map((tag) => tag.name.toUpperCase())
          .includes(tagUrl.trim().toUpperCase())
      )
  ) {
    // if needed change all of them to sentenceCase, both here and inMediaTagSelector
    formValues['mediaTagInclusion'] = true;
    formValues['mediaTag'] = mediaTagIn
      .split(',')
      .map((tagUrl) => tagUrl.trim());
  }

  if (
    tags &&
    mediaTagNotIn &&
    mediaTagNotIn
      .split(',')
      .map((tagUrl) =>
        tags
          .map((tag) => tag.name.toUpperCase())
          .includes(tagUrl.trim().toUpperCase())
      )
  ) {
    // if needed change all of them to sentenceCase, both here and inMediaTagSelector
    formValues['mediaTagInclusion'] = false;
    formValues['mediaTag'] = mediaTagNotIn
      .split(',')
      .map((tagUrl) => tagUrl.trim());
  }

  if (
    tagCategories &&
    mediaTagCategoryIn &&
    mediaTagCategoryIn
      .split(',')
      .map((tagCatUrl) =>
        tagCategories
          .map((tagCat) => tagCat.toUpperCase())
          .includes(tagCatUrl.trim().toUpperCase())
      )
  ) {
    // if needed change all of them to sentenceCase, both here and inMediaTagSelector
    formValues['mediaTagCategoryInclusion'] = true;
    formValues['mediaTagCategory'] = mediaTagCategoryIn
      .split(',')
      .map((tagCatUrl) => tagCatUrl.trim());
  }

  if (
    tagCategories &&
    mediaTagCategoryNotIn &&
    mediaTagCategoryNotIn
      .split(',')
      .map((tagCatUrl) =>
        tagCategories
          .map((tagCat) => tagCat.toUpperCase())
          .includes(tagCatUrl.trim().toUpperCase())
      )
  ) {
    // if needed change all of them to sentenceCase, both here and inMediaTagSelector
    formValues['mediaTagCategoryInclusion'] = false;
    formValues['mediaTagCategory'] = mediaTagCategoryNotIn
      .split(',')
      .map((tagCatUrl) => tagCatUrl.trim());
  }

  if (
    genres &&
    genresIn &&
    genresIn
      .split(',')
      .map((genreUrl) =>
        genres
          .map((genre) => genre.toUpperCase())
          .includes(genreUrl.trim().toUpperCase())
      )
  ) {
    // if needed change all of them to sentenceCase, both here and inMediaTagSelector
    formValues['genresInclusion'] = true;
    formValues['genres'] = genresIn
      .split(',')
      .map((genreUrl) => genreUrl.trim());
  }

  if (
    genres &&
    genresNotIn &&
    genresNotIn
      .split(',')
      .map((genreUrl) =>
        genres
          .map((genre) => genre.toUpperCase())
          .includes(genreUrl.trim().toUpperCase())
      )
  ) {
    // if needed change all of them to sentenceCase, both here and inMediaTagSelector
    formValues['genresInclusion'] = false;
    formValues['genres'] = genresNotIn
      .split(',')
      .map((genreUrl) => genreUrl.trim());
  }

  if (startDate && Date.parse(startDate)) {
    formValues['startDateComparator'] = 'is';
    formValues['startDate'] = new Date(Date.parse(startDate));
  }

  if (startDateLesser && Date.parse(startDateLesser)) {
    formValues['startDateComparator'] = 'before';
    formValues['startDate'] = new Date(Date.parse(startDateLesser));
  }

  if (startDateGreater && Date.parse(startDateGreater)) {
    formValues['startDateComparator'] = 'after';
    formValues['startDate'] = new Date(Date.parse(startDateGreater));
  }

  if (endDate && Date.parse(endDate)) {
    formValues['endDateComparator'] = 'is';
    formValues['endDate'] = new Date(Date.parse(endDate));
  }

  if (endDateLesser && Date.parse(endDateLesser)) {
    formValues['endDateComparator'] = 'before';
    formValues['endDate'] = new Date(Date.parse(endDateLesser));
  }

  if (endDateGreater && Date.parse(endDateGreater)) {
    formValues['endDateComparator'] = 'after';
    formValues['endDate'] = new Date(Date.parse(endDateGreater));
  }

  formValues['checkboxes'] = [];

  if (isAdult?.length === 0 || isAdult === 'true') {
    formValues['checkboxes'].push('isAdult');
  }
  if (isLicensed?.length === 0 || isLicensed === 'true') {
    formValues['checkboxes'].push('isLicensed');
  }

  if (searchParams.has('inList')) {
    formValues['onList'] = 'inList';
  }
  if (searchParams.has('notInList')) {
    formValues['onList'] = 'notInList';
  }
  return formValues;
}
