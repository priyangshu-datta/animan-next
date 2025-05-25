import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';

export function useUserMedia({ mediaId, mediaType }) {
  return useSuspenseQuery({
    queryKey: ['get:user:media:{mediaId,mediaType}', mediaId, mediaType],
    queryFn: () =>
      rpcRequest({
        action: 'get:user:media:{mediaId,mediaType}',
        context: { mediaId, mediaType },
      }),
  });
}
