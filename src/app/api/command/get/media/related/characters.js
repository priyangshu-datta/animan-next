import { ANILIST_GRAPHQL_ENDPOINT } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';
import Joi from 'joi';

export async function getMediaRelatedCharacters(context) {
  const contextSchema = Joi.object({
    mediaId: Joi.number(),
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

  const MEDIA_CHARACTERS_QUERY = `query ($mediaId: Int, $mediaType: MediaType, $page: Int, $perPage: Int) {
  Media(id: $mediaId, type: $mediaType) {
    characters(page: $page, perPage: $perPage, sort: [RELEVANCE,ROLE,FAVOURITES_DESC,ID]) {
      pageInfo {
        currentPage
        hasNextPage
      }
      edges {
        id
        role
				voiceActorRoles {
					roleNotes
					dubGroup
					voiceActor {
						id
						name {
							userPreferred
						}
						language: languageV2
						image {
							large
						}
						description(asHtml: true)
						isFavourite
					}
				}
        node {
          id
          name {
            full
            alternative
            alternativeSpoiler
            native
            userPreferred
          }
          image {
            large
          }
          isFavourite
        }
      }
    }
  }
}`;

  const { mediaId, mediaType, page, perPage } = value;

  const response = await axios.post(ANILIST_GRAPHQL_ENDPOINT, {
    query: MEDIA_CHARACTERS_QUERY,
    variables: {
      mediaId: mediaId,
      mediaType: mediaType,
      page: page,
      perPage: perPage,
    },
  });

  const baseData = response.data.data.Media.characters;

  const data = baseData.edges.map((edge) => {
    return {
      id: edge.id,
      character: { ...edge.node, role: edge.role },
      voiceActors: edge.voiceActorRoles?.map(({ voiceActor, ...rest }) => ({
        ...voiceActor,
        ...rest,
      })),
    };
  });
  const meta = baseData.pageInfo;

  return respondSuccess(data, null, 200, meta);
}
