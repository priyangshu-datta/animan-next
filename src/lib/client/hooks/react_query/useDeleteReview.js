import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpRequest } from '../../http-client';

/**
 * Deletes a review by making an HTTP DELETE request.
 *
 * @param {object} params - The parameters for the delete request.
 * @param {string} params.review_id - The ID of the review to delete.
 * @returns {Promise} A promise that resolves when the review is deleted.
 */
function deleteReview({ review_id, mediaType }) {
  return httpRequest({
    url: '/api/reviews',
    method: 'delete',
    data: { review_id },
    headers: {
      'Content-Type': 'application/json',
      'x-media-type': mediaType,
    },
  });
}

/**
 * Custom hook to handle the deletion of a review.
 * It uses React Query's useMutation to perform the delete operation
 * and invalidates the related query on success.
 *
 * @returns {import('@tanstack/react-query').UseMutationResult} Mutation object from React Query.
 */
export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ media_id, review_id, mediaType, subject_type }) =>
      deleteReview({ review_id, mediaType }),
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
