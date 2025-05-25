import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';

export function useMediaReviewById(reviewId, mediaType) {
  return useSuspenseQuery({
    queryKey: ['get:media:review:{reviewId,mediaType}', reviewId, mediaType],
    queryFn: () =>
      rpcRequest({
        action: 'get:media:review:{reviewId,mediaType}',
        context: { id: reviewId, mediaType },
      }),
  });
}
