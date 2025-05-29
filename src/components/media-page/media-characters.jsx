import { useMediaCharacters } from '@/lib/client/hooks/react_query/get/media/related/characters';
import { debounce, fuzzyRegexMatch } from '@/utils/general';
import { Box, Button, Grid, Input, Loading, Skeleton } from '@yamada-ui/react';
import CharacterCard from './character-card';
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

export default function MediaCharacters(props) {
  const { mediaId, mediaType } = props;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetched } =
    useMediaCharacters({ mediaId, mediaType });

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
      const searchData = data?.pages.flatMap((page) => page.characters) ?? [];

      const indices = fuzzySearchGrouped(
        debouncedSearchTerm,
        searchData.map((character) => {
          return [
            character.name.full,
            character.name.native,
            character.name.userPreferred,
            ...character.name.alternative,
            // character.name.alternativeSpoiler
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
        placeholder="Search related Characters"
        onChange={(ev) => setSearchTerm(ev.target.value)}
      />
      <Grid
        h="full"
        overflow={'auto'}
        templateColumns={{
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
          xl: 'repeat(4, 1fr)',
          base: 'repeat(5, 1fr)',
        }}
        gap="md"
      >
        {isFetched
          ? searchResult.length
            ? searchResult.map((character) => (
                <CharacterCard key={character.id} character={character} />
              ))
            : 'No result.'
          : Array.from({ length: 5 }).map(() => (
              <Box key={Math.random()} padding={'4'}>
                <Skeleton h={'xs'} w={'150px'} />
              </Box>
            ))}
      </Grid>

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
    </>
  );
}
