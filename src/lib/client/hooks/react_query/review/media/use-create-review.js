import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpRequest } from '../../../../api-clients/http-client';

/**
 * Sends a request to save a review for a specific media episode.
 *
 * @param {object} reviewData
 * @returns {Promise} - The HTTP request promise.
 */
function createReview(reviewData) {
  return httpRequest({
    url: '/api/reviews/media',
    method: 'post',
    data: reviewData,
    headers: {
      'Content-Type': 'application/json',
      'x-media-type': reviewData.mediaType,
    },
  });
}

/**
 * Custom hook to save a review for a media episode.
 * It uses a mutation to send the review data and invalidates the related query on success.
 *
 * @returns {import('@tanstack/react-query').UseMutationResult} - The mutation object from react-query.
 */
export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewData) => createReview(reviewData),
    retry: (failureCount, error) => {
      return error.message === 'Retry with new token' && failureCount < 2;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'mediaReviews',
          variables.mediaId,
          variables.mediaType,
          variables.subjectType,
        ],
      });
    },
  });
}
