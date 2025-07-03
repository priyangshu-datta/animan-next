import { ANILIST_GRAPHQL_ENDPOINT } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';
import Joi from 'joi';

export async function getMediaRelatedMedia(
  context,
  { providerAccessToken: anilistAccessToken }
) {
  const contextSchema = Joi.object({
    mediaId: Joi.number(),
    mediaType: Joi.string().valid('ANIME', 'MANGA').uppercase(),
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

  const MEDIA_MEDIA_QUERY = `query ($mediaId: Int!, $mediaType: MediaType) {
  Media(id: $mediaId, type: $mediaType) {
    relations {
      edges {
        relationType
        node {
          id
          title {
            userPreferred
						english
						native
						romaji
          }
          coverImage {
            extraLarge
          }
          type
          format
					status
					entry: mediaListEntry {
						progress
						score
						status
					}
					meanScore
          episodes
          nextAiringEpisode {
            airingAt
            episode
          }
        }
      }
    }
  }
}`;

  const { mediaId, mediaType } = value;

  const response = await axios.post(
    ANILIST_GRAPHQL_ENDPOINT,
    {
      query: MEDIA_MEDIA_QUERY,
      variables: {
        mediaId,
        mediaType,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${anilistAccessToken}`,
      },
    }
  );

  const baseData = response.data.data.Media.relations;

  const data = baseData.edges.map((edge) => {
    const { entry, ...media } = edge.node;
    return {
      media: {
        ...media,
        relationType: edge.relationType,
        ...(media?.nextAiringEpisode && {
          nextAiringEpisode: {
            ...media?.nextAiringEpisode,
            airingAt: media.nextAiringEpisode.airingAt * 1000,
          },
        }),
      },
      entry,
    };
  });

  return respondSuccess(data, null, 200);
}
