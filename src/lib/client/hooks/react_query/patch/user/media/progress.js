import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { SNACK_DURATION } from '@/lib/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotice } from '@yamada-ui/react';
import { useEffect, useState } from 'react';

export function useUpdateMediaProgress({
  handleSuccess = () => {},
  handleError = () => {},
} = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mediaId, mediaType, progress }) =>
      rpcRequest({
        action: 'patch:user:media:{mediaId,mediaType,progress}',
        context: { mediaId, mediaType, progress },
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
            'get:user:list-paginated:{mediaType,mediaEntryStatus}',
      });
      handleSuccess();
    },
    onError: (error) => {
      handleError(error);
    },
  });
}

export function useOptimisticUpdateMediaProgress({ mediaProgress }) {
  const [progress, setProgress] = useState(mediaProgress);
  useEffect(() => {
    setProgress(mediaProgress);
  }, [mediaProgress]);
  const notice = useNotice();
  const { mutate, isPending } = useUpdateMediaProgress({
    handleSuccess: () => {
      setProgress((progress) => progress + 1);
      notice({
        description: 'Progress updated: +1',
        status: 'success',
        duration: SNACK_DURATION,
        isClosable: true,
      });
    },
    handleError: (error) => {
      notice({
        description: error.message,
        status: 'error',
        duration: SNACK_DURATION,
        isClosable: true,
      });
    },
  });

  return {
    progress,
    updateMediaProgress: mutate,
    updatingMediaProgress: isPending,
  };
}
