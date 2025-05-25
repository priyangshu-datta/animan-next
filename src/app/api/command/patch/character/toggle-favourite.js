import { ANILIST_GRAPHQL_ENDPOINT } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';
import Joi from 'joi';

const TOGGLE_FAVOURITE_QUERY = `mutation ToggleFavourite($characterId: Int) {
  ToggleFavourite(characterId: $characterId) {
    characters {
      nodes {
        id
      }
    }
  }
}
`;

export async function toggleCharacterFavourite(
  context,
  { providerAccessToken: anilistAccessToken }
) {
  const contextSchema = Joi.object({
    characterId: Joi.number().required(),
  });

  const { error, value } = contextSchema.validate(context);
  if (error) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: error.message,
      details: error.details,
      stack: error.stack,
      status: 400,
    });
  }

  const { characterId } = value;

  const response = await axios.post(
    ANILIST_GRAPHQL_ENDPOINT,
    {
      query: TOGGLE_FAVOURITE_QUERY,
      variables: { characterId: characterId },
    },
    {
      headers: {
        Authorization: `Bearer ${anilistAccessToken}`,
      },
    }
  );

  return respondSuccess(
    response.data.data.ToggleFavourite.characters.nodes.find(
      (node) => node.id === characterId
    )
  );
}
