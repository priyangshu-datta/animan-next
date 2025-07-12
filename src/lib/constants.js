import {
  ArrowDown10Icon,
  ArrowDownZAIcon,
  ArrowUp10Icon,
  ArrowUpZAIcon,
} from '@yamada-ui/lucide';
// import { Flex, Text } from '@yamada-ui/react';

const Flex = ({ children }) => children;
const Text = ({ children }) => children;

export const SECOND_IN_MS = 1000;
export const MINUTE_IN_MS = 60 * SECOND_IN_MS;
export const QUARTER_HOUR_IN_MS = 15 * MINUTE_IN_MS;
export const HALF_HOUR_IN_MS = 2 * QUARTER_HOUR_IN_MS;
export const HOUR_IN_MS = 60 * MINUTE_IN_MS;
export const DAY_IN_MS = 24 * HOUR_IN_MS;
export const WEEK_IN_MS = 7 * DAY_IN_MS;
export const YEAR_IN_MS = 365 * DAY_IN_MS; // 1 year (non-leap)
export const MONTH_IN_MS = 30.44 * DAY_IN_MS; // Average month length

export const SNACK_DURATION = 5 * SECOND_IN_MS;

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
export const MEDIA_ENTRY_STATUS = {
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
      label: 'TV show',
      value: 'TV',
    },
    {
      label: 'TV short',
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
  {
    label: (
      <Text>
        ID <ArrowUp10Icon />
      </Text>
    ),
    value: 'ID',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>ID</Text> <ArrowDownZAIcon />
      </Flex>
    ),
    value: 'ID_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Romaji Title</Text> <ArrowUpZAIcon />
      </Flex>
    ),
    value: 'TITLE_ROMAJI',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Romaji Title</Text> <ArrowDownZAIcon />
      </Flex>
    ),
    value: 'TITLE_ROMAJI_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>English Title</Text> <ArrowUpZAIcon />
      </Flex>
    ),
    value: 'TITLE_ENGLISH',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>English Title</Text> <ArrowDownZAIcon />
      </Flex>
    ),
    value: 'TITLE_ENGLISH_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Native Title</Text> <ArrowUpZAIcon />
      </Flex>
    ),
    value: 'TITLE_NATIVE',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Native Title</Text> <ArrowDownZAIcon />
      </Flex>
    ),
    value: 'TITLE_NATIVE_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Type</Text> <ArrowUpZAIcon />
      </Flex>
    ),
    value: 'TYPE',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Type</Text> <ArrowDownZAIcon />
      </Flex>
    ),
    value: 'TYPE_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Format</Text> <ArrowUpZAIcon />
      </Flex>
    ),
    value: 'FORMAT',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Format</Text> <ArrowDownZAIcon />
      </Flex>
    ),
    value: 'FORMAT_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Start Date</Text> <ArrowUp10Icon />
      </Flex>
    ),
    value: 'START_DATE',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Start Date</Text> <ArrowDown10Icon />
      </Flex>
    ),
    value: 'START_DATE_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>End Date</Text> <ArrowUp10Icon />
      </Flex>
    ),
    value: 'END_DATE',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>End Date</Text> <ArrowDown10Icon />
      </Flex>
    ),
    value: 'END_DATE_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Score</Text> <ArrowUp10Icon />
      </Flex>
    ),
    value: 'SCORE',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Score</Text> <ArrowDown10Icon />
      </Flex>
    ),
    value: 'SCORE_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Popularity</Text> <ArrowUp10Icon />
      </Flex>
    ),
    value: 'POPULARITY',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Popularity</Text> <ArrowDown10Icon />
      </Flex>
    ),
    value: 'POPULARITY_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Trending</Text> <ArrowUp10Icon />
      </Flex>
    ),
    value: 'TRENDING',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Trending</Text> <ArrowDown10Icon />
      </Flex>
    ),
    value: 'TRENDING_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Number of Episodes</Text> <ArrowUp10Icon />
      </Flex>
    ),
    value: 'EPISODES',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Number of Episodes</Text> <ArrowDown10Icon />
      </Flex>
    ),
    value: 'EPISODES_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Duration</Text> <ArrowUp10Icon />
      </Flex>
    ),
    value: 'DURATION',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Duration</Text> <ArrowDown10Icon />
      </Flex>
    ),
    value: 'DURATION_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Status</Text> <ArrowUpZAIcon />
      </Flex>
    ),
    value: 'STATUS',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Status</Text> <ArrowDownZAIcon />
      </Flex>
    ),
    value: 'STATUS_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Number of Chapters</Text> <ArrowUp10Icon />
      </Flex>
    ),
    value: 'CHAPTERS',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Number of Chapters</Text> <ArrowDown10Icon />
      </Flex>
    ),
    value: 'CHAPTERS_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Number of Volumes</Text> <ArrowUp10Icon />
      </Flex>
    ),
    value: 'VOLUMES',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Number of Volumes</Text> <ArrowDown10Icon />
      </Flex>
    ),
    value: 'VOLUMES_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Last Updated At</Text> <ArrowUp10Icon />
      </Flex>
    ),
    value: 'UPDATED_AT',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Last Updated At</Text> <ArrowDown10Icon />
      </Flex>
    ),
    value: 'UPDATED_AT_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Favourites</Text> <ArrowUp10Icon />
      </Flex>
    ),
    value: 'FAVOURITES',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Favourites</Text> <ArrowDown10Icon />
      </Flex>
    ),
    value: 'FAVOURITES_DESC',
  },

  { label: 'Search Match', value: 'SEARCH_MATCH' },
];

export const CHARACTER_SORT = [
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Role</Text> <ArrowUpZAIcon />
      </Flex>
    ),
    value: 'ROLE',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Role</Text> <ArrowDownZAIcon />
      </Flex>
    ),
    value: 'ROLE_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Favourites</Text> <ArrowUp10Icon />
      </Flex>
    ),
    value: 'FAVOURITES',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Favourites</Text> <ArrowDown10Icon />
      </Flex>
    ),
    value: 'FAVOURITES_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>ID</Text> <ArrowUp10Icon />
      </Flex>
    ),
    value: 'ID',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>ID</Text> <ArrowDown10Icon />
      </Flex>
    ),
    value: 'ID_DESC',
  },

  { label: 'Search Match', value: 'SEARCH_MATCH' },
];

export const STAFF_SORT = [
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Role</Text> <ArrowUpZAIcon />
      </Flex>
    ),
    value: 'ROLE',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Role</Text> <ArrowDownZAIcon />
      </Flex>
    ),
    value: 'ROLE_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Favourites</Text> <ArrowUp10Icon />
      </Flex>
    ),
    value: 'FAVOURITES',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Favourites</Text> <ArrowDown10Icon />
      </Flex>
    ),
    value: 'FAVOURITES_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Language</Text> <ArrowUpZAIcon />
      </Flex>
    ),
    value: 'LANGUAGE',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Language</Text> <ArrowDownZAIcon />
      </Flex>
    ),
    value: 'LANGUAGE_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>ID</Text> <ArrowUp10Icon />
      </Flex>
    ),
    value: 'ID',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>ID</Text> <ArrowDown10Icon />
      </Flex>
    ),
    value: 'ID_DESC',
  },

  { label: 'Search Match', value: 'SEARCH_MATCH' },
];

export const STUDIO_SORT = [
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Name</Text> <ArrowUpZAIcon />
      </Flex>
    ),
    value: 'NAME',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Name</Text> <ArrowDownZAIcon />
      </Flex>
    ),
    value: 'NAME_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Favourites</Text> <ArrowUp10Icon />
      </Flex>
    ),
    value: 'FAVOURITES',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>Favourites</Text> <ArrowDown10Icon />
      </Flex>
    ),
    value: 'FAVOURITES_DESC',
  },

  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>ID</Text> <ArrowUp10Icon />
      </Flex>
    ),
    value: 'ID',
  },
  {
    label: (
      <Flex alignItems={'center'} gap="2">
        <Text>ID</Text> <ArrowDown10Icon />
      </Flex>
    ),
    value: 'ID_DESC',
  },

  { label: 'Search Match', value: 'SEARCH_MATCH' },
];

export const TIMEZONES = [
  'Africa/Abidjan',
  'Africa/Accra',
  'Africa/Addis_Ababa',
  'Africa/Algiers',
  'Africa/Asmara',
  'Africa/Bamako',
  'Africa/Bangui',
  'Africa/Banjul',
  'Africa/Bissau',
  'Africa/Blantyre',
  'Africa/Brazzaville',
  'Africa/Bujumbura',
  'Africa/Cairo',
  'Africa/Casablanca',
  'Africa/Ceuta',
  'Africa/Conakry',
  'Africa/Dakar',
  'Africa/Dar_es_Salaam',
  'Africa/Djibouti',
  'Africa/Douala',
  'Africa/El_Aaiun',
  'Africa/Freetown',
  'Africa/Gaborone',
  'Africa/Harare',
  'Africa/Johannesburg',
  'Africa/Juba',
  'Africa/Kampala',
  'Africa/Khartoum',
  'Africa/Kigali',
  'Africa/Kinshasa',
  'Africa/Lagos',
  'Africa/Libreville',
  'Africa/Lome',
  'Africa/Luanda',
  'Africa/Lubumbashi',
  'Africa/Lusaka',
  'Africa/Malabo',
  'Africa/Maputo',
  'Africa/Maseru',
  'Africa/Mbabane',
  'Africa/Mogadishu',
  'Africa/Monrovia',
  'Africa/Nairobi',
  'Africa/Ndjamena',
  'Africa/Niamey',
  'Africa/Nouakchott',
  'Africa/Ouagadougou',
  'Africa/Porto-Novo',
  'Africa/Sao_Tome',
  'Africa/Tripoli',
  'Africa/Tunis',
  'Africa/Windhoek',
  'America/Adak',
  'America/Anchorage',
  'America/Anguilla',
  'America/Antigua',
  'America/Araguaina',
  'America/Argentina/Buenos_Aires',
  'America/Argentina/Catamarca',
  'America/Argentina/Cordoba',
  'America/Argentina/Jujuy',
  'America/Argentina/La_Rioja',
  'America/Argentina/Mendoza',
  'America/Argentina/Rio_Gallegos',
  'America/Argentina/Salta',
  'America/Argentina/San_Juan',
  'America/Argentina/San_Luis',
  'America/Argentina/Tucuman',
  'America/Argentina/Ushuaia',
  'America/Aruba',
  'America/Asuncion',
  'America/Atikokan',
  'America/Bahia',
  'America/Bahia_Banderas',
  'America/Barbados',
  'America/Belem',
  'America/Belize',
  'America/Blanc-Sablon',
  'America/Boa_Vista',
  'America/Bogota',
  'America/Boise',
  'America/Cambridge_Bay',
  'America/Campo_Grande',
  'America/Cancun',
  'America/Caracas',
  'America/Cayenne',
  'America/Cayman',
  'America/Chicago',
  'America/Chihuahua',
  'America/Ciudad_Juarez',
  'America/Costa_Rica',
  'America/Coyhaique',
  'America/Creston',
  'America/Cuiaba',
  'America/Curacao',
  'America/Danmarkshavn',
  'America/Dawson',
  'America/Dawson_Creek',
  'America/Denver',
  'America/Detroit',
  'America/Dominica',
  'America/Edmonton',
  'America/Eirunepe',
  'America/El_Salvador',
  'America/Fort_Nelson',
  'America/Fortaleza',
  'America/Glace_Bay',
  'America/Goose_Bay',
  'America/Grand_Turk',
  'America/Grenada',
  'America/Guadeloupe',
  'America/Guatemala',
  'America/Guayaquil',
  'America/Guyana',
  'America/Halifax',
  'America/Havana',
  'America/Hermosillo',
  'America/Indiana/Indianapolis',
  'America/Indiana/Knox',
  'America/Indiana/Marengo',
  'America/Indiana/Petersburg',
  'America/Indiana/Tell_City',
  'America/Indiana/Vevay',
  'America/Indiana/Vincennes',
  'America/Indiana/Winamac',
  'America/Inuvik',
  'America/Iqaluit',
  'America/Jamaica',
  'America/Juneau',
  'America/Kentucky/Louisville',
  'America/Kentucky/Monticello',
  'America/Kralendijk',
  'America/La_Paz',
  'America/Lima',
  'America/Los_Angeles',
  'America/Lower_Princes',
  'America/Maceio',
  'America/Managua',
  'America/Manaus',
  'America/Marigot',
  'America/Martinique',
  'America/Matamoros',
  'America/Mazatlan',
  'America/Menominee',
  'America/Merida',
  'America/Metlakatla',
  'America/Mexico_City',
  'America/Miquelon',
  'America/Moncton',
  'America/Monterrey',
  'America/Montevideo',
  'America/Montserrat',
  'America/Nassau',
  'America/New_York',
  'America/Nome',
  'America/Noronha',
  'America/North_Dakota/Beulah',
  'America/North_Dakota/Center',
  'America/North_Dakota/New_Salem',
  'America/Nuuk',
  'America/Ojinaga',
  'America/Panama',
  'America/Paramaribo',
  'America/Phoenix',
  'America/Port-au-Prince',
  'America/Port_of_Spain',
  'America/Porto_Velho',
  'America/Puerto_Rico',
  'America/Punta_Arenas',
  'America/Rankin_Inlet',
  'America/Recife',
  'America/Regina',
  'America/Resolute',
  'America/Rio_Branco',
  'America/Santarem',
  'America/Santiago',
  'America/Santo_Domingo',
  'America/Sao_Paulo',
  'America/Scoresbysund',
  'America/Sitka',
  'America/St_Barthelemy',
  'America/St_Johns',
  'America/St_Kitts',
  'America/St_Lucia',
  'America/St_Thomas',
  'America/St_Vincent',
  'America/Swift_Current',
  'America/Tegucigalpa',
  'America/Thule',
  'America/Tijuana',
  'America/Toronto',
  'America/Tortola',
  'America/Vancouver',
  'America/Whitehorse',
  'America/Winnipeg',
  'America/Yakutat',
  'Antarctica/Casey',
  'Antarctica/Davis',
  'Antarctica/DumontDUrville',
  'Antarctica/Macquarie',
  'Antarctica/Mawson',
  'Antarctica/McMurdo',
  'Antarctica/Palmer',
  'Antarctica/Rothera',
  'Antarctica/Syowa',
  'Antarctica/Troll',
  'Antarctica/Vostok',
  'Arctic/Longyearbyen',
  'Asia/Aden',
  'Asia/Almaty',
  'Asia/Amman',
  'Asia/Anadyr',
  'Asia/Aqtau',
  'Asia/Aqtobe',
  'Asia/Ashgabat',
  'Asia/Atyrau',
  'Asia/Baghdad',
  'Asia/Bahrain',
  'Asia/Baku',
  'Asia/Bangkok',
  'Asia/Barnaul',
  'Asia/Beirut',
  'Asia/Bishkek',
  'Asia/Brunei',
  'Asia/Chita',
  'Asia/Colombo',
  'Asia/Damascus',
  'Asia/Dhaka',
  'Asia/Dili',
  'Asia/Dubai',
  'Asia/Dushanbe',
  'Asia/Famagusta',
  'Asia/Gaza',
  'Asia/Hebron',
  'Asia/Ho_Chi_Minh',
  'Asia/Hong_Kong',
  'Asia/Hovd',
  'Asia/Irkutsk',
  'Asia/Jakarta',
  'Asia/Jayapura',
  'Asia/Jerusalem',
  'Asia/Kabul',
  'Asia/Kamchatka',
  'Asia/Karachi',
  'Asia/Kathmandu',
  'Asia/Khandyga',
  'Asia/Kolkata',
  'Asia/Krasnoyarsk',
  'Asia/Kuala_Lumpur',
  'Asia/Kuching',
  'Asia/Kuwait',
  'Asia/Macau',
  'Asia/Magadan',
  'Asia/Makassar',
  'Asia/Manila',
  'Asia/Muscat',
  'Asia/Nicosia',
  'Asia/Novokuznetsk',
  'Asia/Novosibirsk',
  'Asia/Omsk',
  'Asia/Oral',
  'Asia/Phnom_Penh',
  'Asia/Pontianak',
  'Asia/Pyongyang',
  'Asia/Qatar',
  'Asia/Qostanay',
  'Asia/Qyzylorda',
  'Asia/Riyadh',
  'Asia/Sakhalin',
  'Asia/Samarkand',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Srednekolymsk',
  'Asia/Taipei',
  'Asia/Tashkent',
  'Asia/Tbilisi',
  'Asia/Tehran',
  'Asia/Thimphu',
  'Asia/Tokyo',
  'Asia/Tomsk',
  'Asia/Ulaanbaatar',
  'Asia/Urumqi',
  'Asia/Ust-Nera',
  'Asia/Vientiane',
  'Asia/Vladivostok',
  'Asia/Yakutsk',
  'Asia/Yangon',
  'Asia/Yekaterinburg',
  'Asia/Yerevan',
  'Atlantic/Azores',
  'Atlantic/Bermuda',
  'Atlantic/Canary',
  'Atlantic/Cape_Verde',
  'Atlantic/Faroe',
  'Atlantic/Madeira',
  'Atlantic/Reykjavik',
  'Atlantic/South_Georgia',
  'Atlantic/St_Helena',
  'Atlantic/Stanley',
  'Australia/Adelaide',
  'Australia/Brisbane',
  'Australia/Broken_Hill',
  'Australia/Darwin',
  'Australia/Eucla',
  'Australia/Hobart',
  'Australia/Lindeman',
  'Australia/Lord_Howe',
  'Australia/Melbourne',
  'Australia/Perth',
  'Australia/Sydney',
  'Etc/GMT+1',
  'Etc/GMT+10',
  'Etc/GMT+11',
  'Etc/GMT+12',
  'Etc/GMT+2',
  'Etc/GMT+3',
  'Etc/GMT+4',
  'Etc/GMT+5',
  'Etc/GMT+6',
  'Etc/GMT+7',
  'Etc/GMT+8',
  'Etc/GMT+9',
  'Etc/GMT-1',
  'Etc/GMT-10',
  'Etc/GMT-11',
  'Etc/GMT-12',
  'Etc/GMT-13',
  'Etc/GMT-14',
  'Etc/GMT-2',
  'Etc/GMT-3',
  'Etc/GMT-4',
  'Etc/GMT-5',
  'Etc/GMT-6',
  'Etc/GMT-7',
  'Etc/GMT-8',
  'Etc/GMT-9',
  'Europe/Amsterdam',
  'Europe/Andorra',
  'Europe/Astrakhan',
  'Europe/Athens',
  'Europe/Belgrade',
  'Europe/Berlin',
  'Europe/Bratislava',
  'Europe/Brussels',
  'Europe/Bucharest',
  'Europe/Budapest',
  'Europe/Busingen',
  'Europe/Chisinau',
  'Europe/Copenhagen',
  'Europe/Dublin',
  'Europe/Gibraltar',
  'Europe/Guernsey',
  'Europe/Helsinki',
  'Europe/Isle_of_Man',
  'Europe/Istanbul',
  'Europe/Jersey',
  'Europe/Kaliningrad',
  'Europe/Kirov',
  'Europe/Kyiv',
  'Europe/Lisbon',
  'Europe/Ljubljana',
  'Europe/London',
  'Europe/Luxembourg',
  'Europe/Madrid',
  'Europe/Malta',
  'Europe/Mariehamn',
  'Europe/Minsk',
  'Europe/Monaco',
  'Europe/Moscow',
  'Europe/Oslo',
  'Europe/Paris',
  'Europe/Podgorica',
  'Europe/Prague',
  'Europe/Riga',
  'Europe/Rome',
  'Europe/Samara',
  'Europe/San_Marino',
  'Europe/Sarajevo',
  'Europe/Saratov',
  'Europe/Simferopol',
  'Europe/Skopje',
  'Europe/Sofia',
  'Europe/Stockholm',
  'Europe/Tallinn',
  'Europe/Tirane',
  'Europe/Ulyanovsk',
  'Europe/Vaduz',
  'Europe/Vatican',
  'Europe/Vienna',
  'Europe/Vilnius',
  'Europe/Volgograd',
  'Europe/Warsaw',
  'Europe/Zagreb',
  'Europe/Zurich',
  'Indian/Antananarivo',
  'Indian/Chagos',
  'Indian/Christmas',
  'Indian/Cocos',
  'Indian/Comoro',
  'Indian/Kerguelen',
  'Indian/Mahe',
  'Indian/Maldives',
  'Indian/Mauritius',
  'Indian/Mayotte',
  'Indian/Reunion',
  'Pacific/Apia',
  'Pacific/Auckland',
  'Pacific/Bougainville',
  'Pacific/Chatham',
  'Pacific/Chuuk',
  'Pacific/Easter',
  'Pacific/Efate',
  'Pacific/Fakaofo',
  'Pacific/Fiji',
  'Pacific/Funafuti',
  'Pacific/Galapagos',
  'Pacific/Gambier',
  'Pacific/Guadalcanal',
  'Pacific/Guam',
  'Pacific/Honolulu',
  'Pacific/Kanton',
  'Pacific/Kiritimati',
  'Pacific/Kosrae',
  'Pacific/Kwajalein',
  'Pacific/Majuro',
  'Pacific/Marquesas',
  'Pacific/Midway',
  'Pacific/Nauru',
  'Pacific/Niue',
  'Pacific/Norfolk',
  'Pacific/Noumea',
  'Pacific/Pago_Pago',
  'Pacific/Palau',
  'Pacific/Pitcairn',
  'Pacific/Pohnpei',
  'Pacific/Port_Moresby',
  'Pacific/Rarotonga',
  'Pacific/Saipan',
  'Pacific/Tahiti',
  'Pacific/Tarawa',
  'Pacific/Tongatapu',
  'Pacific/Wake',
  'Pacific/Wallis',
  'UTC',
];

export const PUBLIC_PATH = ['/', '/login'];
