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
        queryKey: [
          'get:media:[subjectType]:reviews-paginated:{mediaId,mediaType,subjectType,cursor,limit}',
          mediaId,
          mediaType,
          subjectType,
        ],
      });
    },
  });
}
