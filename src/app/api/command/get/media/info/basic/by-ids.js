import { ANILIST_GRAPHQL_ENDPOINT, MEDIA_TYPES } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';
import Joi from 'joi';

export async function getBasicMediaInfoByIds(
  context,
  { providerAccessToken: anilistAccessToken }
) {
  const contextSchema = Joi.object({
    mediaIds: Joi.array().items(Joi.number()),
    mediaType: Joi.string().valid(...MEDIA_TYPES),
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

  const BASIC_MEDIAS_QUERY = `query($mediaIds: [Int], $mediaType: MediaType) {
  Page{
    media(id_in: $mediaIds, type: $mediaType) {
      id
      type
      title {
        userPreferred
      }
      coverImage {
        extraLarge
      }
    }
  }
}`;

  const { mediaIds, mediaType } = value;

  const response = await axios.post(
    ANILIST_GRAPHQL_ENDPOINT,
    {
      query: BASIC_MEDIAS_QUERY,
      variables: {
        mediaIds: mediaIds.map((id) => parseInt(id)),
        mediaType: mediaType,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${anilistAccessToken}`,
      },
    }
  );

  return respondSuccess(response.data.data.Page.media);
}
