import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateUserMedia({
  handleSuccess = () => {},
  handleError = () => {},
} = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mediaId, mediaType, ...patchData }) =>
      rpcRequest({
        action: 'patch:user:media:{mediaId,patchData}',
        context: { mediaId, mediaType, ...patchData },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          ([
            'get:media:full-details:{mediaId,mediaType}',
            'get:user:media:{mediaId,mediaType}',
          ].includes(query.queryKey[0]) &&
            query.queryKey[1] === variables.mediaId &&
            query.queryKey[2] === variables.mediaType) ||
          query.queryKey[0] ===
            'get:user:media:list:{mediaType,mediaListStatus}',
      });

      handleSuccess();
    },
    onError: (error) => {
      handleError(error);
    },
  });
}
