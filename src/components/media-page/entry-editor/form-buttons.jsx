import { Button } from '@yamada-ui/react';
import { useFormContext } from 'react-hook-form';

export default function FormButtons({
  mediaEntry,
  onEntryEditorClose,
  onOpen,
}) {
  const {
    formState: { isDirty, isSubmitting },
    reset,
  } = useFormContext();
  return (
    <>
      {mediaEntry?.data?.data?.id && (
        <Button
          colorScheme={'red'}
          onClick={() => {
            onOpen();
          }}
        >
          Delete
        </Button>
      )}
      <Button variant="ghost" onClick={onEntryEditorClose}>
        Close
      </Button>
      <Button
        variant="outline"
        disabled={!isDirty | isSubmitting}
        onClick={() => {
          reset();
        }}
      >
        Reset
      </Button>
      <Button
        type="submit"
        colorScheme="primary"
        disabled={!isDirty | isSubmitting}
      >
        Save
      </Button>
    </>
  );
}
