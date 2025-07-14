import MediaCard from '@/components/media-card';
import { useSearchResults } from '@/lib/client/hooks/react_query/get/search-results';
import { debounce } from '@/utils/general';
import {
  Button,
  EmptyState,
  EmptyStateTitle,
  Flex,
  Loading,
} from '@yamada-ui/react';
import { useMemo } from 'react';

export function SearchResults({ searchOptions, entryStatus }) {
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetched } =
    useSearchResults({
      searchOptions,
    });

  const fetchMore = debounce(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  const mediaCardDetails = useMemo(
    () => (isFetched ? data.pages.flatMap((page) => page.searchResults) : []),
    [data, isFetched]
  );

  return (
    <>
      <Flex w={'full'} gap={'4'} p={'2'} justify="center" wrap="wrap">
        {isFetched ? (
          mediaCardDetails.length < 1 ? (
            <EmptyState>
              <EmptyStateTitle>No results found</EmptyStateTitle>
            </EmptyState>
          ) : (
            mediaCardDetails
              .filter(({ entry }) => {
                if (entryStatus === 'all') {
                  return true;
                }
                return entry?.status === entryStatus;
              })
              .map(({ entry, media }) => {
                return <MediaCard entry={entry} media={media} key={media.id} />;
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
