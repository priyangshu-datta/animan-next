import { useMedia } from '@/context/use-media';
import { useUpdateUserMedia } from '@/lib/client/hooks/react_query/patch/user/media';
import { MEDIA_ENTRY_STATUS } from '@/lib/constants';
import { CalendarIcon } from '@yamada-ui/lucide';
import {
  Button,
  HStack,
  IconButton,
  Loading,
  Separator,
  useNotice,
} from '@yamada-ui/react';
import ReviewButtonGroup from './review-button';
import UpdateMediaProgress from './update-progress';

function PlanningComponent({ isPending, mutate }) {
  const media = useMedia();
  return (
    <Button
      disabled={isPending}
      onClick={() => {
        mutate({
          mediaId: media.id,
          mediaType: media.type,
          status: 'CURRENT',
        });
      }}
      size="sm"
    >
      {isPending ? (
        <Loading />
      ) : (
        `Start ${
          MEDIA_ENTRY_STATUS[media.type?.toLowerCase()]?.find(
            ({ value }) => value === 'CURRENT'
          )?.label
        }`
      )}
    </Button>
  );
}

export default function ActionButtons({
  onEntryEditorOpen,
  onReviewEditorOpen,
  setCurrentReviewMetadata,
}) {
  const media = useMedia();
  const notice = useNotice();

  const { mutate, isPending } = useUpdateUserMedia({
    handleSuccess: () => {
      notice({
        status: 'success',
        description: 'Media Entry Updated',
        isClosable: true,
      });
    },
    handleError: (error) => {
      notice({
        status: 'error',
        description: error.message,
        title: error.name,
        isClosable: true,
      });
    },
  });

  const components = {
    DEFAULT: (
      <IconButton
        disabled={isPending}
        icon={<CalendarIcon />}
        onClick={() => {
          mutate({
            mediaId: media.id,
            mediaType: media.type,
            status: 'PLANNING',
          });
        }}
        size="sm"
      />
    ),
    CURRENT: (
      <>
        <UpdateMediaProgress isPending={isPending} mutate={mutate} />
        <ReviewButtonGroup
          disabled={isPending}
          onReviewEditorOpen={onReviewEditorOpen}
          setCurrentReviewMetadata={setCurrentReviewMetadata}
        />
      </>
    ),

    REPEATING: (
      <>
        <UpdateMediaProgress isPending={isPending} mutate={mutate} />
        <ReviewButtonGroup
          disabled={isPending}
          onReviewEditorOpen={onReviewEditorOpen}
          setCurrentReviewMetadata={setCurrentReviewMetadata}
        />
      </>
    ),

    PLANNING: <PlanningComponent isPending={isPending} mutate={mutate} />,

    PAUSED: (
      <>
        <PlanningComponent isPending={isPending} mutate={mutate} />
        <ReviewButtonGroup
          disabled={isPending}
          onReviewEditorOpen={onReviewEditorOpen}
          setCurrentReviewMetadata={setCurrentReviewMetadata}
        />
      </>
    ),

    COMPLETED: (
      <ReviewButtonGroup
        disabled={isPending}
        onReviewEditorOpen={onReviewEditorOpen}
        setCurrentReviewMetadata={setCurrentReviewMetadata}
      />
    ),

    DROPPED: (
      <ReviewButtonGroup
        disabled={isPending}
        onReviewEditorOpen={onReviewEditorOpen}
        setCurrentReviewMetadata={setCurrentReviewMetadata}
      />
    ),
  };

  return (
    <HStack wrap={'wrap'}>
      {media.isLoading ? (
        <Loading />
      ) : (
        <>
          {media.status === 'NOT_YET_RELEASED' ? (
            media.entry?.status !== 'PLANNING' && (
              <>
                {components['DEFAULT']}
                <Separator orientation="vertical" h={'20px'} />
              </>
            )
          ) : media.entry ? (
            <>
              {components[media.entry.status]}
              <Separator orientation="vertical" h={'20px'} />
            </>
          ) : (
            <>
              {components['PLANNING']} {components['DEFAULT']}
              <Separator orientation="vertical" h={'20px'} />
            </>
          )}

          <Button onClick={onEntryEditorOpen} variant={'outline'} size="sm">
            {media.entry ? 'Update entry' : 'Track'}
          </Button>
        </>
      )}
    </HStack>
  );
}
