import { ANILIST_GRAPHQL_ENDPOINT, MEDIA_TYPES } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';
import Joi from 'joi';

export async function patchUserMediaProgress(
  context,
  { providerAccessToken: anilistAccessToken }
) {
  const UPDATE_MEDIA_PROGRESS_QUERY = `mutation UpdateMediaListEntry($mediaId: Int, $progress: Int) {
  SaveMediaListEntry(mediaId: $mediaId, progress: $progress) {
    id
  }
}`;

  const contextSchema = Joi.object({
    mediaId: Joi.number().required(),
    mediaType: Joi.string().valid(...MEDIA_TYPES),
    progress: Joi.number().required(),
  });

  const { value, error } = contextSchema.validate(context);

  if (error) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      ...error,
      status: 400,
    });
  }

  const { mediaId, progress } = value;

  await axios.post(
    ANILIST_GRAPHQL_ENDPOINT,
    {
      query: UPDATE_MEDIA_PROGRESS_QUERY,
      variables: { mediaId, progress },
    },
    {
      headers: {
        Authorization: `Bearer ${anilistAccessToken}`,
      },
    }
  );

  return respondSuccess(null, null, 200);
}
