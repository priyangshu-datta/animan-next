import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';

export function useCharacterReviewById({ reviewId }) {
  return useSuspenseQuery({
    queryKey: ['get:character:review:{reviewId}', reviewId],
    queryFn: () =>
      rpcRequest({
        action: 'get:character:review:{reviewId}',
        context: { reviewId },
      }),
  });
}
