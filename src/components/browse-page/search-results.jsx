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
  EmptyState,
  EmptyStateTitle,
  Flex,
  Grid,
  Image,
  Loading,
  Skeleton,
  Text,
  Tooltip,
} from '@yamada-ui/react';
import Link from 'next/link';
import { useMemo } from 'react';
import MediaCard from '../media-card';

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
            mediaCardDetails.map(({ entry, media }) => {
              return (
                <MediaCard entry={entry} media={media} key={media.id} />
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
