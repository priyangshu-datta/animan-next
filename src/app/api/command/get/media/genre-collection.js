import { ANILIST_GRAPHQL_ENDPOINT } from '@/lib/constants';
import { respondSuccess } from '@/lib/server/responses';
import axios from 'axios';

export async function getMediaGenreCollection() {
  const MEDIA_GENRE_COLLECTION_QUERY = `query {
	GenreCollection
}`;

  const respone = await axios.post(ANILIST_GRAPHQL_ENDPOINT, {
    query: MEDIA_GENRE_COLLECTION_QUERY,
  });

  return respondSuccess({ genres: respone.data.data.GenreCollection });
}
