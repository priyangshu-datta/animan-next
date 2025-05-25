import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';

export function useTagCollection() {
  return useSuspenseQuery({
    queryKey: ['tags'],
    queryFn: () =>
      rpcRequest({
        action: 'get:media:tag-collection',
      }),
  });
}
