import { ANILIST_GRAPHQL_ENDPOINT } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';
import Joi from 'joi';

export async function getUserMediaDetailsById(
  context,
  { providerAccessToken: anilistAccessToken }
) {
  const MEDIA_LIST_ENTRY_QUERY = `query($mediaId: Int!, $mediaType: MediaType) {
    Media(id: $mediaId, type: $mediaType) {
      isFavourite
      entry: mediaListEntry {
        id
        status
        startedAt {
          year
          month
          day
        }
        score
        progress
        progressVolumes
        repeat
        completedAt {
          year
          month
          day
        }
        createdAt
        updatedAt
        hiddenFromStatusLists
        private
        notes
        customLists
      }
    }
  }`;

  const contextSchema = Joi.object({
    mediaId: Joi.number().required(),
    mediaType: Joi.string().valid('ANIME', 'MANGA').required(),
  });

  const { value, error } = contextSchema.validate(context);
  if (error) {
    new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      ...error,
      status: 400,
    });
  }

  const response = await axios.post(
    ANILIST_GRAPHQL_ENDPOINT,
    {
      query: MEDIA_LIST_ENTRY_QUERY,
      variables: { ...value },
    },
    {
      headers: {
        Authorization: `Bearer ${anilistAccessToken}`,
      },
    }
  );

  return respondSuccess({
    ...response.data.data.Media.entry,
    isFavourite: response.data.data.Media.isFavourite,
  });
}
