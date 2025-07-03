import { FormControl, Input } from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';

export default function EntryRepeatCounter() {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <FormControl
      label="Repeat"
      invalid={!!errors.repeat}
      errorMessage={errors.repeat ? errors.repeat.message : undefined}
    >
      <Controller
        control={control}
        name="repeat"
        rules={{
          min: {
            value: 0,
            message: 'Repeat count cannot go below 0',
          },
        }}
        render={({ field }) => (
          <Input
            type="number"
            min={0}
            {...field}
            onChange={(e) => {
              field.onChange(parseFloat(e.target.value));
            }}
          />
        )}
      />
    </FormControl>
  );
}
