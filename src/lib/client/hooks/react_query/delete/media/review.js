import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteMediaReview({
  handleError = () => {},
  handleSuccess = () => {},
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, mediaType }) =>
      rpcRequest({
        action: 'delete:media:review:{reviewIds,mediaType}',
        context: { reviewIds: [reviewId], mediaType },
      }),
    onSuccess: (_, { mediaId, mediaType, subjectType }) => {
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
      handleSuccess();
    },
    onError: (error) => {
      handleError(error);
    },
  });
}
