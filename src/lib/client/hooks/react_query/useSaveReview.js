import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpRequest } from '../../http-client';

/**
 * Sends a request to save a review for a specific media episode.
 *
 * @param {object} params - The parameters for the review.
 * @param {number} params.media_id - The ID of the media.
 * @param {number} params.episode - The episode identifier.
 * @param {string} params.review - The review text.
 * @param {number} params.rating - The rating given.
 * @param {Array<string>} params.emotions - The emotions associated with the review.
 * @param {boolean} params.favourite - Whether the episode is marked as a favorite.
 * @returns {Promise} - The HTTP request promise.
 */
function saveReview(reviewData) {
  return httpRequest({
    url: '/api/reviews',
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
export function useSaveReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewData) => saveReview(reviewData),
    retry: (failureCount, error) => {
      return error.message === 'Retry with new token' && failureCount < 2;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'reviews',
          variables.media_id,
          variables.mediaType,
          ...(!['anime', 'manga'].includes(variables.subject_type)
            ? variables.mediaType === 'ANIME'
              ? ['episode']
              : ['chapter', 'volume']
            : [variables.subject_type]),
        ],
      });
    },
  });
}
