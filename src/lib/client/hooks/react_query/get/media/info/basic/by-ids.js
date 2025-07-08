import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useQuery } from '@tanstack/react-query';

export function useMediaBasicDetailsByIds({ mediaIds, mediaType }) {
  mediaIds?.sort();
  return useQuery({
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
    enabled: !!mediaIds && !!mediaType && typeof window !== 'undefined',
  });
}
