import { useInfiniteQuery } from '@tanstack/react-query';
import { graphqlRequest } from '../../../api-clients/graphql-client';

const QUERY = `query (
	$userId: Int!
	$page: Int = 1
	$perPage: Int = 10
	$type: MediaType = ANIME
	$status: MediaListStatus = CURRENT
) {
	Page(page: $page, perPage: $perPage) {
		pageInfo {
			currentPage
			hasNextPage
		}
		mediaList(
			status: $status
			userId: $userId
			type: $type
			sort: [UPDATED_TIME_DESC]
		) {
			id
			progress
			media {
				id
				type
				startDate {
					year
					month
					day
				}
				title {
					userPreferred
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
}`;

/**
 *
 * @param {"ANIME" | "MANGA"} mediaType
 * @param {"CURRENT" | "PLANNING" | "DROPPED" | "REPEATING" | "PAUSED"} mediaStatus
 * @returns {import("@tanstack/react-query").UseQueryResult}
 */
export function useUserList(mediaType, mediaStatus) {
  return useInfiniteQuery({
    queryKey: ['me', mediaStatus, mediaType],
    queryFn: async ({ pageParam }) => {
      const response = await graphqlRequest({
        query: QUERY,
        variables: {
          page: pageParam,
          perPage: 10,
          type: mediaType,
          status: mediaStatus,
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
