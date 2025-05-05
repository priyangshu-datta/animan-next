import { useBaseQuery } from '../base/use-base-query';

const QUERY = `query($characterId: Int) {
	Character(id: $characterId) {
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

/**
 * A custom hook to fetch anime details by character ID.
 *
 * @param {number} characterId - The ID of the character to fetch details for.
 * @returns {import('@tanstack/react-query').UseQueryResult} The result of the query containing anime details.
 */
export function useCharacterById(characterId) {
  return useBaseQuery({
    key: ['character', characterId],
    query: QUERY,
    variables: { characterId },
  });
}
