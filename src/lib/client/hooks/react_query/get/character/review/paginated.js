import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useCharacterReviewsPaginated({ characterId }) {
  return useInfiniteQuery({
    queryKey: [
      'get:character:reviews-paginated:{characterId,cursor,limit}',
      characterId,
    ],
    queryFn: ({ pageParam }) =>
      rpcRequest({
        action: 'get:character:reviews-paginated:{characterId,cursor,limit}',
        context: { characterId },
        metadata: { cursor: pageParam },
      }),
    getNextPageParam: (lastPage) => {
      return lastPage.meta.nextCursor;
    },
    enabled: !!characterId && typeof window !== 'undefined',
  });
}
