import { ANILIST_GRAPHQL_ENDPOINT } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';
import Joi from 'joi';

export async function getCharacterRelatedMedia(
  context,
  { providerAccessToken: anilistAccessToken }
) {
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

  const CHARACTER_MEDIA_QUERY = `query ($characterId: Int, $page: Int, $perPage: Int, $mediaType: MediaType) {
  Character(id: $characterId) {
    media(
      page: $page
      perPage: $perPage
      sort: [POPULARITY_DESC, SCORE_DESC]
      type: $mediaType
    ) {
      pageInfo {
        currentPage
        hasNextPage
      }
      edges {
        id
        characterRole
        node {
          title {
            userPreferred
          }
          id
          type
          status
          format
          coverImage {
            extraLarge
          }
          entry: mediaListEntry {
            score
            progress
            status
          }
          nextAiringEpisode {
            airingAt
            episode
          }
          episodes
        }
        voiceActorRoles(sort: [RELEVANCE, ID]) {
          voiceActor {
            name {
              userPreferred
            }
            language: languageV2
            image {
              large
            }
            id
            description(asHtml: true)
          }
					roleNotes
					dubGroup
        }
      }
    }
  }
}`;

  const { characterId, mediaType, page, perPage } = value;

  const response = await axios.post(
    ANILIST_GRAPHQL_ENDPOINT,
    {
      query: CHARACTER_MEDIA_QUERY,
      variables: {
        characterId,
        mediaType,
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

  const baseData = response.data.data.Character.media;

  const data = baseData.edges.map((edge) => {
    const {
      id,
      characterRole,
      node: { entry, ...media },
      voiceActorRoles,
    } = edge;

    return {
      id,
      voiceActors: voiceActorRoles.map(({voiceActor, ...rest})=> ({...voiceActor, ...rest})),
      media: {
        ...media,
        ...(media?.nextAiringEpisode && {
          nextAiringEpisode: {
            ...media?.nextAiringEpisode,
            airingAt: media.nextAiringEpisode.airingAt * 1000,
          },
        }),
      },
      entry,
      characterRole,
    };
  });
  const meta = baseData.pageInfo;

  return respondSuccess(data, null, 200, meta);
}
