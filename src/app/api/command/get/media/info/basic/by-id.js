import { ANILIST_GRAPHQL_ENDPOINT } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';
import Joi from 'joi';

export async function getBasicMediaInfoById(
  context,
  { providerAccessToken: anilistAccessToken }
) {
  const contextSchema = Joi.object({
    mediaId: Joi.alternatives().try(Joi.string().regex(/\d+/), Joi.number()),
    mediaType: Joi.string().valid('ANIME', 'MANGA'),
  });

  const { error, value } = contextSchema.validate(context);
  if (error) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: error.message,
      details: error.details,
      status: 400,
      stack: error.stack,
    });
  }

  const BASIC_MEDIA_QUERY = `query($mediaId: Int!, $mediaType: MediaType) {
  Media(id: $mediaId, type: $mediaType) {
    id
    type
    title {
      userPreferred
    }
    coverImage {
      extraLarge
    }
  }
}`;

  const { mediaId, mediaType } = value;

  const response = await axios.post(
    ANILIST_GRAPHQL_ENDPOINT,
    {
      query: BASIC_MEDIA_QUERY,
      variables: {
        mediaId: parseInt(mediaId),
        mediaType,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${anilistAccessToken}`,
      },
    }
  );

  return respondSuccess(response.data.data.Media);
}
