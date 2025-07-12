import { useMediaReviewsPaginated } from '@/lib/client/hooks/react_query/get/media/review/paginated';
import {
  Button,
  Center,
  ContextMenu,
  ContextMenuTrigger,
  EmptyState,
  EmptyStateTitle,
  Grid,
  Loading,
  MenuItem,
  MenuList,
  Select,
  Skeleton,
  Text,
} from '@yamada-ui/react';
import ReviewCard from './review-card';
import { PencilIcon, Trash2Icon } from '@yamada-ui/lucide';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useMedia } from '@/context/use-media';
import { REVIEW_CATEGORIES } from '@/lib/constants';
import { useSearchParams } from 'next/navigation';

export default function ReviewList({
  mediaId,
  mediaType,
  setCurrentReviewMetadata,
  onDrawerOpen,
  setDelReview,
  onOpenReviewDeleteModal,
}) {
  const media = useMedia();
  const searchParams = useSearchParams();

  const [subjectType, setSubjectType] = useState(
    searchParams.get('reviewType') ??
      (media.type === 'ANIME'
        ? 'episode'
        : media.type === 'MANGA'
        ? 'chapter'
        : undefined)
  );

  const { data, isFetchingNextPage, hasNextPage, isFetched } =
    useMediaReviewsPaginated({
      mediaId,
      mediaType,
      subjectType,
    });

  function handleUpdate(review) {
    setCurrentReviewMetadata({ id: review.id });
    onDrawerOpen();
  }

  const reviews = useMemo(
    () => (isFetched ? data.pages.flatMap((page) => page.data.reviews) : []),
    [data]
  );

  useLayoutEffect(() => {
    if (data) {
      document
        .getElementById(window.location.hash.replace('#', ''))
        ?.scrollIntoView();
    }
  }, [data]);

  return (
    <>
      <Select
        value={subjectType}
        onChange={(option) => {
          const newSearchParams = new URLSearchParams();
          newSearchParams.set('tabIndex', searchParams.get('tabIndex'));
          newSearchParams.set('id', media.id);
          newSearchParams.set('type', media.type);
          newSearchParams.set('reviewType', option);

          window.history.replaceState(
            null,
            '',
            `?${newSearchParams.toString()}`
          );

          setSubjectType(option);
        }}
        items={
          REVIEW_CATEGORIES[
            media.type?.toLowerCase() ?? searchParams.get('type').toLowerCase()
          ]
        }
      />
      <Grid gap={'2'}>
        {isFetched ? (
          reviews.length > 0 ? (
            reviews.map((review) => {
              return (
                <ContextMenu key={review.id}>
                  <ContextMenuTrigger as={Center} w="full" rounded="md">
                    <Text id={review.id}></Text>
                    <ReviewCard review={review} key={review.id} />
                  </ContextMenuTrigger>
                  <MenuList>
                    <MenuItem
                      icon={<PencilIcon />}
                      onClick={() => handleUpdate(review)}
                    >
                      Edit
                    </MenuItem>
                    <MenuItem
                      icon={<Trash2Icon color={'red'} />}
                      color={'red'}
                      onClick={() => {
                        setDelReview(review);
                        onOpenReviewDeleteModal();
                      }}
                    >
                      Remove
                    </MenuItem>
                  </MenuList>
                </ContextMenu>
              );
            })
          ) : (
            <EmptyState>
              <EmptyStateTitle>No reviews yet</EmptyStateTitle>
            </EmptyState>
          )
        ) : (
          Array.from({ length: 5 }).map(() => (
            <Skeleton w={'full'} h={'20'} key={Math.random()} />
          ))
        )}
      </Grid>

      {hasNextPage && (
        <Button
          w={'full'}
          mt={'2'}
          onClick={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          disabled={isFetchingNextPage || !hasNextPage}
          visibility={!isFetchingNextPage && !hasNextPage && 'collapse'}
        >
          {isFetchingNextPage ? <Loading variant="dots" /> : 'Load More'}
        </Button>
      )}
    </>
  );
}
