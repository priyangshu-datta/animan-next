import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useCharacterReviewsByUserPaginated() {
  return useInfiniteQuery({
    queryKey: ['get:character:reviews-paginated:{cursor,limit}'],
    queryFn: ({ pageParam }) =>
      rpcRequest({
        action: 'get:character:reviews-paginated:{cursor,limit}',
        metadata: { cursor: pageParam },
      }),
    getNextPageParam: (lastPage) => {
      return lastPage.meta.nextCursor;
    },
    enabled: typeof window !== 'undefined',
  });
}
