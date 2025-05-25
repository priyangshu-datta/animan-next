import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';

export function useUserInfo() {
  return useSuspenseQuery({
    queryKey: ['get:user:info'],
    queryFn: () =>
      rpcRequest({
        action: 'get:user:info',
      }),
  });
}
