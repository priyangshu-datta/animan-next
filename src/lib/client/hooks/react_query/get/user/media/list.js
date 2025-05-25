import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

export function useUserMediaList({ mediaType, mediaListStatus }) {
  return useSuspenseInfiniteQuery({
    queryKey: [
      'get:user:media:list:{mediaType,mediaListStatus}',
      mediaType,
      mediaListStatus,
    ],
    queryFn: async ({ pageParam }) => {
      const response = await rpcRequest({
        action: 'get:user:list-paginated:{mediaType,mediaListStatus}',
        context: { mediaType, mediaListStatus, page: pageParam, perPage: 10 },
      });

      const { data, meta } = response;

      return {
        mediaList: data,
        hasNextPage: meta.hasNextPage,
        currentPage: meta.currentPage,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });
}
