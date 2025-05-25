import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateCharacterReview({ characterId, reviewId }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewData) =>
      rpcRequest({
        action: 'patch:character:review:{reviewData}',
        context: reviewData,
        metadata: { reviewId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const matchesCharacterReview =
            query.queryKey[0] ===
              'get:character:reviews-paginated:{characterId,cursor,limit}' &&
            query.queryKey[1] === characterId;
          const matchesSelectedMedia =
            query.queryKey[0] === 'get:character:review:{reviewId}' &&
            query.queryKey[1] === reviewId;

          return matchesCharacterReview || matchesSelectedMedia;
        },
      });
    },
  });
}
