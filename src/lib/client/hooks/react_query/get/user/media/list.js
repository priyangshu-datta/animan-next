import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useUserMediaList({ mediaType, mediaEntryStatus, perPage = 10 }) {
  return useInfiniteQuery({
    queryKey: [
      'get:user:list-paginated:{mediaType,mediaEntryStatus}',
      mediaType,
      mediaEntryStatus,
    ],
    queryFn: async ({ pageParam }) => {
      const response = await rpcRequest({
        action: 'get:user:list-paginated:{mediaType,mediaEntryStatus}',
        context: { mediaType, mediaEntryStatus, page: pageParam, perPage },
      });

      return {
        mediaEntry: response?.data,
        hasNextPage: response?.meta.hasNextPage,
        currentPage: response?.meta.currentPage,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!mediaType && !!mediaEntryStatus && typeof window !== 'undefined',
  });
}
