import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useUserMediaList({ mediaType, mediaListStatus, perPage = 10 }) {
  return useInfiniteQuery({
    queryKey: [
      'get:user:media:list:{mediaType,mediaListStatus}',
      mediaType,
      mediaListStatus,
    ],
    queryFn: async ({ pageParam }) => {
      const response = await rpcRequest({
        action: 'get:user:list-paginated:{mediaType,mediaListStatus}',
        context: { mediaType, mediaListStatus, page: pageParam, perPage },
      });

      return {
        mediaList: response?.data,
        hasNextPage: response?.meta.hasNextPage,
        currentPage: response?.meta.currentPage,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!mediaType && !!mediaListStatus && typeof window !== 'undefined',
  });
}
