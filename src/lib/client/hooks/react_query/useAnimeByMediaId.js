import { useBaseQuery } from '../useBaseQuery';

const QUERY = `query($mediaId: Int!) {
	Media(id: $mediaId) {
    id
		episodes
    type
    format
    episodes
    chapters
    volumes
    status
    season
    seasonYear
		nextAiringEpisode {
			episode
			airingAt
		}
		title {
			romaji
		}
		listEntry: mediaListEntry {
			progress
      progressVolumes
      id
      score
		}
    coverImage {
      extraLarge
    }
		meanScore
		genres
    description(asHtml: true)
	}
}`;

/**
 * A custom hook to fetch anime details by media ID.
 *
 * @param {number} mediaId - The ID of the media to fetch details for.
 * @returns {import('@tanstack/react-query').UseQueryResult} The result of the query containing anime details.
 */
export function useAnimeByMediaId(mediaId) {
  return useBaseQuery({
    key: ['media', mediaId],
    query: QUERY,
    variables: { mediaId },
  });
}
