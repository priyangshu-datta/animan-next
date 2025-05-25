import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rpcRequest } from '@/lib/client/api-clients/rpc-client';

export function useDeleteMediaReview({
  characterId,
  handleSuccess = () => {},
  handleError = () => {},
} = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId }) =>
      rpcRequest({
        action: 'delete:character:review:{reviewIds}',
        context: { reviewIds: [reviewId] },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          'get:character:reviews-paginated:{characterId,cursor,limit}',
          characterId,
        ],
      });
      handleSuccess();
    },
    onError: (error) => {
      handleError(error);
    },
  });
}
