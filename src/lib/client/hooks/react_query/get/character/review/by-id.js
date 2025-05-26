import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useQuery } from '@tanstack/react-query';

export function useCharacterReviewById({ reviewId }) {
  return useQuery({
    queryKey: ['get:character:review:{reviewId}', reviewId],
    queryFn: () =>
      rpcRequest({
        action: 'get:character:review:{reviewId}',
        context: { reviewId },
      }),
    enabled: !!reviewId && typeof window !== 'undefined',
  });
}
