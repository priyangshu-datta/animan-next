import { ANILIST_GRAPHQL_ENDPOINT } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';
import Joi from 'joi';

export async function getMediaRelatedCharacters(context) {
  const contextSchema = Joi.object({
    mediaId: Joi.number(),
    mediaType: Joi.string().valid('ANIME', 'MANGA'),
    page: Joi.number(),
    perPage: Joi.number(),
  });

  const { error: contextError, value: contextValue } =
    contextSchema.validate(context);
  if (contextError) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: contextError.message,
      details: contextError.details,
      stack: contextError.stack,
      status: 400,
    });
  }

  const MEDIA_CHARACTERS_QUERY = `query ($mediaId: Int, $mediaType: MediaType, $page: Int, $perPage: Int) {
  Media(id: $mediaId, type: $mediaType) {
    characters(page: $page, perPage: $perPage, sort: [FAVOURITES_DESC,ROLE,RELEVANCE,ID]) {
      pageInfo {
        currentPage
        hasNextPage
      }
      edges {
        role
        node {
          id
          name {
            userPreferred
          }
          image {
            large
          }
        }
      }
    }
  }
}`;

  const response = await axios.post(ANILIST_GRAPHQL_ENDPOINT, {
    query: MEDIA_CHARACTERS_QUERY,
    variables: {
      mediaId: contextValue.mediaId,
      mediaType: contextValue.mediaType,
      page: contextValue.page,
      perPage: contextValue.perPage,
    },
  });

  const baseData = response.data.data.Media.characters;

  const data = baseData.edges;
  const meta = baseData.pageInfo;

  return respondSuccess(data, null, 200, meta);
}
