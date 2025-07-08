import { useSearchResults } from '@/lib/client/hooks/react_query/get/search-results';
import { debounce } from '@/utils/general';
import {
  Box,
  Button,
  Card,
  CardBody,
  EmptyState,
  EmptyStateTitle,
  Flex,
  Image,
  Link,
  Loading,
  Text,
} from '@yamada-ui/react';
import NextLink from 'next/link';
import { useMemo } from 'react';

export default function SearchResults({ searchOptions }) {
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetched } =
    useSearchResults({
      searchOptions,
    });

  const fetchMore = debounce(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  const studioCardDetails = useMemo(
    () => (isFetched ? data.pages.flatMap((page) => page.searchResults) : []),
    [data, isFetched]
  );

  return (
    <>
      <Flex
        w={'full'}
        // gap={'2'}
        // p={'4'}
        justifyContent="center"
        wrap="wrap"
        mt="2"
      >
        {isFetched ? (
          studioCardDetails.length < 1 ? (
            <EmptyState>
              <EmptyStateTitle>No results found</EmptyStateTitle>
            </EmptyState>
          ) : (
            studioCardDetails.map(({ studio }) => {
              return (
                <Card
                  w={{ md: 'full', base: '50%' }}
                  flexShrink={0}
                  position={'relative'}
                  key={studio.id}
                >
                  <CardBody>
                    <Link as={NextLink} href={`/studio?id=${studio.id}`}>
                      <Text
                        bottom={0}
                        fontWeight={'bold'}
                        lineClamp={2}
                        p="2"
                        w="full"
                        fontSize={'lg'}
                      >
                        {studio.name}
                      </Text>
                    </Link>
                  </CardBody>
                </Card>
              );
            })
          )
        ) : (
          <Loading fontSize={'lg'} />
        )}
      </Flex>
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
