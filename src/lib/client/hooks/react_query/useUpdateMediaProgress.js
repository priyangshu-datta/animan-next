import { useBaseMutation } from '../useBaseMutation';

const MUTATION = `mutation UpdateMediaListEntry($id: Int, $progress: Int) {
  SaveMediaListEntry(id: $id, progress: $progress) {
    id
  }
}
`;

/**
 * A custom hook to update media progress using a GraphQL mutation.
 *
 * @returns {import('@tanstack/react-query').UseMutationResult} A mutation function to update media progress.
 */
export function useUpdateMediaProgress() {
  return useBaseMutation({ query: MUTATION });
}
