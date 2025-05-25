import { ANILIST_GRAPHQL_ENDPOINT } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';
import Joi from 'joi';

export async function getFullCharacterInfoById(
  context,
  { providerAccessToken: anilistAccessToken }
) {
  const contextSchema = Joi.object({
    characterId: Joi.alternatives().try(Joi.string().regex(/\d+/), Joi.number()),
  });

  const { error, value } = contextSchema.validate(context);
  if (error) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: error.message,
      details: error.details,
      status: 400,
      stack: error.stack,
    });
  }

  const FULL_CHARACTER_DETAIL_QUERY = `query($id: Int) {
  Character(id: $id) {
    id
    name {
      full
      first
      middle
      last
      native
      alternative
      alternativeSpoiler
      userPreferred
    }
    image {
      large
    }
    isFavourite
    description(asHtml:true)
    gender
    dateOfBirth {
      year
      month
      day
    }
    age
    bloodType
    isFavourite
  }
}`;

  const { characterId } = value;

  const response = await axios.post(
    ANILIST_GRAPHQL_ENDPOINT,
    {
      query: FULL_CHARACTER_DETAIL_QUERY,
      variables: { id: parseInt(characterId) },
    },
    {
      headers: {
        Authorization: `Bearer ${anilistAccessToken}`,
      },
    }
  );

  return respondSuccess(response.data.data);
}
