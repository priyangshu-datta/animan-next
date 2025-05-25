import { ANILIST_GRAPHQL_ENDPOINT } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';
import Joi from 'joi';

export async function deleteUserMedia(
  context,
  { providerAccessToken: anilistAccessToken }
) {
  const DELETE_MEDIA_LIST_ENTRY = `mutation DeleteMediaListEntry($mediaListEntryId: Int!) {
	DeleteMediaListEntry(id: $mediaListEntryId) {
		deleted
	}
}`;

  const contextSchema = Joi.object({
    mediaListEntryId: Joi.number().required(),
  });

  const { value, error } = contextSchema.validate(context);

  if (error) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      details: error.details,
      message: error.message,
      stack: error.stack,
      status: 400,
    });
  }

  const { mediaListEntryId } = value;

  const response = await axios.post(
    ANILIST_GRAPHQL_ENDPOINT,
    {
      query: DELETE_MEDIA_LIST_ENTRY,
      variables: { mediaListEntryId },
    },
    {
      headers: {
        Authorization: `Bearer ${anilistAccessToken}`,
      },
    }
  );

  return respondSuccess(response.data.data.DeleteMediaListEntry);
}
