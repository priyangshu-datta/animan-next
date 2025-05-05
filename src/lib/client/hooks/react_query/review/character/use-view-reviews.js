import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { httpRequest } from '@/lib/client/api-clients/http-client';

async function viewReviews(params) {
  const baseUrl = '/api/reviews/character';
  const query = Object.entries(params)
    .filter(([key, value]) => value !== undefined) // Filter out undefined values
    .map(([key, value]) => `${key}=${value}`) // Map to key=value pairs
    .join('&'); // Join into query string
  const response = await httpRequest({
    url: `${baseUrl}?${query}`,
    method: 'get',
  });

  if (response.success) {
    return { data: response.data, meta: response.meta };
  }
}

export function useViewReviews({ characterId }) {
  return useInfiniteQuery({
    queryKey: ['characterReviews', characterId],
    queryFn: ({ pageParam }) =>
      viewReviews({
        characterId,
        cursor: pageParam,
        limit: 10,
      }),
    getNextPageParam: (lastPage) => {
      return lastPage.meta.nextCursor;
    },
  });
}
