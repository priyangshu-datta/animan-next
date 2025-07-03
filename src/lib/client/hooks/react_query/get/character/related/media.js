import { useInfiniteQuery } from '@tanstack/react-query';
import { rpcRequest } from '@/lib/client/api-clients/rpc-client';

export function useCharacterMedia({ characterId, mediaType }) {
  return useInfiniteQuery({
    queryKey: [
      'get:character:media-paginated:{characterId,mediaType,page,perPage}',
      characterId,
      mediaType,
    ],
    queryFn: async ({ pageParam }) => {
      const response = await rpcRequest({
        action:
          'get:character:media-paginated:{characterId,mediaType,page,perPage}',
        context: {
          characterId,
          mediaType,
          page: pageParam,
          perPage: 10,
        },
      });

      const { data, meta } = response;

      return {
        data,
        currentPage: meta.currentPage,
        hasNextPage: meta.hasNextPage,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined,

    enabled: !!characterId && !!mediaType && typeof window !== 'undefined',
  });
}
