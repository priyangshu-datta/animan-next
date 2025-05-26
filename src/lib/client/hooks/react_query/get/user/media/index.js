import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useQuery } from '@tanstack/react-query';

export function useUserMedia({ mediaId, mediaType }) {
  return useQuery({
    queryKey: ['get:user:media:{mediaId,mediaType}', mediaId, mediaType],
    queryFn: () =>
      rpcRequest({
        action: 'get:user:media:{mediaId,mediaType}',
        context: { mediaId, mediaType },
      }),
    enabled: !!mediaId && !!mediaType && typeof window !== 'undefined',
  });
}
