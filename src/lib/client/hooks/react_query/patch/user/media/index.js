import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateUserMedia({
  mediaId,
  mediaType,
  handleSuccess = () => {},
  handleError = () => {},
} = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mediaId, ...patchData }) => {
      return rpcRequest({
        action: 'patch:user:media:{mediaId,patchData}',
        context: { mediaId, ...patchData },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          ([
            'get:media:full-details:{mediaId,mediaType}',
            'get:user:media:{mediaId,mediaType}',
          ].includes(query.queryKey[0]) &&
            query.queryKey[1] === mediaId &&
            query.queryKey[2] === mediaType) ||
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
