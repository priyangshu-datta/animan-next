import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';

export function useMediaBasicDetailsByIds({ mediaIds, mediaType }) {
  mediaIds.sort();
  return useSuspenseQuery({
    queryKey: [
      'get:media:basic-details:{mediaIds,mediaType}',
      mediaIds,
      mediaType,
    ],
    queryFn: () =>
      rpcRequest({
        action: 'get:media:basic-details:{mediaIds,mediaType}',
        context: {
          mediaIds,
          mediaType,
        },
      }),
  });
}
