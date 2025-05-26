import { ANILIST_GRAPHQL_ENDPOINT } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';
import Joi from 'joi';

export async function getCharacterRelatedMedia(context) {
  const contextSchema = Joi.object({
    characterId: Joi.number(),
    mediaType: Joi.string().valid('ANIME', 'MANGA').uppercase(),
    page: Joi.number(),
    perPage: Joi.number(),
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

  const CHARACTER_MEDIA_QUERY = `query($characterId: Int, $page: Int, $perPage: Int, $mediaType: MediaType) {
	Character(id: $characterId) {
		media(page: $page, perPage: $perPage, sort:[POPULARITY_DESC,SCORE_DESC], type: $mediaType) {
			pageInfo {
				currentPage
				hasNextPage
			}
			edges {
				characterRole
			}
			nodes {
				id
        type
				coverImage {
					extraLarge
				}
				title {
					userPreferred
          native
          romaji
          english
				}
        description(asHtml: true)
			}
		}
	}
}`;

  const { characterId, mediaType, page, perPage } = value;

  const response = await axios.post(ANILIST_GRAPHQL_ENDPOINT, {
    query: CHARACTER_MEDIA_QUERY,
    variables: {
      characterId,
      mediaType,
      page,
      perPage,
    },
  });

  const baseData = response.data.data.Character.media;

  const data = baseData.edges.map((edge, index) => {
    return {
      ...edge,
      ...baseData.nodes[index],
    };
  });
  const meta = baseData.pageInfo;

  return respondSuccess(data, null, 200, meta);
}
