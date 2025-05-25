export const MS_IN_SECOND = 1000;
export const MS_IN_MINUTE = 60 * MS_IN_SECOND;
export const MS_IN_15_MINUTES = 15 * MS_IN_MINUTE;
export const MS_IN_HOUR = 60 * MS_IN_MINUTE;
export const MS_IN_DAY = 24 * MS_IN_HOUR;
export const MS_IN_WEEK = 7 * MS_IN_DAY;
export const MS_IN_YEAR = 365 * MS_IN_DAY; // 1 year (non-leap)
export const MS_IN_MONTH = 30.44 * MS_IN_DAY; // Average month length

export const SNACK_DURATION = 5 * MS_IN_SECOND;

export const ANILIST_GRAPHQL_ENDPOINT = 'https://graphql.anilist.co';

export const EMOTIONS = [
  { label: 'Happy', value: 'happy' },
  { label: 'Sad', value: 'sad' },
  { label: 'Excited', value: 'excited' },
  { label: 'Confused', value: 'confused' },
  { label: 'Angry', value: 'angry' },
  { label: 'Anxious', value: 'anxious' },
  { label: 'Relieved', value: 'relieved' },
  { label: 'Inspired', value: 'inspired' },
  { label: 'Disappointed', value: 'disappointed' },
  { label: 'Hopeful', value: 'hopeful' },
  { label: 'Shocked', value: 'shocked' },
  { label: 'Nervous', value: 'nervous' },
];

export const REVIEW_CATEGORIES = {
  anime: [
    { label: 'Episode', value: 'episode' },
    { label: 'Anime', value: 'anime' },
  ],
  manga: [
    { label: 'Chapter', value: 'chapter' },
    { label: 'Volume', value: 'volume' },
    { label: 'Manga', value: 'manga' },
  ],
};

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MEDIA_TYPES = ['ANIME', 'MANGA'];
export const MEDIA_STATUS = {
  anime: [
    {
      label: 'Finished',
      value: 'FINISHED',
    },
    {
      label: 'Releasing',
      value: 'RELEASING',
    },
    {
      label: 'Yet to Release',
      value: 'NOT_YET_RELEASED',
    },
    {
      label: 'Cancelled',
      value: 'CANCELLED',
    },
    {
      label: 'Hiatus',
      value: 'HIATUS',
    },
  ],
  manga: [
    {
      label: 'Finished',
      value: 'FINISHED',
    },
    {
      label: 'Publishing',
      value: 'RELEASING',
    },
    {
      label: 'Yet to Publish',
      value: 'NOT_YET_RELEASED',
    },
    {
      label: 'Cancelled',
      value: 'CANCELLED',
    },
    {
      label: 'Hiatus',
      value: 'HIATUS',
    },
  ],
};
export const MEDIA_LIST_STATUS = {
  anime: [
    {
      label: 'Watching',
      value: 'CURRENT',
    },
    {
      label: 'Planning',
      value: 'PLANNING',
    },
    {
      label: 'Completed',
      value: 'COMPLETED',
    },
    {
      label: 'Dropped',
      value: 'DROPPED',
    },
    {
      label: 'Paused',
      value: 'PAUSED',
    },
    {
      label: 'Re-watching',
      value: 'REPEATING',
    },
  ],
  manga: [
    {
      label: 'Reading',
      value: 'CURRENT',
    },
    {
      label: 'Planning',
      value: 'PLANNING',
    },
    {
      label: 'Completed',
      value: 'COMPLETED',
    },
    {
      label: 'Dropped',
      value: 'DROPPED',
    },
    {
      label: 'Paused',
      value: 'PAUSED',
    },
    {
      label: 'Re-reading',
      value: 'REPEATING',
    },
  ],
};
export const CHARACTER_ROLES = ['MAIN', 'SUPPORTING', 'BACKGROUND'];
export const MEDIA_SEASONS = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];

export const COUNTRY_OF_ORIGIN = [
  { label: 'Japan', value: 'JP' },
  { label: 'South Korea', value: 'KR' },
  { label: 'China', value: 'CN' },
  { label: 'Taiwan', value: 'TW' },
];
export const MEDIA_FORMAT = {
  anime: [
    {
      label: 'TV Show',
      value: 'TV',
    },
    {
      label: 'TV Short',
      value: 'TV_SHORT',
    },
    {
      label: 'Movie',
      value: 'MOVIE',
    },
    {
      label: 'Special',
      value: 'SPECIAL',
    },
    {
      label: 'OVA',
      value: 'OVA',
    },
    {
      label: 'ONA',
      value: 'ONA',
    },
    {
      label: 'Music',
      value: 'MUSIC',
    },
  ],
  manga: [
    {
      label: 'Manga',
      value: 'MANGA',
    },
    {
      label: 'Novel',
      value: 'NOVEL',
    },
    {
      label: 'One Shot',
      value: 'ONE_SHOT',
    },
  ],
};
export const MEDIA_SOURCE = [
  'ORIGINAL',
  'MANGA',
  'LIGHT_NOVEL',
  'VISUAL_NOVEL',
  'VIDEO_GAME',
  'OTHER',
  'NOVEL',
  'DOUJINSHI',
  'ANIME',
  'WEB_NOVEL',
  'LIVE_ACTION',
  'GAME',
  'COMIC',
  'MULTIMEDIA_PROJECT',
  'PICTURE_BOOK',
];
export const MEDIA_SORT = [
  { label: 'ID (Ascending)', value: 'ID' },
  { label: 'ID (Descending)', value: 'ID_DESC' },

  { label: 'Romaji Title (Ascending)', value: 'TITLE_ROMAJI' },
  { label: 'Romaji Title (Descending)', value: 'TITLE_ROMAJI_DESC' },

  { label: 'English Title (Ascending)', value: 'TITLE_ENGLISH' },
  { label: 'English Title (Descending)', value: 'TITLE_ENGLISH_DESC' },

  { label: 'Native Title (Ascending)', value: 'TITLE_NATIVE' },
  { label: 'Native Title (Descending)', value: 'TITLE_NATIVE_DESC' },

  { label: 'Type (Ascending)', value: 'TYPE' },
  { label: 'Type (Descending)', value: 'TYPE_DESC' },

  { label: 'Format (Ascending)', value: 'FORMAT' },
  { label: 'Format (Descending)', value: 'FORMAT_DESC' },

  { label: 'Start Date (Ascending)', value: 'START_DATE' },
  { label: 'Start Date (Descending)', value: 'START_DATE_DESC' },

  { label: 'End Date (Ascending)', value: 'END_DATE' },
  { label: 'End Date (Descending)', value: 'END_DATE_DESC' },

  { label: 'Score (Ascending)', value: 'SCORE' },
  { label: 'Score (Descending)', value: 'SCORE_DESC' },

  { label: 'Popularity (Ascending)', value: 'POPULARITY' },
  { label: 'Popularity (Descending)', value: 'POPULARITY_DESC' },

  { label: 'Trending (Ascending)', value: 'TRENDING' },
  { label: 'Trending (Descending)', value: 'TRENDING_DESC' },

  { label: 'Number of Episodes (Ascending)', value: 'EPISODES' },
  { label: 'Number of Episodes (Descending)', value: 'EPISODES_DESC' },

  { label: 'Duration (Ascending)', value: 'DURATION' },
  { label: 'Duration (Descending)', value: 'DURATION_DESC' },

  { label: 'Status (Ascending)', value: 'STATUS' },
  { label: 'Status (Descending)', value: 'STATUS_DESC' },

  { label: 'Number of Chapters (Ascending)', value: 'CHAPTERS' },
  { label: 'Number of Chapters (Descending)', value: 'CHAPTERS_DESC' },

  { label: 'Number of Volumes (Ascending)', value: 'VOLUMES' },
  { label: 'Number of Volumes (Descending)', value: 'VOLUMES_DESC' },

  { label: 'Last Updated At (Ascending)', value: 'UPDATED_AT' },
  { label: 'Last Updated At (Descending)', value: 'UPDATED_AT_DESC' },

  { label: 'Favourites (Ascending)', value: 'FAVOURITES' },
  { label: 'Favourites (Descending)', value: 'FAVOURITES_DESC' },

  { label: 'Search Match', value: 'SEARCH_MATCH' },
];
