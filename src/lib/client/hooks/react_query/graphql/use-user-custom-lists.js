import { useBaseQuery } from '../base/use-base-query';

const QUERY = (_strings, mediaTypeExp) => {
  return `query {
	Viewer {
		mediaListOptions {
			${mediaTypeExp}List {
				customLists
			}
		}
	}
}
`;
};

export function useUserCustomLists(mediaType) {
  return useBaseQuery({
    key: ['customLists', mediaType],
    query: QUERY`${mediaType}`,
  });
}
