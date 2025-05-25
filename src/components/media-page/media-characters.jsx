import { useMediaCharacters } from '@/lib/client/hooks/react_query/get/media/related/characters';
import { debounce } from '@/utils/general';
import { Button, Grid, Loading } from '@yamada-ui/react';
import CharacterCard from './character-card';

export default function MediaCharacters(props) {
  const { mediaId, mediaType } = props;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMediaCharacters({ mediaId, mediaType });

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
        {(data?.pages.flatMap((page) => page.characters) ?? []).map((char) => (
          <CharacterCard
            key={char.node.id}
            id={char.node.id}
            image={char.node.image.large}
            name={char.node.name.userPreferred}
            role={char.role}
          />
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
