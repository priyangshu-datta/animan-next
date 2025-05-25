import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';

export function useCharacterFullInfoById({ characterId }) {
  return useSuspenseQuery({
    queryKey: ['get:character:full-details:{characterId}', characterId],
    queryFn: () =>
      rpcRequest({
        action: 'get:character:full-details:{characterId}',
        context: { characterId },
      }),
  });
}
