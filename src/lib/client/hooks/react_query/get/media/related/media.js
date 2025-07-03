import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useQuery } from '@tanstack/react-query';

export function useMediaRelatedMedia({ mediaId, mediaType }) {
  return useQuery({
    queryKey: [
      'get:media:related-media:{mediaId,mediaType}',
      mediaId,
      mediaType,
    ],
    queryFn: async () => {
      const response = await rpcRequest({
        action: 'get:media:related-media:{mediaId,mediaType}',
        context: { mediaId, mediaType },
      });

      const { data } = response;

      return data;
    },
    enabled: !!mediaId && !!mediaType && typeof window !== 'undefined',
  });
}
