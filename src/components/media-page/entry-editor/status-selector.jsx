import { MEDIA_ENTRY_STATUS } from '@/lib/constants'
import { FormControl, Select } from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';

export default function EntryStatus({ mediaType }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <FormControl
      invalid={!!errors.select}
      label="Status"
      errorMessage={errors.select ? errors.select.message : undefined}
    >
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Select
            placeholderInOptions={false}
            placeholder="Status"
            {...field}
            items={MEDIA_ENTRY_STATUS[mediaType.toLowerCase()]}
          />
        )}
      />
    </FormControl>
  );
}
