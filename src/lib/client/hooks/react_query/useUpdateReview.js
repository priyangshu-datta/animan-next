import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpRequest } from '../../http-client';

/**
 * Updates a review by sending a PATCH request to the server.
 *
 * @param {object} params - The parameters for the review update.
 * @param {string} params.review_id - The ID of the review to update.
 * @param {number} params.episode - The episode associated with the review.
 * @param {string} params.review - The review content.
 * @param {number} params.rating - The rating given in the review.
 * @param {Array<string>} params.emotions - The emotions associated with the review.
 * @param {boolean} params.favourite - Whether the review marks the episode as a favorite.
 * @returns {Promise} A promise that resolves with the server response.
 */
function updateReview(updationData) {
  return httpRequest({
    url: '/api/reviews',
    method: 'patch',
    data: updationData,
    headers: {
      'Content-Type': 'application/json',
      'x-media-type': updationData.mediaType,
    },
  });
}

/**
 * Custom hook to update a review using React Query's useMutation.
 * It invalidates the related query on success to ensure fresh data.
 *
 * @returns {import('@tanstack/react-query').UseMutationResult} Mutation object from useMutation.
 */
export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateReview,
    retry: (failureCount, error) => {
      return error?.message === 'Retry with new token' && failureCount < 2;
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
