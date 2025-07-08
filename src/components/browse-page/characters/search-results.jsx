import { useSearchResults } from "@/lib/client/hooks/react_query/get/search-results"
import { debounce } from '@/utils/general'
import {
  Box,
  Button,
  EmptyState,
  EmptyStateTitle,
  Flex,
  Image,
  Link,
  Loading,
  Text
} from '@yamada-ui/react'
import NextLink from 'next/link'
import { useMemo } from 'react'

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

  const characterCardDetails = useMemo(
    () => (isFetched ? data.pages.flatMap((page) => page.searchResults) : []),
    [data, isFetched]
  );

  return (
    <>
      <Flex
        w={'full'}
        gap={'4'}
        p={'4'}
        justifyContent="center"
        wrap="wrap"
        mt="2"
      >
        {isFetched ? (
          characterCardDetails.length < 1 ? (
            <EmptyState>
              <EmptyStateTitle>No results found</EmptyStateTitle>
            </EmptyState>
          ) : (
            characterCardDetails.map(({ character }) => {
              return (
                <Box
                  aspectRatio={0.61805}
                  w="36"
                  boxShadow={'2xl'}
                  flexShrink={0}
                  position={'relative'}
                  key={character.id}
                >
                  <Image
                    w="full"
                    h="full"
                    objectFit={'cover'}
                    objectPosition={'center'}
                    src={character.image.large}
                    alt={character.name.userPreferred}
                  />

                  <Link as={NextLink} href={`/character?id=${character.id}`}>
                    <Text
                      bgGradient={
                        'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))'
                      }
                      color={'white'}
                      position={'absolute'}
                      bottom={0}
                      fontWeight={'bold'}
                      lineClamp={2}
                      p="2"
                      w="full"
                      fontSize={'lg'}
                    >
                      {character.name.userPreferred}
                    </Text>
                  </Link>
                </Box>
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