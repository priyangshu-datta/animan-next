import {
  ANILIST_GRAPHQL_ENDPOINT,
  MEDIA_ENTRY_STATUS,
  MEDIA_TYPES,
} from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';
import Joi from 'joi';

export async function patchUserMedia(
  context,
  { providerAccessToken: anilistAccessToken }
) {
  const CREATE_UPDATE_USER_MEDIA = `mutation SaveMediaListEntry($mediaId: Int, $status: MediaListStatus, $score: Float, $progress: Int, $repeat: Int, $private: Boolean, $hiddenFromStatusLists: Boolean, $notes: String, $customLists: [String], $startedAt: FuzzyDateInput, $completedAt: FuzzyDateInput, $progressVolumes: Int) {
  SaveMediaListEntry(
    mediaId: $mediaId,
    status: $status,
    score: $score,
    progress: $progress,
    repeat: $repeat,
    private: $private,
    hiddenFromStatusLists: $hiddenFromStatusLists,
    notes: $notes,
    customLists: $customLists,
    startedAt: $startedAt,
    completedAt: $completedAt
    progressVolumes: $progressVolumes
  ) {
    id
  }
}`;

  const contextSchema = Joi.object({
    mediaId: Joi.number().required(),
    mediaType: Joi.string()
      .valid(...MEDIA_TYPES)
      .required(),
    status: Joi.string().valid(...MEDIA_ENTRY_STATUS.anime.map((a) => a.value)),
    score: Joi.number(),
    progress: Joi.number(),
    repeat: Joi.number(),
    private: Joi.bool(),
    hiddenFromStatusLists: Joi.bool(),
    notes: Joi.string().allow(''),
    customLists: Joi.array().items(Joi.string()),
    startedAt: Joi.object({
      day: Joi.number(),
      month: Joi.number(),
      year: Joi.number(),
    }),
    completedAt: Joi.object({
      day: Joi.number(),
      month: Joi.number(),
      year: Joi.number(),
    }),
    progressVolumes: Joi.number(),
  });

  const { value, error } = contextSchema.validate(context);

  if (error) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: error.message,
      details: error.details,
      status: 400,
    });
  }

  const { mediaType, ...patchData } = value;

  const response = await axios.post(
    ANILIST_GRAPHQL_ENDPOINT,
    {
      query: CREATE_UPDATE_USER_MEDIA,
      variables: patchData,
    },
    {
      headers: {
        Authorization: `Bearer ${anilistAccessToken}`,
      },
    }
  );

  return respondSuccess(null);
}
