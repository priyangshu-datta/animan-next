import { Button } from '@yamada-ui/react';
import { useFormContext } from 'react-hook-form';

export function Footer({ onReviewEditorClose, isPending }) {
  const {
    reset,
    formState: { isDirty },
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
        disabled={!isDirty || isPending}
        onClick={() => {
          reset();
        }}
      >
        Reset
      </Button>
      <Button
        type="submit"
        colorScheme="primary"
        disabled={!isDirty || isPending}
      >
        Sav{isPending ? 'ing' : 'e'}
      </Button>
    </>
  );
}
