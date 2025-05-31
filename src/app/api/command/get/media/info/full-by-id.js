import { ANILIST_GRAPHQL_ENDPOINT } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';
import Joi from 'joi';

export async function getFullMediaInfoById(
  context,
  { providerAccessToken: anilistAccessToken }
) {
  const contextSchema = Joi.object({
    mediaId: Joi.alternatives().try(Joi.string().regex(/\d+/), Joi.number()),
    mediaType: Joi.string().valid('ANIME', 'MANGA'),
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

  const FULL_MEDIA_QUERY = `query($id: Int!, $type: MediaType) {
  Media(id: $id, type: $type) {
    id
    idMal
    episodes
    type
    format
    episodes
    chapters
    volumes
    status
    season
    seasonYear
    isFavourite
    nextAiringEpisode {
      episode
      airingAt
    }
    title {
      userPreferred
    }
    listEntry: mediaListEntry {
      progress
      progressVolumes
      id
      score
      status
      notes
    }
    coverImage {
      extraLarge
    }
    meanScore
    genres
    tags {
			id
			name
			description
			isMediaSpoiler
		}
    description(asHtml: true)
    startDate {
      day
      month
      year
    }
  }
}`;

  const { mediaId, mediaType } = contextValue;

  const response = await axios.post(
    ANILIST_GRAPHQL_ENDPOINT,
    {
      query: FULL_MEDIA_QUERY,
      variables: {
        id: parseInt(mediaId),
        type: mediaType,
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
