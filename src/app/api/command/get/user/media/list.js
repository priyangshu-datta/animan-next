import {
  ANILIST_GRAPHQL_ENDPOINT,
  MEDIA_ENTRY_STATUS,
  MEDIA_TYPES,
} from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';
import Joi from 'joi';

export async function getUserMediaList(
  context,
  { providerAccessToken: anilistAccessToken, providerUserId: anilistUserId }
) {
  const contextSchema = Joi.object({
    mediaEntryStatus: Joi.string()
      .valid(...MEDIA_ENTRY_STATUS.anime.map((a) => a.value))
      .required(),
    mediaType: Joi.string()
      .valid(...MEDIA_TYPES)
      .required(),
    page: Joi.number().min(1),
    perPage: Joi.number().min(1).max(25),
  });

  const { value, error } = contextSchema.validate(context);

  if (error) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      ...error,
      status: 400,
    });
  }

  const { mediaEntryStatus, mediaType, page, perPage } = value;

  const QUERY = `query ($userId: Int!, $type: MediaType = ANIME, $entryStatus: MediaListStatus = CURRENT, $page: Int = 1, $perPage: Int = 10) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      currentPage
      hasNextPage
    }
    mediaList(
      status: $entryStatus
      userId: $userId
      type: $type
      sort: [UPDATED_TIME_DESC]
    ) {
      id
      status
      progress
      score
      media {
        id
        type
        title {
          userPreferred
        }
        status
        coverImage {
          extraLarge
        }
        episodes
        chapters
        season
        seasonYear
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
      }
    }
  }
}`;

  const response = await axios.post(
    ANILIST_GRAPHQL_ENDPOINT,
    {
      query: QUERY,
      variables: {
        entryStatus: mediaEntryStatus,
        type: mediaType,
        userId: anilistUserId,
        page,
        perPage,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${anilistAccessToken}`,
      },
    }
  );

  const baseData = response.data.data.Page;
  const data = baseData.mediaList.map((entry) => ({
    ...entry,
    media: {
      ...entry.media,
      ...(entry.media.nextAiringEpisode && {
        nextAiringEpisode: {
          ...entry.media.nextAiringEpisode,
          airingAt: entry.media.nextAiringEpisode.airingAt * 1000,
        },
      }),
    },
  }));

  const meta = baseData.pageInfo;

  return respondSuccess(
    data.map((d) => {
      const { media, ...entry } = d;
      return { media, entry };
    }),
    null,
    undefined,
    meta
  );
}
