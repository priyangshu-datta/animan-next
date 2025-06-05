import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useMediaReviewsByUserPaginated({ mediaType, subjectType }) {
  return useInfiniteQuery({
    queryKey: [
      'get:media:[subjectType]:reviews-paginated:{mediaType,subjectType,cursor,limit}',
      mediaType,
      subjectType,
    ],
    queryFn: ({ pageParam }) =>
      rpcRequest({
        action:
          'get:media:[subjectType]:reviews-paginated:{mediaType,subjectType,cursor,limit}',
        context: {
          mediaType,
          subjectType,
        },
        metadata: { cursor: pageParam },
      }),
    getNextPageParam: (lastPage) => {
      return lastPage.meta.nextCursor;
    },
    enabled: !!mediaType && !!subjectType && typeof window !== 'undefined',
  });
}
