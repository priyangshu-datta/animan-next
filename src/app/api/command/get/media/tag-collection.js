import { ANILIST_GRAPHQL_ENDPOINT } from '@/lib/constants';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';

export async function getMediaTagCollection() {
  const MEDIA_TAG_COLLECTION_QUERY = `query {
	MediaTagCollection {
    id
		name
		category
		description
		isAdult
	}
}`;

  const respone = await axios.post(ANILIST_GRAPHQL_ENDPOINT, {
    query: MEDIA_TAG_COLLECTION_QUERY,
  });

  return respondSuccess({ tags: respone.data.data.MediaTagCollection });
}
