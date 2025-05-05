import { useViewReviews } from '@/lib/client/hooks/react_query/review/media/use-view-reviews';
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
import { useEffect } from 'react';

export default function ReviewList({
  subjectType,
  mediaId,
  mediaType,
  setEditorContext,
  onDrawerOpen,
  setDelReview,
  onOpenReviewDeleteModal,
}) {
  const viewReviews = useViewReviews({
    mediaId,
    mediaType,
    subjectType,
  });

  function handleUpdate(review) {
    const editorContext = {
      id: review.id,
      unit: mediaType === 'ANIME' ? review.episodeNumber : review.chapterNumber,
      rating: review.rating,
      emotions: (review.emotions ?? '').split(';').filter((s) => s.length),
      review: review.reviewText,
      favourite: review.favourite,
      subject: review.subjectType,
      volume: review.volume,
    };

    setEditorContext(editorContext);
    onDrawerOpen();
  }

  return viewReviews.isFetching ? (
    <Loading fontSize={'lg'} />
  ) : (
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
