import { useMediaCharacters } from '@/lib/client/hooks/react_query/graphql/use-media-characters';
import { Button, Grid } from '@yamada-ui/react';
import CharacterCard from './character-card';
import { debounce } from '@/lib/client/utils';

export default function MediaCharacters(props) {
  const { mediaId } = props;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetched } =
    useMediaCharacters(mediaId);

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
                  key={char.node.id}
                  id={char.node.id}
                  image={char.node.image.large}
                  name={char.node.name.userPreferred}
                  role={char.role}
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
