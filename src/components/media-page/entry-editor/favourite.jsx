import { HeartIcon } from '@yamada-ui/lucide';
import { Toggle } from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';

export default function Favourite() {
  const { control } = useFormContext();
  return (
    <Controller
      name="favourite"
      control={control}
      render={({ field }) => (
        <Toggle
          borderRadius={'full'}
          selected={field.value}
          colorScheme="red"
          variant={'solid'}
          icon={<HeartIcon />}
          {...field}
          onChange={(selected) => field.onChange(selected)}
        />
      )}
    />
  );
}
