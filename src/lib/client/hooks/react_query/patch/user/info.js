import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateUserInfo({
  handleSuccess = () => {},
  handleError = () => {},
} = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userInfo) =>
      rpcRequest({
        action: 'patch:user:info:{userInfo}',
        context: userInfo,
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['get:user:info'],
      });
      handleSuccess({ data, variables, context });
    },
    onError: (error) => {
      handleError(error);
    },
  });
}
