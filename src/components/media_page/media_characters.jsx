import { useInfiniteCharacters } from '@/lib/client/hooks/react_query/useInfiniteCharacters';
import { Button, Grid } from '@yamada-ui/react';
import CharacterCard from '../character_card';

const debounce = (func, delay) => {
  let timerId;

  return (...args) => {
    if (timerId) clearTimeout(timerId);

    timerId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export default function MediaCharacters(props) {
  const { mediaId } = props;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetched } =
    useInfiniteCharacters(mediaId);

  const fetchMore = debounce(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  return (
    <>
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
          ? (data?.pages.flatMap((page) => page.characters) ?? []).map(
              (char) => (
                <CharacterCard
                  key={char.id}
                  image={char.image.large}
                  name={char.name.full}
                />
              )
            )
          : 'Loading...'}

        <Button
          onClick={fetchMore}
          disabled={isFetchingNextPage || !hasNextPage}
        >
          {isFetchingNextPage
            ? 'Loading more...'
            : hasNextPage
            ? 'Load More'
            : 'Nothing more to load'}
        </Button>
      </Grid>
    </>
  );
}
