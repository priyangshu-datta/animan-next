import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useMutation } from '@tanstack/react-query';

export function useCheckUsername() {
  return useMutation({
    mutationFn: ({ username }) =>
      rpcRequest({
        action: 'get:user:check-username:{username}',
        context: { username },
      }),
  });
}
