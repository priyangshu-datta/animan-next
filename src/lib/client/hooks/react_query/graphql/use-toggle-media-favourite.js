import { useBaseMutation } from '../base/use-base-mutation';

const QUERY = (_strings, subjectType) => {
  return `mutation ToggleFavourite($mediaId: Int) {
  ToggleFavourite(${subjectType}Id: $mediaId) {
    ${subjectType} {
      nodes {
        id
      }
    }
  }
}
`;
};

export function useToggleFavourite(subjectType) {
  return useBaseMutation({
    query: QUERY`${subjectType.toLowerCase()}`,
  });
}
