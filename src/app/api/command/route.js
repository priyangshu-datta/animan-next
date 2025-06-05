import db from '@/db';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondError } from '@/lib/server/responses';
import { snakeKeysToCamelKeys } from '@/utils/general';
import { validateAccessToken } from '@/utils/token-utils';
import Joi from 'joi';

import { getFullCharacterInfoById } from './get/character/info/full-by-id';

import { getMediaRelatedCharacters } from './get/media/related/characters';
import { getBasicMediaInfoById } from './get/media/info/basic/by-id';
import { getBasicMediaInfoByIds } from './get/media/info/basic/by-ids';
import { getFullMediaInfoById } from './get/media/info/full-by-id';

import { getCharacterReviewById } from './get/character/review/by-id';
import { getCharacterReviewsPaginated } from './get/character/review/paginated';
import { getMediaReviewById } from './get/media/review/by-id';
import { getMedia$subjectType$ReviewsPaginated } from './get/media/review/paginated';

import { patchCharacterReview } from './patch/character/review';
import { patchMediaReview } from './patch/media/review';

import { postCharacterReview } from './post/character/review';
import { postMediaReview } from './post/media/review';
import { deleteMediaReviewByIds } from './delete/media/review';
import { deleteCharacterReviewByIds } from './delete/character/review';
import { toggleMediaFavourite } from './patch/media/toggle-favourite';
import { toggleCharacterFavourite } from './patch/character/toggle-favourite';
import { getUserMediaDetailsById } from './get/user/media/by-id';
import { patchUserMediaProgress } from './patch/user/media/progress';
import { getCharacterRelatedMedia } from './get/character/related/media';
import { patchUserMedia } from './patch/user/media';
import { getUserCustomLists } from './get/user/media/custom-lists';
import { getUserMediaList } from './get/user/media/list';
import { getUserInfo } from './get/user/info';
import { patchUserInfo } from './patch/user/info';
import { checkUsername } from './get/user/check-username';
import { getMediaGenreCollection } from './get/media/genre-collection';
import { getMediaTagCollection } from './get/media/tag-collection';
import { getSearchResults } from './get/search-results';
import { deleteUserMedia } from './delete/user/media';
import { getAnimeSchedule } from './get/media/schedule';
import { getMedia$subjectType$ReviewsByUserPaginated } from './get/media/review/by-user-paginated';
import { getCharacterReviewsByUserPaginated } from './get/character/review/by-user-paginated';

const schema = Joi.object({
  action: Joi.string(),
  context: Joi.object(),
  metadata: Joi.object(),
});

// provider:action:entity:info:arguments
const COMMANDS = {
  'anilist:get:media:full-details:{mediaId,mediaType}': getFullMediaInfoById,
  'anilist:get:media:basic-details:{mediaId,mediaType}': getBasicMediaInfoById,
  'anilist:get:media:basic-details:{mediaIds,mediaType}':
    getBasicMediaInfoByIds,

  'anilist:get:character:full-details:{characterId}': getFullCharacterInfoById,

  'anilist:get:media:characters-paginated:{mediaId,mediaType,page,perPage}':
    getMediaRelatedCharacters,

  'anilist:get:media:[subjectType]:reviews-paginated:{mediaId,mediaType,subjectType,cursor,limit}':
    getMedia$subjectType$ReviewsPaginated,

  'anilist:get:character:reviews-paginated:{characterId,cursor,limit}':
    getCharacterReviewsPaginated,
  'anilist:get:character:review:{reviewId}': getCharacterReviewById,
  'anilist:get:media:review:{reviewId,mediaType}': getMediaReviewById,

  'anilist:post:character:review:{reviewData}': postCharacterReview,
  'anilist:patch:character:review:{reviewData}': patchCharacterReview,

  'anilist:post:media:review:{reviewData}': postMediaReview,
  'anilist:patch:media:review:{reviewData}': patchMediaReview,

  'anilist:delete:media:review:{reviewIds,mediaType}': deleteMediaReviewByIds,
  'anilist:delete:character:review:{reviewIds}': deleteCharacterReviewByIds,

  'anilist:patch:media:toggle-favourite:{mediaId,mediaType}':
    toggleMediaFavourite,
  'anilist:patch:character:toggle-favourite:{characterId}':
    toggleCharacterFavourite,

  'anilist:get:user:media:{mediaId,mediaType}': getUserMediaDetailsById,
  'anilist:get:user:media:custom-lists:{mediaType}': getUserCustomLists,
  'anilist:get:user:list-paginated:{mediaType,mediaListStatus}':
    getUserMediaList,
  'anilist:patch:user:media-progress:{mediaId,mediaType,progress}':
    patchUserMediaProgress,
  'anilist:patch:user:media:{mediaId,patchData}': patchUserMedia,

  'anilist:delete:user:media:{mediaListEntryId}': deleteUserMedia,

  'anilist:get:character:media-paginated:{characterId,mediaType,page,perPage}':
    getCharacterRelatedMedia,

  'anilist:get:user:custom-lists:{mediaType}': getUserCustomLists,

  'anilist:get:user:info': getUserInfo,
  'anilist:patch:user:info:{userInfo}': patchUserInfo,

  'anilist:get:user:check-username:{username}': checkUsername,
  'anilist:get:media:genre-collection': getMediaGenreCollection,
  'anilist:get:media:tag-collection': getMediaTagCollection,

  'anilist:get:search:results:{searchOptions}': getSearchResults,

  'anilist:get:anime:schedule': getAnimeSchedule,
  'anilist:get:media:[subjectType]:reviews-paginated:{mediaType,subjectType,cursor,limit}':
    getMedia$subjectType$ReviewsByUserPaginated,
  'anilist:get:character:reviews-paginated:{cursor,limit}':
    getCharacterReviewsByUserPaginated,
};

export async function POST(request) {
  try {
    const body = await request.json();

    const { error, value } = schema.validate(body);
    if (error) {
      throw new AppError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: error.message,
        details: error.message,
        status: 400,
        stack: error.stack,
      });
    }

    const { action, context, metadata } = value;

    const {
      animanUserId,
      provider: providerName,
      accessToken: providerAccessToken,
      providerUserId,
      ...providerAccount
    } = await getProviderDetails(metadata);

    if (providerName && action) {
      console.log(`${providerName}:${action}`, context);
      return await COMMANDS[`${providerName}:${action}`](context, {
        providerAccessToken,
        providerName,
        animanUserId,
        providerUserId,
        ...providerAccount,
        ...metadata,
      });
    }

    throw new AppError({
      code: ERROR_CODES.BAD_REQUEST,
      message: 'Invalid action parameter',
      details: { providerName, action },
      status: 400,
    });
  } catch (error) {
    return respondError(error);
  }
}

async function getProviderDetails(metadata) {
  const metaSchema = Joi.object({
    accessToken: Joi.string(),
  });

  const { error: metaError, value: metaValue } = metaSchema.validate(metadata, {
    stripUnknown: true,
  });
  if (metaError) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Invalid `accessToken` was provided',
      details: metaError,
    });
  }

  const accessTokenValidity = await validateAccessToken(metaValue.accessToken);

  if (!accessTokenValidity?.valid) {
    throw new AppError({
      code: ERROR_CODES.ACCESS_TOKEN_EXPIRED,
      message: 'Invalid or tampered `access_token`',
      details: accessTokenValidity.error,
      status: 401,
    });
  }

  let tokenPayload = accessTokenValidity.payload.payload;

  const animanUserId = tokenPayload.sub;

  let userOauthAccount = await db('oauth_accounts')
    .where('user_id', animanUserId)
    .first();

  if (!userOauthAccount) {
    throw new AppError({
      code: ERROR_CODES.NO_PROVIDER_FOUND,
      message: 'No provider found, this is unexpected.',
      status: 401,
    });
  }

  userOauthAccount = snakeKeysToCamelKeys(userOauthAccount);

  return { animanUserId, ...userOauthAccount };
}
