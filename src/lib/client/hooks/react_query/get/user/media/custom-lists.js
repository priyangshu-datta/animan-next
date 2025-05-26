import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useQuery } from '@tanstack/react-query';

export function useUserCustomLists({ mediaType }) {
  return useQuery({
    queryKey: ['get:user:media:custom-lists:{mediaType}', mediaType],
    queryFn: () =>
      rpcRequest({
        action: 'get:user:media:custom-lists:{mediaType}',
        context: { mediaType },
      }),
    enabled: !!mediaType && typeof window !== 'undefined',
  });
}
