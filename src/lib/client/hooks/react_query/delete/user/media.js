import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteUserMedia({
  mediaId,
  mediaType,
  handleSuccess = () => {},
  handleError = () => {},
} = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mediaListEntryId }) =>
      rpcRequest({
        action: 'delete:user:media:{mediaListEntryId}',
        context: { mediaListEntryId },
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          [
            'get:media:full-details:{mediaId,mediaType}',
            'get:user:media:{mediaId,mediaType}',
          ].includes(query.queryKey[0]) &&
          query.queryKey[1] === mediaId &&
          query.queryKey[2] === mediaType,
      });

      handleSuccess(data, variables, context);
    },

    onError: (error) => {
      handleError(error);
    },
  });
}
