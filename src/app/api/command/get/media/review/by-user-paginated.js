import db from '@/db';
import { ANILIST_GRAPHQL_ENDPOINT } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import { snakeKeysToCamelKeys } from '@/utils/general';
import axios from 'axios';
import Joi from 'joi';

export async function getMediaReviewsByUserPaginatedBySubjectType(
  context,
  metadata
) {
  const contextSchema = Joi.object({
    mediaType: Joi.string().valid('anime', 'manga').lowercase(),
    subjectType: Joi.alternatives().conditional('mediaType', [
      {
        is: 'anime',
        then: Joi.string().valid('all', 'episode', 'anime'),
      },
      {
        is: 'manga',
        then: Joi.string().valid('all', 'chapter', 'volume', 'manga'),
      },
    ]),
  });
  const { error: contextError, value: contextValue } = contextSchema.validate(
    context,
    { stripUnknown: true }
  );
  if (contextError) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      status: 400,
      message: contextError.message,
      details: contextError.details,
      stack: contextError.stack,
    });
  }

  const metaSchema = Joi.object({
    animanUserId: Joi.string().required(),
    cursor: Joi.date().iso(),
    limit: Joi.number().default(10),
    providerAccessToken: Joi.string(),
  });
  const { error: metaError, value: metaValue } = metaSchema.validate(metadata, {
    stripUnknown: true,
  });
  if (metaError) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      status: 400,
      message: metaError.message,
      details: metaError.details,
      stack: metaError.stack,
    });
  }

  const { mediaType, subjectType } = contextValue;
  const {
    animanUserId,
    cursor,
    limit,
    providerAccessToken: anilistAccessToken,
  } = metaValue;

  const query = db(`${mediaType}_reviews`)
    .where('user_id', animanUserId)
    .orderBy('updated_at', 'desc');

  if (subjectType !== 'all') {
    query.where('subject_type', subjectType);
  }

  const cursorValue = cursor ? new Date(decodeURIComponent(cursor)) : undefined;

  if (cursorValue) {
    query.where('updated_at', '<', cursorValue);
  }

  let reviews = await query.limit(limit);

  reviews = reviews.map((review) => snakeKeysToCamelKeys(review));

  let nextCursor = null;

  if (reviews.length === limit) {
    const lastReview = reviews.at(-1);

    const nextItemQuery = db(`${mediaType}_reviews`)
      .where('user_id', animanUserId)
      .where('updated_at', '<', lastReview.updatedAt)
      .orderBy('updated_at', 'desc')
      .first();

    if (subjectType !== 'all') {
      nextItemQuery.where('subject_type', subjectType);
    }

    const nextItem = await nextItemQuery;

    if (nextItem) {
      nextCursor = snakeKeysToCamelKeys(lastReview).updatedAt || null;
    }
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

  const response = await axios.post(
    ANILIST_GRAPHQL_ENDPOINT,
    {
      query: BASIC_MEDIAS_QUERY,
      variables: {
        mediaIds: reviews.map((review) =>
          mediaType === 'anime' ? review.animeId : review.mangaId
        ),
        mediaType: mediaType.toUpperCase(),
      },
    },
    {
      headers: {
        Authorization: `Bearer ${anilistAccessToken}`,
      },
    }
  );

  const assocMedia = response.data.data.Page.media;

  const mergedResult = reviews.map((review) => {
    return {
      review,
      assocMedia: assocMedia.find(
        (m) => m.id === parseInt(review[`${mediaType}Id`])
      ),
    };
  });

  return respondSuccess({ reviews: mergedResult }, null, 200, {
    nextCursor,
  });
}
