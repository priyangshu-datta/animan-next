import {
  ANILIST_GRAPHQL_ENDPOINT,
  MEDIA_FORMAT,
  MEDIA_SEASONS,
  MEDIA_SOURCE,
  MEDIA_STATUS,
} from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';
import Joi from 'joi';

export async function getSearchResults(
  context,
  { providerAccessToken: anilistAccessToken, ...metadata }
) {
  const contextSchema = Joi.object({
    mediaType: Joi.string().valid('ANIME', 'MANGA').uppercase(),
    query: Joi.string().min(3),
    countryOfOrigin: Joi.string().length(2),
    mediaSource: Joi.array().items(...MEDIA_SOURCE),
    mediaSort: Joi.array().items(Joi.string()),
    popularityLesser: Joi.number(),
    popularityGreater: Joi.number(),
    scoreLesser: Joi.number(),
    scoreGreater: Joi.number(),

    mediaTagIn: Joi.array().items(Joi.string()),
    mediaTagNotIn: Joi.array().items(Joi.string()),
    mediaTagCategoryIn: Joi.array().items(Joi.string()),
    mediaTagCategoryNotIn: Joi.array().items(Joi.string()),
    genresIn: Joi.array().items(Joi.string()),
    genresNotIn: Joi.array().items(Joi.string()),

    startDate: Joi.object({
      year: Joi.number(),
      month: Joi.number(),
      day: Joi.number(),
    }),
    startDateLesser: Joi.object({
      year: Joi.number(),
      month: Joi.number(),
      day: Joi.number(),
    }),
    startDateGreater: Joi.object({
      year: Joi.number(),
      month: Joi.number(),
      day: Joi.number(),
    }),

    endDate: Joi.object({
      year: Joi.number(),
      month: Joi.number(),
      day: Joi.number(),
    }),
    endDateLesser: Joi.object({
      year: Joi.number(),
      month: Joi.number(),
      day: Joi.number(),
    }),
    endDateGreater: Joi.object({
      year: Joi.number(),
      month: Joi.number(),
      day: Joi.number(),
    }),

    isAdult: Joi.bool().default(false),
    onList: Joi.bool(),
    isLicensed: Joi.bool(),
  })
    .when(Joi.object({ mediaType: 'ANIME' }).unknown(), {
      then: Joi.object({
        season: Joi.string().valid(...MEDIA_SEASONS),
        seasonYear: Joi.string().length(4),
        mediaFormatIn: Joi.array().items(
          ...MEDIA_FORMAT['anime'].map((mf) => mf.value)
        ),
        mediaFormatNotIn: Joi.array().items(
          ...MEDIA_FORMAT['anime'].map((mf) => mf.value)
        ),
        mediaStatusIn: Joi.array().items(
          ...MEDIA_STATUS['anime'].map((mf) => mf.value)
        ),
        mediaStatusNotIn: Joi.array().items(
          ...MEDIA_STATUS['anime'].map((mf) => mf.value)
        ),
        episodesLesser: Joi.number(),
        episodesGreater: Joi.number(),
        durationLesser: Joi.number(),
        durationGreater: Joi.number(),
      }),
    })
    .when(Joi.object({ mediaType: 'MANGA' }).unknown(), {
      then: Joi.object({
        mediaFormatIn: Joi.array().items(
          ...MEDIA_FORMAT['manga'].map((mf) => mf.value)
        ),
        mediaFormatNotIn: Joi.array().items(
          ...MEDIA_FORMAT['manga'].map((mf) => mf.value)
        ),
        mediaStatusIn: Joi.array().items(
          ...MEDIA_STATUS['manga'].map((mf) => mf.value)
        ),
        mediaStatusNotIn: Joi.array().items(
          ...MEDIA_STATUS['manga'].map((mf) => mf.value)
        ),
        chaptersLesser: Joi.number(),
        chaptersGreater: Joi.number(),
        volumesLesser: Joi.number(),
        volumesGreater: Joi.number(),
      }),
    })
    .oxor('startDate', 'startDateGreater')
    .oxor('startDate', 'startDateLesser')
    .oxor('endDate', 'endDateGreater')
    .oxor('endDate', 'endDateLesser')
    .oxor('mediaTagIn', 'mediaTagNotIn')
    .oxor('genresIn', 'genresNotIn')
    .oxor('mediaTagCategoryIn', 'mediaTagCategoryNotIn')
    .oxor('mediaFormatIn', 'mediaFormatNotIn')
    .oxor('mediaStatusIn', 'mediaStatusNotIn');

  const { error: contextError, value: contextValue } = contextSchema.validate(
    context,
    {
      stripUnknown: true,
    }
  );

  if (contextError) {
    new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: contextError.message,
      details: contextError.details,
      stack: contextError.stack,
      status: 400,
    });
  }

  const metadataSchema = Joi.object({
    page: Joi.number(),
    perPage: Joi.number(),
  });

  const { value: metadataValue, error: metadataError } =
    metadataSchema.validate(metadata, { stripUnknown: true });

  if (metadataError) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      details: metadataError.details,
      message: metadataError.message,
      stack: metadataError.stack,
      status: 400,
    });
  }

  const { page, perPage } = metadataValue;

  const SEARCH_QUERY = `query (
  $page: Int = 1,
  $perPage: Int = 10,
	$startDate: FuzzyDateInt
	$endDate: FuzzyDateInt
	$season: MediaSeason
	$seasonYear: Int
	$mediaType: MediaType
	$mediaFormat: MediaFormat
	$mediaStatus: MediaStatus
	$episodes: Int
	$duration: Int
	$chapters: Int
	$volumes: Int
	$isAdult: Boolean
	$minimumTagRank: Int
	$onList: Boolean
	$countryOfOrigin: CountryCode
	$isLicensed: Boolean
	$query: String
	$startDateGreater: FuzzyDateInt
	$startDateLesser: FuzzyDateInt
	$endDateGreater: FuzzyDateInt
	$endDateLesser: FuzzyDateInt
	$mediaFormatIn: [MediaFormat]
	$mediaFormatNotIn: [MediaFormat]
	$mediaStatusIn: [MediaStatus]
	$mediaStatusNotIn: [MediaStatus]
	$episodesGreater: Int
	$episodesLesser: Int
	$durationGreater: Int
	$durationLesser: Int
	$chaptersGreater: Int
	$chaptersLesser: Int
	$volumesGreater: Int
	$volumesLesser: Int
	$genresIn: [String]
	$genresNotIn: [String]
	$mediaTagIn: [String]
	$mediaTagNotIn: [String]
	$mediaTagCategoryIn: [String]
	$mediaTagCategoryNotIn: [String]
	$scoreGreater: Int
	$scoreLesser: Int
	$popularityGreater: Int
	$popularityLesser: Int
	$mediaSource: [MediaSource]
	$mediaSort: [MediaSort]
) {
	Page(page: $page, perPage: $perPage) {
    pageInfo{
			currentPage
			hasNextPage
		}
		media(
			startDate: $startDate
			endDate: $endDate
			season: $season
			seasonYear: $seasonYear
			type: $mediaType
			format: $mediaFormat
			status: $mediaStatus
			episodes: $episodes
			duration: $duration
			chapters: $chapters
			volumes: $volumes
			isAdult: $isAdult
			minimumTagRank: $minimumTagRank
			onList: $onList
			countryOfOrigin: $countryOfOrigin
			isLicensed: $isLicensed
			search: $query
			startDate_greater: $startDateGreater
			startDate_lesser: $startDateLesser
			endDate_greater: $endDateGreater
			endDate_lesser: $endDateLesser
			format_in: $mediaFormatIn
			format_not_in: $mediaFormatNotIn
			status_in: $mediaStatusIn
			status_not_in: $mediaStatusNotIn
			episodes_greater: $episodesGreater
			episodes_lesser: $episodesLesser
			duration_greater: $durationGreater
			duration_lesser: $durationLesser
			chapters_greater: $chaptersGreater
			chapters_lesser: $chaptersLesser
			volumes_greater: $volumesGreater
			volumes_lesser: $volumesLesser
			genre_in: $genresIn
			genre_not_in: $genresNotIn
			tag_in: $mediaTagIn
			tag_not_in: $mediaTagNotIn
			tagCategory_in: $mediaTagCategoryIn
			tagCategory_not_in: $mediaTagCategoryNotIn
			averageScore_greater: $scoreGreater
			averageScore_lesser: $scoreLesser
			popularity_greater: $popularityGreater
			popularity_lesser: $popularityLesser
			source_in: $mediaSource
			sort: $mediaSort
		) {
			id
      type
			title {
				userPreferred
			}
      coverImage {
        extraLarge
      }
      status
      format
      type
      chapters
      episodes
      nextAiringEpisode {
        airingAt
        episode
      }
      startDate {
        day
        month
        year
      }
      endDate {
        day
        month
        year
      }
      entry: mediaListEntry {
        id
				score
				progress
				status
			}
		}
	}
}`;

  const respone = await axios.post(
    ANILIST_GRAPHQL_ENDPOINT,
    {
      query: SEARCH_QUERY,
      variables: { ...contextValue, page, perPage },
    },
    {
      headers: {
        Authorization: `Bearer ${anilistAccessToken}`,
      },
    }
  );

  const baseData = respone.data.data.Page;

  const meta = baseData.pageInfo;
  const data = baseData.media.map(({ entry, ...media }) => ({
    entry,
    media: {
      ...media,
      ...(media.nextAiringEpisode && {
        nextAiringEpisode: {
          ...media.nextAiringEpisode,
          airingAt: media.nextAiringEpisode.airingAt * 1000,
        },
      }),
    },
  }));

  return respondSuccess(data, null, 200, meta);
}
