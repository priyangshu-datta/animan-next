import { useInfiniteQuery } from '@tanstack/react-query';
import { graphqlRequest } from '../../../api-clients/graphql-client';

const QUERY = `query($characterId: Int, $page: Int, $perPage: Int, $type: MediaType) {
	Character(id: $characterId) {
		media(page: $page, perPage: $perPage, sort:[POPULARITY_DESC,SCORE_DESC], type: $type) {
			pageInfo{
				currentPage
				hasNextPage
			}
			edges {
				characterRole
			}
			nodes {
				id
        type
				coverImage {
					extraLarge
				}
				title {
					userPreferred
          native
          romaji
          english
				}
        description(asHtml: true)
			}
		}
	}
}

`;

/**
 * A custom hook to fetch and manage infinite scrolling of character data for a given media ID.
 *
 * @param {number} characterId - The ID of the media for which characters are fetched.
 * @param {"ANIME" | "MANGA"} mediaType
 * @returns {import('@tanstack/react-query').UseInfiniteQueryResult} - The result of the useInfiniteQuery hook, including data and pagination info.
 */
export function useCharacterMedia(characterId, mediaType) {
  return useInfiniteQuery({
    queryKey: ['characterMedia', characterId, mediaType],
    queryFn: async ({ pageParam }) => {
      const response = await graphqlRequest({
        query: QUERY,
        variables: {
          characterId,
          page: pageParam,
          perPage: 10,
          type: mediaType,
        },
      });

      return {
        media: response.data.Character.media.edges.map((edge, index) => ({
          ...edge,
          ...response.data.Character.media.nodes[index],
        })),
        currentPage: response.data.Character.media.pageInfo.currentPage,
        hasNextPage: response.data.Character.media.pageInfo.hasNextPage,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined,
    enabled: !!characterId,
  });
}
