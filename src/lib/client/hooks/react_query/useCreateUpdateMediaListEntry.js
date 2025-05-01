import { useQueryClient } from '@tanstack/react-query';
import { useBaseMutation } from '../useBaseMutation';

const QUERY = `mutation SaveMediaListEntry($mediaId: Int, $status: MediaListStatus, $score: Float, $progress: Int, $repeat: Int, $private: Boolean, $hiddenFromStatusLists: Boolean, $notes: String, $customLists: [String], $startedAt: FuzzyDateInput, $completedAt: FuzzyDateInput, $progressVolumes: Int) {
  SaveMediaListEntry(
    mediaId: $mediaId,
    status: $status,
    score: $score,
    progress: $progress,
    repeat: $repeat,
    private: $private,
    hiddenFromStatusLists: $hiddenFromStatusLists,
    notes: $notes,
    customLists: $customLists,
    startedAt: $startedAt,
    completedAt: $completedAt
    progressVolumes: $progressVolumes
  ) {
    id
  }
}
`;

export function useCreateUpdateMediaListEntry() {
  const queryClient = useQueryClient();
  return useBaseMutation({
    query: QUERY,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['media', `${variables.mediaId}`],
      });
    },
  });
}
