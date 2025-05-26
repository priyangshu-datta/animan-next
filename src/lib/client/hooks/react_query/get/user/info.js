import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useQuery } from '@tanstack/react-query';

export function useUserInfo() {
  return useQuery({
    queryKey: ['get:user:info'],
    queryFn: () =>
      rpcRequest({
        action: 'get:user:info',
      }),
    enabled: typeof window !== 'undefined',
  });
}
