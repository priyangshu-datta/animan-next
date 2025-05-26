import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useQuery } from '@tanstack/react-query';

export function useTagCollection() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () =>
      rpcRequest({
        action: 'get:media:tag-collection',
      }),
    enabled: typeof window !== 'undefined',
  });
}
