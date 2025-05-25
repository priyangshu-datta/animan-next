import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { SNACK_DURATION } from '@/lib/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotice } from '@yamada-ui/react';
import { useEffect, useState } from 'react';

export function useToggleCharacterFavourite({
  handleSuccess = () => {},
  handleError = () => {},
} = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ characterId }) =>
      rpcRequest({
        action: 'patch:character:toggle-favourite:{characterId}',
        context: { characterId },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'get:character:full-details:{characterId}',
          variables.characterId,
        ],
      });
      handleSuccess();
    },
    onError: (error) => {
      handleError(error);
    },
  });
}

export function useOptimisticToggleCharacterFavourite({
  characterIsFavourite,
}) {
  const notice = useNotice();
  const [isFavourite, setIsFavourite] = useState(characterIsFavourite);

  useEffect(() => {
    setIsFavourite(characterIsFavourite);
  }, [characterIsFavourite]);

  const { mutate, isPending } = useToggleCharacterFavourite({
    handleSuccess: () => {
      setIsFavourite((prev) => !prev);
      notice({
        description: `${!isFavourite ? 'F' : 'Unf'}avourited!`,
        status: 'success',
        duration: SNACK_DURATION,
      });
    },

    handleError: (error) => {
      notice({
        title: error.code,
        description: error.message,
        status: 'error',
        duration: SNACK_DURATION,
      });
    },
  });

  return {
    toggleCharacterFavourite: mutate,
    characterIsFavourite: isFavourite,
    togglingCharacterFavourite: isPending,
  };
}
