import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useQuery } from '@tanstack/react-query';

export function useMediaFullInfoById({ mediaId, mediaType }) {
  return useQuery({
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
    enabled: !!mediaId && !!mediaType && typeof window !== 'undefined',
  });
}
