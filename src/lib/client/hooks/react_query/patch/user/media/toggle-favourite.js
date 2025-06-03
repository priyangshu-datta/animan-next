import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { SNACK_DURATION } from '@/lib/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotice } from '@yamada-ui/react';
import { useEffect, useState } from 'react';

export function useToggleMediaFavourite({
  handleSuccess = () => {},
  handleError = () => {},
} = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mediaId, mediaType }) =>
      rpcRequest({
        action: 'patch:media:toggle-favourite:{mediaId,mediaType}',
        context: { mediaId, mediaType },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          [
            'get:media:full-details:{mediaId,mediaType}',
            'get:user:media:{mediaId,mediaType}',
          ].includes(query.queryKey[0]) &&
          query.queryKey[1] === variables.mediaId &&
          query.queryKey[2] === variables.mediaType,
      });
      handleSuccess();
    },
    onError: (error) => {
      handleError(error);
    },
  });
}

export function useOptimisticToggleMediaFavourite({ mediaIsFavourite }) {
  const notice = useNotice();
  const [isFavourite, setIsFavourite] = useState(mediaIsFavourite);

  useEffect(() => {
    setIsFavourite(mediaIsFavourite);
  }, [mediaIsFavourite]);

  const { mutate, isPending } = useToggleMediaFavourite({
    handleSuccess: () => {
      setIsFavourite((prev) => !prev);
      notice({
        description: `${!isFavourite ? 'F' : 'Unf'}avourited!`,
        status: 'success',
        duration: SNACK_DURATION,
        isClosable: true,
      });
    },

    handleError: (error) => {
      notice({
        title: error.code,
        description: error.message,
        status: 'error',
        duration: SNACK_DURATION,
        isClosable: true,
      });
    },
  });

  return {
    toggleMediaFavourite: mutate,
    mediaIsFavourite: isFavourite,
    togglingMediaFavourite: isPending,
  };
}
