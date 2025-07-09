import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rpcRequest } from '@/lib/client/api-clients/rpc-client';

export function useCreateMediaReview({ mediaId, mediaType, subjectType }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewData) =>
      rpcRequest({
        action: 'post:media:review:{reviewData}',
        context: reviewData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return (
            (query.queryKey[0] ===
              'get:media:[subjectType]:reviews-paginated:{mediaId,mediaType,subjectType,cursor,limit}' &&
              query.queryKey[1] === mediaId &&
              query.queryKey[2] === mediaType &&
              query.queryKey[3] === subjectType) ||
            (query.queryKey[0] ===
              'get:media:[subjectType]:reviews-paginated:{mediaType,subjectType,cursor,limit}' &&
              query.queryKey[1] === 'anime' &&
              query.queryKey[2] === 'all')
          );
        },
      });
    },
  });
}
