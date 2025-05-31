import {
  ANILIST_GRAPHQL_ENDPOINT,
  MEDIA_LIST_STATUS,
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
    mediaListStatus: Joi.string()
      .valid(...MEDIA_LIST_STATUS.anime.map((a) => a.value))
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

  const { mediaListStatus, mediaType, page, perPage } = value;

  const QUERY = `query ($userId: Int!, $type: MediaType = ANIME, $listStatus: MediaListStatus = CURRENT, $page: Int = 1, $perPage: Int = 10) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      currentPage
      hasNextPage
    }
    mediaList(
      status: $listStatus
      userId: $userId
      type: $type
      sort: [UPDATED_TIME_DESC]
    ) {
      id
      status
      progress
      media {
        id
        type
        startDate {
          year
          month
          day
        }
        title {
          userPreferred
        }
        status
        coverImage {
          large
        }
        episodes
        nextAiringEpisode {
          airingAt
          episode
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
        listStatus: mediaListStatus,
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
  const data = baseData.mediaList;
  const meta = baseData.pageInfo;

  return respondSuccess(data, null, undefined, meta);
}
