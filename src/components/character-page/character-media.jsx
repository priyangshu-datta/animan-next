import { useCharacterMedia } from '@/lib/client/hooks/react_query/get/character/related/media';
import { debounce, fuzzyRegexMatch } from '@/utils/general';
import { Box, Button, Grid, Input, Skeleton } from '@yamada-ui/react';
import MediaCard from './media-card';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/lib/client/hooks/use-debounce';

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

export default function CharacterMedia({ characterId, mediaType, style }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetched } =
    useCharacterMedia({ characterId, mediaType });

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
      <Input
        placeholder="Search related Media"
        onChange={(ev) => setSearchTerm(ev.target.value)}
      />

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
                <MediaCard key={media.id} media={media} style={style} />
              ))
            : 'No result.'
          : Array.from({ length: 5 }).map(() => (
              <Box key={Math.random()} padding={'4'}>
                <Skeleton
                  h={style === 'list' ? '24' : 'xs'}
                  w={style === 'list' ? 'full' : '150px'}
                />
              </Box>
            ))}

        {hasNextPage && (
          <Button
            w={'full'}
            mt={'2'}
            onClick={fetchMore}
            disabled={isFetchingNextPage || !hasNextPage}
          >
            {isFetchingNextPage ? <Loading variant="grid" /> : 'Load More'}
          </Button>
        )}
      </Grid>
    </>
  );
}
