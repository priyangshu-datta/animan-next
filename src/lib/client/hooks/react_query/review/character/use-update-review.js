import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpRequest } from '@/lib/client/api-clients/http-client';

/**
 * Updates a review by sending a PATCH request to the server.
 *
 * @param {object} updationData
 * @returns {Promise} A promise that resolves with the server response.
 */
function updateReview(updationData) {
  return httpRequest({
    url: '/api/reviews/character',
    method: 'patch',
    data: updationData,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Custom hook to update a review using React Query's useMutation.
 * It invalidates the related query on success to ensure fresh data.
 *
 * @returns {import('@tanstack/react-query').UseMutationResult} Mutation object from useMutation.
 */
export function useUpdateReview({ characterId }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateReview,
    retry: (failureCount, error) => {
      return error?.message === 'Retry with new token' && failureCount < 2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['characterReviews', characterId],
      });
    },
  });
}
