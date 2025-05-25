import { ANILIST_GRAPHQL_ENDPOINT } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import axios, { AxiosError } from 'axios';
import Joi from 'joi';

const TOGGLE_FAVOURITE_QUERY = (_, entityType) => {
  return `mutation ToggleFavourite($entityId: Int) {
  ToggleFavourite(${entityType}Id: $entityId) {
    ${entityType} {
      nodes {
        id
      }
    }
  }
}`;
};

export async function toggleMediaFavourite(
  context,
  { providerAccessToken: anilistAccessToken }
) {
  const contextSchema = Joi.object({
    mediaType: Joi.string().valid('anime', 'manga').lowercase().required(),
    mediaId: Joi.number().required(),
  });

  const { error, value } = contextSchema.validate(context);
  if (error) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: error.message,
      details: error.details,
      stack: error.stack,
      status: 400,
    });
  }

  const { mediaId, mediaType } = value;

  const response = await axios.post(
    ANILIST_GRAPHQL_ENDPOINT,
    {
      query: TOGGLE_FAVOURITE_QUERY`${mediaType}`,
      variables: { entityId: mediaId },
    },
    {
      headers: {
        Authorization: `Bearer ${anilistAccessToken}`,
      },
    }
  );

  return respondSuccess(
    response.data.data.ToggleFavourite[mediaType].nodes.find(
      (node) => node.id === mediaId
    )
  );
}
