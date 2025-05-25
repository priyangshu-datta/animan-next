import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';

export function useMediaFullInfoById({ mediaId, mediaType }) {
  return useSuspenseQuery({
    queryKey: [
      'get:media:full-details:{mediaId,mediaType}',
      mediaId,
      mediaType,
    ],
    queryFn: () =>
      rpcRequest({
        action: 'get:media:full-details:{mediaId,mediaType}',
        context: { mediaId, mediaType },
      }),
  });
}
