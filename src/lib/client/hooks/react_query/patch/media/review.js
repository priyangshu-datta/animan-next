import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rpcRequest } from '@/lib/client/api-clients/rpc-client';

export function useUpdateMediaReview({
  reviewId,
  mediaId,
  mediaType,
  subjectType,
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewData) =>
      rpcRequest({
        action: 'patch:media:review:{reviewData}',
        context: reviewData,
        metadata: { reviewId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const updateReviewById =
            query.queryKey[0] === 'get:media:review:{reviewId,mediaType}' &&
            query.queryKey[1] === reviewId &&
            query.queryKey[2] === mediaType;

          const updateReviews =
            query.queryKey[0] ===
              'get:media:[subjectType]:reviews-paginated:{mediaId,mediaType,subjectType,cursor,limit}' &&
            query.queryKey[1] === mediaId &&
            query.queryKey[2] === mediaType &&
            query.queryKey[3] === subjectType;

          const updateUserReviews =
            query.queryKey[0] ===
              'get:media:[subjectType]:reviews-paginated:{mediaType,subjectType,cursor,limit}' &&
            query.queryKey[1] === 'anime' &&
            query.queryKey[2] === 'all';

          return updateReviewById || updateReviews || updateUserReviews;
        },
      });
    },
  });
}
