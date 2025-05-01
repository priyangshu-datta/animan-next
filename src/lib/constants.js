export const MS_IN_SECOND = 1000;
export const MS_IN_MINUTE = 60 * MS_IN_SECOND;
export const MS_IN_15_MINUTES = 15 * MS_IN_MINUTE;
export const MS_IN_HOUR = 60 * MS_IN_MINUTE;
export const MS_IN_DAY = 24 * MS_IN_HOUR;
export const MS_IN_WEEK = 7 * MS_IN_DAY;
export const MS_IN_YEAR = 365 * MS_IN_DAY; // 1 year (non-leap)
export const MS_IN_MONTH = 30.44 * MS_IN_DAY; // Average month length

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
