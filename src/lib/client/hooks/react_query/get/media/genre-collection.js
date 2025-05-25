import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';

export function useGenreCollection() {
  return useSuspenseQuery({
    queryKey: ["genres"],
    queryFn: () =>
      rpcRequest({
        action: 'get:media:genre-collection',
      }),
  });
}
