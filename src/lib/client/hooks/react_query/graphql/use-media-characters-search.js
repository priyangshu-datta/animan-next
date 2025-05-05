/* To implement character search use useMutation instead of useInfiniteQuery, as infinite query handles data with a constraint
that any new data cannot be merged but will be automatically paged, but using mutation, you can set the cache at your will. Also there is no onSuccess on infinite query to set cache at different key.*/

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlRequest } from '../../../api-clients/graphql-client';
import createFuzzySearch from '@nozbe/microfuzz';

const QUERY = `query($mediaId: Int!, $perPage:Int = 10, $page:Int = 1) {
	Media(id: $mediaId) {
		characters(perPage: $perPage, page: $page, sort: [FAVOURITES_DESC,ROLE,RELEVANCE,ID]) {
			pageInfo {
				currentPage
				hasNextPage
			}
			nodes{
				name {
					full
					native
					alternative
					alternativeSpoiler
				}
        image {
					medium
				}
			}
		}
	}
}`;

/**
 *
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export function useMediaCharactersSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mediaId, searchTerm }) => {
      let currentPage = 1;
      const matchedCharacters = [];
      let charactersFetched = [];

      const cached = queryClient.getQueryData(['mediaCharacters', mediaId]);

      if (cached) {
        for (const page of cached.pages) {
          const { characters } = page;

          const fuzzySearch = createFuzzySearch(characters, {
            getText: (character) => [
              character.name.full,
              character.name.native,
              ...character.name.alternative,
              ...character.name.alternativeSpoiler,
            ],
          });

          matchedCharacters.push(...fuzzySearch(searchTerm));
        }

        if (!cached.pages.at(-1).hasNextPage) {
          return {
            matchedCharacters,
            hasNextPage: false,
            charactersFetched: cached.pages.characters,
          };
        }
      }

      let hasNext = true;
      currentPage = Math.floor(cached.pages.at(-1).characters.length / 25);

      while (hasNext) {
        const response = await graphqlRequest({
          query: QUERY,
          variables: { mediaId, page: currentPage, perPage: 25 },
        });

        const hasNextPage = response.data.Media.characters.pageInfo.hasNextPage;
        const results = response.data.Media.characters.nodes;

        charactersFetched = [...charactersFetched, ...results];

        charactersFetched = Array.from(
          new Set(charactersFetched.map((a) => a.id))
        ).map((id) => {
          return charactersFetched.find((a) => a.id === id);
        });

        const fuzzySearch = createFuzzySearch(charactersFetched, {
          getText: (character) => [
            character.name.full,
            character.name.native,
            ...character.name.alternative,
            ...character.name.alternativeSpoiler,
          ],
        });

        matchedCharacters.push(...fuzzySearch(searchTerm));

        if (matchedCharacters.length > 0) {
          return { matchedCharacters, hasNextPage, charactersFetched };
        }

        hasNext = hasNextPage;
        currentPage += 1;
      }

      return { matchedCharacters, hasNextPage: false, charactersFetched };
    },

    onSuccess: ({ charactersFetched, hasNextPage }, { mediaId }) => {
      queryClient.setQueryData(['mediaCharacters', mediaId], {
        pages: [
          {
            characters: [...charactersFetched],
            hasNextPage,
          },
        ],
        pageParams: [1],
      });
    },
  });
}
