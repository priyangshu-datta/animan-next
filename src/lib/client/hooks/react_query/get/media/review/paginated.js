import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useMediaReviewsPaginated({ mediaId, mediaType, subjectType }) {
  return useInfiniteQuery({
    queryKey: [
      'get:media:[subjectType]:reviews-paginated:{mediaId,mediaType,subjectType,cursor,limit}',
      mediaId,
      mediaType,
      subjectType,
    ],
    queryFn: ({ pageParam }) =>
      rpcRequest({
        action:
          'get:media:[subjectType]:reviews-paginated:{mediaId,mediaType,subjectType,cursor,limit}',
        context: {
          mediaId,
          mediaType,
          subjectType,
        },
        metadata: { cursor: pageParam },
      }),
    getNextPageParam: (lastPage) => {
      return lastPage.meta.nextCursor;
    },
    enabled:
      !!mediaId &&
      !!mediaType &&
      !!subjectType &&
      typeof window !== 'undefined',
  });
}
