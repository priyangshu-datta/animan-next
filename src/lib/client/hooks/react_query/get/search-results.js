import { rpcRequest } from '@/lib/client/api-clients/rpc-client'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'


export function useSearch({ searchOptions }) {
  return useSuspenseInfiniteQuery({
    queryKey: ['search', searchOptions],
    queryFn: async ({ pageParam }) => {
      const response = await rpcRequest({
        action: 'get:search:results:{searchOptions}',
        context: searchOptions,
        metadata: {
          page: pageParam,
          perPage: 10,
        },
      });

      const { data, meta } = response;

      return {
        searchResults: data,
        currentPage: meta.currentPage,
        hasNextPage: meta.hasNextPage,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
    },
  });
}
