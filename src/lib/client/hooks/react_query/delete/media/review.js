import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rpcRequest } from '@/lib/client/api-clients/rpc-client';

export function useDeleteMediaReview({
  handleError = () => {},
  handleSuccess = () => {},
} = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, mediaType }) =>
      rpcRequest({
        action: 'delete:media:review:{reviewIds}',
        context: { reviewIds: [reviewId], mediaType },
      }),
    onSuccess: (_, { mediaId, mediaType, subjectType }) => {
      queryClient.invalidateQueries({
        queryKey: [
          'get:media:[subjectType]:reviews-paginated:{mediaId,mediaType,subjectType,cursor,limit}',
          mediaId,
          mediaType,
          subjectType,
        ],
      });
      handleSuccess();
    },
    onError: (error) => {
      handleError(error);
    },
  });
}
