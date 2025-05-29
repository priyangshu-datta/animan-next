import { ANILIST_GRAPHQL_ENDPOINT } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';
import Joi from 'joi';

export async function getAnimeSchedule(
  context,
  { providerAccessToken: anilistAccessToken }
) {
  const ANIME_SCHEDULE = `query ($startTimestamp:Int, $endTimestamp: Int) {
  Page {
    airingSchedules(airingAt_greater: $startTimestamp, airingAt_lesser: $endTimestamp, sort: TIME) {
      id
      episode
      airingAt
      media {
        id
        idMal
        title {
          userPreferred
        }
        type
        format
        duration
        episodes
        averageScore
				meanScore
        isAdult
        coverImage {
          extraLarge
        }
        bannerImage
      }
    }
  }
}`;

  const contextSchema = Joi.object({
    startTimestamp: Joi.number(),
    endTimestamp: Joi.number(),
  });
  const { value, error } = contextSchema.validate(context);
  if (error) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: error.message,
      details: error.details,
      stack: error.stack,
      status: 400,
    });
  }

  const { startTimestamp, endTimestamp } = value;

  const response = await axios.post(
    ANILIST_GRAPHQL_ENDPOINT,
    {
      query: ANIME_SCHEDULE,
      variables: { startTimestamp, endTimestamp },
    },
    { headers: { Authorization: `Bearer ${anilistAccessToken}` } }
  );

  return respondSuccess(response.data?.data?.Page?.airingSchedules);
}
