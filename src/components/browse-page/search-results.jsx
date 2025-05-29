import { useSearchResults } from '@/lib/client/hooks/react_query/get/search-results';
import { debounce, sentenceCase } from '@/utils/general';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataList,
  DataListDescription,
  DataListItem,
  DataListTerm,
  Grid,
  Image,
  Skeleton,
  Text,
  Tooltip,
} from '@yamada-ui/react';
import Link from 'next/link';

export function SearchResults({ searchOptions }) {
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetched } =
    useSearchResults({
      searchOptions,
    });

  const fetchMore = debounce(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  return (
    <>
      <Grid
        w={'full'}
        gap={'4'}
        p={'2'}
        placeItems={'center'}
        gridTemplateColumns={'repeat(auto-fill, minmax(220px, 1fr))'}
      >
        {isFetched
          ? data.pages
              .flatMap((page) => page.searchResults)
              .map((result) => {
                return (
                  <Card maxW="md" variant={'outline'} key={result.id}>
                    <CardHeader>
                      <Image
                        src={result.coverImage.extraLarge}
                        objectFit="cover"
                        minW={'40'}
                        maxW={'80'}
                        w="full"
                        aspectRatio={2 / 3}
                        alt={result.title.userPreferred}
                      />
                    </CardHeader>
                    <CardBody>
                      <Tooltip label={result.title.userPreferred}>
                        <Link
                          href={`/media?id=${result.id}&type=${result.type}`}
                        >
                          <Text lineClamp={1} fontSize={'xl'}>
                            {result.title.userPreferred}
                          </Text>
                        </Link>
                      </Tooltip>
                      <DataList
                        col={2}
                        variant={'subtle'}
                        size={{ base: 'lg' }}
                        gapY={{ base: '4', lg: '2' }}
                      >
                        <DataListItem>
                          <DataListTerm>
                            {result.status === 'RELEASING' &&
                            result.type !== 'MANGA'
                              ? 'Time Left'
                              : 'Status'}
                          </DataListTerm>
                          <DataListDescription>
                            {sentenceCase(result.status.replaceAll('_', ' '))}
                          </DataListDescription>
                        </DataListItem>
                      </DataList>
                    </CardBody>
                  </Card>
                );
              })
          : Array.from({ length: 5 }).map(() => (
              <Box key={Math.random()} padding={'4'}>
                <Skeleton h={'xs'} w={'150px'} />
              </Box>
            ))}
      </Grid>
      <Button
        w={'full'}
        onClick={fetchMore}
        disabled={isFetchingNextPage || !hasNextPage}
        visibility={!isFetchingNextPage && !hasNextPage && 'collapse'}
      >
        {isFetchingNextPage ? 'Loading more...' : hasNextPage && 'Load More'}
      </Button>
    </>
  );
}
