import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateCharacterReview({ characterId }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewData) =>
      rpcRequest({
        action: 'post:character:review:{reviewData}',
        context: reviewData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          'get:character:reviews-paginated:{characterId,cursor,limit}',
          characterId,
        ],
      });
    },
  });
}
