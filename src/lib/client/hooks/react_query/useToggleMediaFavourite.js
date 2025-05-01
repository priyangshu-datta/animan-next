import { useBaseMutation } from '../useBaseMutation';

const QUERY = (_strings, mediaTypeExp) => {
  return `mutation ToggleFavourite($mediaId: Int) {
  ToggleFavourite(${mediaTypeExp}Id: $mediaId) {
    ${mediaTypeExp} {
      nodes {
        id
      }
    }
  }
}
`;
};

export function useToggleMediaFavourite(mediaType) {
  return useBaseMutation({
    query: QUERY`${mediaType}`,
  });
}
