import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useQuery } from '@tanstack/react-query';

export function useMediaBasicInfoById({ mediaId, mediaType }) {
  return useQuery({
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
    enabled: !!mediaId && !!mediaType && typeof window !== 'undefined',
  });
}
