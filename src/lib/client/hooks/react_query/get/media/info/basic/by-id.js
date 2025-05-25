import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';

export function useMediaBasicInfoById({ mediaId, mediaType }) {
  return useSuspenseQuery({
    queryKey: [
      'get:media:basic-details:{mediaId,mediaType}',
      mediaId,
      mediaType,
    ],
    queryFn: () =>
      rpcRequest({
        action: 'get:media:basic-details:{mediaId,mediaType}',
        context: { mediaId, mediaType },
      }),
  });
}
