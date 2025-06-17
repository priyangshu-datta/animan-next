import { assocMedia } from '@/stores/assoc-media';
import { Button } from '@yamada-ui/react';
import { useFormContext } from 'react-hook-form';

export function Footer({ onReviewEditorClose }) {
  const {
    reset,
    formState: { isDirty, isSubmitting },
  } = useFormContext();

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => {
          onReviewEditorClose();
        }}
      >
        Close
      </Button>
      <Button
        disabled={!isDirty || isSubmitting}
        onClick={() => {
          reset();
          assocMedia.getState().reset();
        }}
      >
        Reset
      </Button>
      <Button
        type="submit"
        colorScheme="primary"
        disabled={!isDirty || isSubmitting}
      >
        Save
      </Button>
    </>
  );
}
