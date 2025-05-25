import { useMediaReviewsPaginated } from '@/lib/client/hooks/react_query/get/media/review/paginated';
import {
  Button,
  Center,
  ContextMenu,
  ContextMenuTrigger,
  Loading,
  MenuItem,
  MenuList,
} from '@yamada-ui/react';
import ReviewCard from './review-card';
import { PencilIcon, Trash2Icon } from '@yamada-ui/lucide';

export default function ReviewList({
  subjectType,
  mediaId,
  mediaType,
  setCurrentReviewMetadata,
  onDrawerOpen,
  setDelReview,
  onOpenReviewDeleteModal,
}) {
  const viewReviews = useMediaReviewsPaginated({
    mediaId,
    mediaType,
    subjectType,
  });

  function handleUpdate(review) {
    onDrawerOpen();
    setCurrentReviewMetadata({ id: review.id });
  }

  return (
    <>
      {viewReviews.data.pages
        .flatMap((page) => page.data.reviews)
        .map((review) => {
          return (
            <ContextMenu key={review.id}>
              <ContextMenuTrigger as={Center} w="full" rounded="md">
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
        })}

      {viewReviews.hasNextPage && (
        <Button
          w={'full'}
          mt={'2'}
          onClick={() => {
            if (viewReviews.hasNextPage && !viewReviews.isFetchingNextPage) {
              viewReviews.fetchNextPage();
            }
          }}
          disabled={viewReviews.isFetchingNextPage || !viewReviews.hasNextPage}
          visibility={
            !viewReviews.isFetchingNextPage &&
            !viewReviews.hasNextPage &&
            'collapse'
          }
        >
          {viewReviews.isFetchingNextPage ? (
            <Loading variant="dots" />
          ) : (
            'Load More'
          )}
        </Button>
      )}
    </>
  );
}
