import { FormControl, Input } from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';

export default function VolumeProgress() {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <FormControl
      label="Volume Progress"
      invalid={!!errors.vlProgress}
      errorMessage={errors.vlProgress ? errors.vlProgress.message : undefined}
    >
      <Controller
        name="vlProgress"
        control={control}
        rules={{
          min: {
            value: 0,
            message: 'Volume Progress cannot be negative',
          },
        }}
        render={({ field }) => (
          <Input
            type="number"
            min={0}
            step={1}
            {...field}
            onChange={(e) => {
              field.onChange(parseInt(e.target.value));
            }}
          />
        )}
      />
    </FormControl>
  );
}
