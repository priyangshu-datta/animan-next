import { useMediaReviewsPaginated } from '@/lib/client/hooks/react_query/get/media/review/paginated';
import {
  Button,
  Center,
  ContextMenu,
  ContextMenuTrigger,
  Grid,
  Loading,
  MenuItem,
  MenuList,
  Skeleton,
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

  return (
    <>
      <Grid gap={'2'}>
        {isFetched
          ? data.pages
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
              })
          : Array.from({ length: 5 }).map(() => (
              <Skeleton w={'full'} h={'20'} />
            ))}
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
