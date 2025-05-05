import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpRequest } from '../../../../api-clients/http-client';

/**
 * Deletes a review by making an HTTP DELETE request.
 *
 * @param {object} params - The parameters for the delete request.
 * @param {string} params.reviewId - The ID of the review to delete.
 * @returns {Promise} A promise that resolves when the review is deleted.
 */
function deleteReview({ reviewId, mediaType }) {
  return httpRequest({
    url: '/api/reviews/media',
    method: 'delete',
    data: { reviewId },
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
    mutationFn: ({ reviewId, mediaType }) =>
      deleteReview({ reviewId, mediaType }),
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
