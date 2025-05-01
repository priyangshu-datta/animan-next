import { useQuery } from '@tanstack/react-query';
import { httpRequest } from '../../http-client';

/**
 * Fetches reviews for a specific media item.
 *
 * @param {object} params - The parameters for the request.
 * @param {string} params.media_id - The ID of the media item to fetch reviews for.
 * @returns {Promise<object>} The HTTP response containing the reviews.
 */
function viewReviews({ mediaId, mediaType, subjectType }) {
  return httpRequest({
    url: '/api/reviews/get',
    method: 'post',
    data: { media_id: mediaId, id_or_all: 'all' },
    headers: {
      'Content-Type': 'application/json',
      'x-media-type': mediaType,
      'x-subject-type': subjectType,
    },
  });
}

/**
 * Custom hook to fetch and manage reviews for a specific media item.
 *
 * @param {object} params - The parameters for the hook.
 * @param {string} params.media_id - The ID of the media item to fetch reviews for.
 * @returns {import('@tanstack/react-query').UseQueryResult} The result of the useQuery hook.
 */
export function useViewReviews({ mediaId, mediaType, subjectType }) {
  return useQuery({
    queryKey: ['reviews', mediaId, mediaType, ...subjectType.split(';')],
    queryFn: () => viewReviews({ mediaId, mediaType, subjectType }),
    retry: (failureCount, error) => {
      return error.message === 'Retry with new token' && failureCount < 2;
    },
  });
}
