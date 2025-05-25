import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

export function useMediaCharacters({ mediaId, mediaType }) {
  return useSuspenseInfiniteQuery({
    queryKey: [
      'get:media:characters-paginated:{mediaId,mediaType,page,perPage}',
      mediaId,
      mediaType,
    ],
    queryFn: async ({ pageParam }) => {
      const response = await rpcRequest({
        action:
          'get:media:characters-paginated:{mediaId,mediaType,page,perPage}',
        context: { mediaId, mediaType, page: pageParam, perPage: 10 },
      });

      const { data, meta } = response;

      return {
        characters: data,
        currentPage: meta.currentPage,
        hasNextPage: meta.hasNextPage,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined,
    enabled: !!mediaId,
  });
}
