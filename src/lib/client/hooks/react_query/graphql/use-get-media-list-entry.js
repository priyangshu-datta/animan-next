import { useBaseQuery } from '../base/use-base-query';

const QUERY = `query($mediaId: Int!) {
    Media(id: $mediaId) {
      isFavourite
      mediaListEntry {
        id
        status
        startedAt {
          year
          month
          day
        }
        score
        progress
        progressVolumes
        repeat
        completedAt {
          year
          month
          day
        }
        createdAt
        updatedAt
        hiddenFromStatusLists
        private
        notes
        customLists
      }
    }
  }`;

export function useGetMediaListEntry(mediaId) {
  return useBaseQuery({
    key: ['mediaListEntry', mediaId],
    query: QUERY,
    variables: { mediaId },
  });
}
