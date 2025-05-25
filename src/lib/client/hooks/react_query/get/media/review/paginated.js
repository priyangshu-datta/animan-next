import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

export function useMediaReviewsPaginated({ mediaId, mediaType, subjectType }) {
  return useSuspenseInfiniteQuery({
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
  });
}
