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
    mediaType: Joi.string().valid('ANIME', 'MANGA').uppercase(),
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
    isAdult
    nextAiringEpisode {
      episode
      airingAt
    }
    title {
      native
      romaji
      english
      userPreferred
    }
    entry: mediaListEntry {
      id
      progress
      progressVolumes
      score
      status
      notes
      createdAt
      updatedAt
      customLists
      startedAt {
        day
        month
        year
      }
      completedAt {
        day
        month
        year
      }
      repeat
      customLists
    }
    coverImage {
      extraLarge
    }
    meanScore
    averageScore
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
    endDate {
      day
      month
      year
    }
    duration
    volumes
    countryOfOrigin
    synonyms
    source
    hashtag
    rankings {
      rank
      type
      format
      year
      season
      allTime
      context
    }
    stats {
      scoreDistribution {
        score
        amount
      }
      statusDistribution {
        status
        amount
      }
    }
    favourites
    externalLinks {
      id
      url
      site
      siteId
      type
      language
      color
      icon
      notes
      isDisabled
    }
    streamingEpisodes {
      title
      thumbnail
      url
      site
    }
    studios {
      edges {
        isMain
        studio: node {
          id
          name
          isAnimationStudio
        }
      }
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

  return respondSuccess({
    ...response.data.data.Media,
    ...(response.data.data.Media.studios && {
      studios: response.data.data.Media.studios.edges.map(
        ({ isMain, studio }) => ({ ...studio, isMain })
      ),
    }),
    ...(response.data.data.Media.entry && {
      entry: {
        ...response.data.data.Media.entry,
        createdAt: response.data.data.Media.entry.createdAt * 1000,
        updatedAt: response.data.data.Media.entry.updatedAt * 1000,
      },
    }),
    ...(response.data.data.Media.nextAiringEpisode && {
      nextAiringEpisode: {
        ...response.data.data.Media.nextAiringEpisode,
        airingAt: response.data.data.Media.nextAiringEpisode.airingAt
          ? response.data.data.Media.nextAiringEpisode.airingAt * 1000
          : response.data.data.Media.nextAiringEpisode?.airingAt,
      },
    }),
  });
}
