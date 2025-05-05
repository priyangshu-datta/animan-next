import { useCharacterMedia } from '@/lib/client/hooks/react_query/graphql/use-character-media';
import { debounce } from '@/lib/client/utils';
import { Button, Grid, Input } from '@yamada-ui/react';
import MediaCard from './media-card';
import { useEffect, useState } from 'react';

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

function fuzzySearchGrouped(query, data) {
  const results = [];

  for (let i = 0; i < data.length; i++) {
    for (const item of data[i]) {
      const match = fuzzyRegexMatch(query, item);
      if (match) {
        results.push(i);
        break;
      }
    }
  }

  return results;
}

function fuzzyRegexMatch(query, target) {
  const pattern = query
    .split('')
    .map((ch) => ch.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')) // escape regex chars
    .join('.*?'); // non-greedy wildcard between letters

  const regex = new RegExp(pattern, 'i'); // case-insensitive
  return regex.test(target);
}

export default function CharacterMedia(props) {
  const { characterId, mediaType, style, setAssociatedMedia } = props;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetched } =
    useCharacterMedia(characterId, mediaType);

  const fetchMore = debounce(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const debouncedSearchTerm = useDebounce(searchTerm);

  useEffect(() => {
    if (isFetched) {
      const searchData = data?.pages.flatMap((page) => page.media) ?? [];

      const indices = fuzzySearchGrouped(
        debouncedSearchTerm,
        searchData.map((media) => {
          return [
            media.title.romaji,
            media.title.native,
            media.title.english,
            media.title.userPreferred,
            // media.description,
          ];
        })
      );
      setSearchResult(indices.map((i) => searchData[i]));
    }
  }, [
    data,
    isFetched,
    setSearchResult,
    fuzzySearchGrouped,
    debouncedSearchTerm,
  ]);

  return (
    <>
      <Input onChange={(ev) => setSearchTerm(ev.target.value)} />

      <Grid
        overflow={'auto'}
        w={'full'}
        templateColumns={
          style === 'list'
            ? { base: '1fr' }
            : {
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
                xl: 'repeat(4, 1fr)',
                base: 'repeat(5, 1fr)',
              }
        }
        gap="md"
      >
        {isFetched
          ? searchResult.length
            ? searchResult.map((media) => (
                <MediaCard
                  key={media.id}
                  media={media}
                  style={style}
                  setAssociatedMedia={setAssociatedMedia}
                />
              ))
            : 'No result.'
          : 'Loading...'}

        <Button
          onClick={fetchMore}
          disabled={isFetchingNextPage || !hasNextPage}
          visibility={!isFetchingNextPage && !hasNextPage && 'collapse'}
        >
          {isFetchingNextPage ? 'Loading more...' : hasNextPage && 'Load More'}
        </Button>
      </Grid>
    </>
  );
}
