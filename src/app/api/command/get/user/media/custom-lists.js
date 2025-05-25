import { ANILIST_GRAPHQL_ENDPOINT, MEDIA_TYPES } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';
import Joi from 'joi';

const USER_CUSTOM_LIST_QUERY = (_strings, mediaTypeExp) => {
  return `query {
	Viewer {
		mediaListOptions {
			${mediaTypeExp}List {
				customLists
			}
		}
	}
}`;
};

export async function getUserCustomLists(
  context,
  { providerAccessToken: anilistAccessToken }
) {
  const contextSchema = Joi.object({
    mediaType: Joi.string()
      .valid(...MEDIA_TYPES.map((t) => t.toLowerCase()))
      .lowercase(),
  });

  const { value, error } = contextSchema.validate(context);
  if (error) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      ...error,
      status: 400,
    });
  }

  const { mediaType } = value;

  const response = await axios.post(
    ANILIST_GRAPHQL_ENDPOINT,
    {
      query: USER_CUSTOM_LIST_QUERY`${mediaType}`,
      variables: { mediaType },
    },
    {
      headers: { Authorization: `Bearer ${anilistAccessToken}` },
    }
  );

  return respondSuccess(
    response.data.data.Viewer.mediaListOptions[`${mediaType}List`]
  );
}
