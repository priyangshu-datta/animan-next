import { useInfiniteQuery } from '@tanstack/react-query';
import { graphqlRequest } from '../../graphql-client';

const QUERY = `query($userId:Int!, $page:Int = 1, $perPage:Int = 10, $type:MediaType = ANIME) {
  	Page (page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
      }
  		mediaList(status: CURRENT, userId: $userId, type: $type) {
        id
  			progress
  			media {
  				id
  				type
  				title {
  					romaji
  				}
  				status
  				coverImage {
  					large
  				}
  				episodes
            nextAiringEpisode {
              airingAt
              episode
  				}
  			}
  		}
  	}
  }
`;

/**
 *
 * @param {"ANIME" | "MANGA"} mediaType
 * @returns {import("@tanstack/react-query").UseQueryResult}
 */
export function useUserCurrentList(mediaType) {
  return useInfiniteQuery({
    queryKey: ['me', 'current', mediaType],
    queryFn: async ({ pageParam }) => {
      const response = await graphqlRequest({
        query: QUERY,
        variables: {
          page: pageParam,
          perPage: 10,
          type: mediaType,
        },
      });

      return {
        mediaList: response.data.Page.mediaList,
        currentPage: response.data.Page.pageInfo.currentPage,
        hasNextPage: response.data.Page.pageInfo.hasNextPage,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined,
    initialPageParam: 1,
  });
}
