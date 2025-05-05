import { useBaseQuery } from '../base/use-base-query';

const FULL_MEDIA_QUERY = `query($mediaId: Int!) {
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
    isFavourite
		nextAiringEpisode {
			episode
			airingAt
		}
		title {
			userPreferred
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
export function useFullMediaById(mediaId) {
  return useBaseQuery({
    key: ['fullMedia', mediaId],
    query: FULL_MEDIA_QUERY,
    variables: { mediaId },
  });
}

const SMALL_MEDIA_QUERY = `query($mediaId: Int!) {
	Media(id: $mediaId) {
    id
		title {
			userPreferred
		}
    coverImage {
      extraLarge
    }
	}
}`;

export function useSmallMediaById(mediaId) {
  return useBaseQuery({
    key: ['smallMedia', mediaId],
    query: SMALL_MEDIA_QUERY,
    variables: { mediaId },
    enabled: !!mediaId,
  });
}
