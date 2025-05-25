import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

export function useCharacterReviewsPaginated({ characterId }) {
  return useSuspenseInfiniteQuery({
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
  });
}
