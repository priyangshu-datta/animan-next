import { useCharacterReviewsPaginated } from '@/lib/client/hooks/react_query/get/character/review/paginated';
import { PencilIcon, Trash2Icon } from '@yamada-ui/lucide';
import {
  Button,
  Center,
  ContextMenu,
  ContextMenuTrigger,
  Grid,
  MenuItem,
  MenuList,
  Skeleton,
} from '@yamada-ui/react';
import { Suspense } from 'react';
import ReviewCard from './review-card';

export default function ReviewList({
  characterId,
  setCurrentReviewMetadata,
  onDrawerOpen,
  setDelReview,
  onOpenReviewDeleteModal,
}) {
  const viewReviews = useCharacterReviewsPaginated({ characterId });

  function handleUpdate(review) {
    setCurrentReviewMetadata({ id: review.id });
    onDrawerOpen();
  }

  return (
    <>
      <Grid gap={'2'}>
        {viewReviews.data.pages
          .flatMap((page) => page.data.reviews)
          .map((review) => {
            return (
              <ContextMenu key={review.id}>
                <ContextMenuTrigger as={Center} w="full" rounded="md">
                  <Suspense fallback={<Skeleton h={'32'} />}>
                    <ReviewCard review={review} key={review.id} />
                  </Suspense>
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
          })}
      </Grid>

      <Button
        onClick={() => {
          if (viewReviews.hasNextPage && !viewReviews.isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        disabled={viewReviews.isFetchingNextPage || !viewReviews.hasNextPage}
        visibility={
          !viewReviews.isFetchingNextPage &&
          !viewReviews.hasNextPage &&
          'collapse'
        }
      >
        {viewReviews.isFetchingNextPage
          ? 'Loading more...'
          : viewReviews.hasNextPage && 'Load More'}
      </Button>
    </>
  );
}
