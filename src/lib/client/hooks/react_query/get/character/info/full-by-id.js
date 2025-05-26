import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useQuery } from '@tanstack/react-query';

export function useCharacterFullInfoById({ characterId }) {
  return useQuery({
    queryKey: ['get:character:full-details:{characterId}', characterId],
    queryFn: () =>
      rpcRequest({
        action: 'get:character:full-details:{characterId}',
        context: { characterId },
      }),
    enabled: !!characterId && typeof window !== 'undefined',
  });
}
