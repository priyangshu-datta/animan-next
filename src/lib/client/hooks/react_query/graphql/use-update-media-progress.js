import { useBaseMutation } from './base/use-base-mutation';

const MUTATION = `mutation UpdateMediaListEntry($mediaId: Int, $progress: Int) {
  SaveMediaListEntry(mediaId: $mediaId, progress: $progress) {
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
