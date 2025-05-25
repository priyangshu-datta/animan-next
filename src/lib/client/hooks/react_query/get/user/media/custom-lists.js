import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';

export function useUserCustomLists({ mediaType }) {
  return useSuspenseQuery({
    queryKey: ['get:user:media:custom-lists:{mediaType}', mediaType],
    queryFn: () =>
      rpcRequest({
        action: 'get:user:media:custom-lists:{mediaType}',
        context: { mediaType },
      }),
    
  });
}
