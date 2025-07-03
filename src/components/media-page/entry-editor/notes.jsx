import { FormControl, Textarea } from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';

export default function EntryNotes() {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <FormControl
      label="Notes"
      invalid={!!errors.notes}
      errorMessage={errors.notes ? errors.notes.message : undefined}
    >
      <Controller
        control={control}
        name="notes"
        render={({ field }) => (
          <Textarea autosize minRows={4} maxRows={10} {...field} />
        )}
      />
    </FormControl>
  );
}
