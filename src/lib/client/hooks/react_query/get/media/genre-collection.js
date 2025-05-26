import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useQuery } from '@tanstack/react-query';

export function useGenreCollection() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: () =>
      rpcRequest({
        action: 'get:media:genre-collection',
      }),
    enabled: typeof window !== 'undefined',
  });
}
