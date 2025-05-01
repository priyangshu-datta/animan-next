import { useInfiniteQuery } from '@tanstack/react-query';
import { graphqlRequest } from '../../graphql-client';

const QUERY = `
    query ($mediaId: Int, $page: Int, $perPage: Int) {
      Media(id: $mediaId) {
        characters(page: $page, perPage: $perPage, sort: [FAVOURITES_DESC,ROLE,RELEVANCE,ID]) {
          pageInfo {
            currentPage
            hasNextPage
          }
          nodes{
            id
            name {
              full
              native
              alternative
              alternativeSpoiler
            }
            image {
              large
            }
          }
        }
      }
    }
  `;

/**
 * A custom hook to fetch and manage infinite scrolling of character data for a given media ID.
 *
 * @param {number} mediaId - The ID of the media for which characters are fetched.
 * @returns {import('@tanstack/react-query').UseInfiniteQueryResult} - The result of the useInfiniteQuery hook, including data and pagination info.
 */
export function useInfiniteCharacters(mediaId) {
  return useInfiniteQuery({
    queryKey: ['mediaCharacters', mediaId],
    queryFn: async ({ pageParam }) => {
      const response = await graphqlRequest({
        query: QUERY,
        variables: {
          mediaId,
          page: pageParam,
          perPage: 10,
        },
      });

      return {
        characters: response.data.Media.characters.nodes,
        currentPage: response.data.Media.characters.pageInfo.currentPage,
        hasNextPage: response.data.Media.characters.pageInfo.hasNextPage,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined,
    enabled: !!mediaId,
  });
}
